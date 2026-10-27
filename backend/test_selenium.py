import os
import sys
import time
import threading
import pytest
import uvicorn

# Ensure repository root is in sys.path
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from backend.main import app
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

SERVER_HOST = "127.0.0.1"
SERVER_PORT = 8089
BASE_URL = f"http://{SERVER_HOST}:{SERVER_PORT}"

@pytest.fixture(scope="session")
def live_server():
    """Starts a live uvicorn server in a background thread for the duration of the test session."""
    def run_uvicorn():
        uvicorn.run(app, host=SERVER_HOST, port=SERVER_PORT, log_level="warning")

    server_thread = threading.Thread(target=run_uvicorn, daemon=True)
    server_thread.start()

    # Wait until server is live and responding
    import requests
    max_retries = 30
    for _ in range(max_retries):
        try:
            res = requests.get(f"{BASE_URL}/api/health", timeout=1)
            if res.status_code == 200:
                break
        except Exception:
            pass
        time.sleep(0.3)
    else:
        pytest.fail("Live FastAPI backend server failed to initialize on port " + str(SERVER_PORT))

    yield BASE_URL

@pytest.fixture(scope="session")
def driver():
    """Initializes a headless Chrome browser driver."""
    opts = Options()
    opts.add_argument("--headless=new")
    opts.add_argument("--disable-gpu")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--window-size=1440,960")

    driver = webdriver.Chrome(options=opts)
    driver.implicitly_wait(6)
    yield driver
    driver.quit()

# ==============================================================================
# 1. Splash Screen & Transition to Authentication
# ==============================================================================
def test_selenium_splash_and_switch_to_login(driver, live_server):
    driver.get(live_server)

    # Wait for splash screen to auto-transition (~2.5s)
    wait = WebDriverWait(driver, 12)
    auth_elem = wait.until(
        EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Create Account') or contains(text(), 'Sign In') or contains(text(), 'Already registered')]"))
    )
    assert auth_elem is not None

    # If on Register page, click "Sign In to your account"
    try:
        sign_in_link = driver.find_element(By.XPATH, "//*[contains(text(), 'Sign In to your account') or contains(text(), 'Sign In')]")
        sign_in_link.click()
    except Exception:
        pass

    # Verify Login page is displayed
    login_header = wait.until(
        EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'FixLink Portal Login')]"))
    )
    assert login_header is not None
    assert "FixLink" in driver.title

# ==============================================================================
# 2. Resident User Login & Dashboard Verification
# ==============================================================================
def test_selenium_resident_login_and_dashboard(driver, live_server):
    wait = WebDriverWait(driver, 10)

    # Fill email & password
    email_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']")))
    email_input.clear()
    email_input.send_keys("user@fixlink.ai")

    password_input = driver.find_element(By.CSS_SELECTOR, "input[type='password']")
    password_input.clear()
    password_input.send_keys("password123")

    # Click submit
    submit_btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
    submit_btn.click()

    # Wait for User Dashboard
    welcome_banner = wait.until(
        EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Welcome back') or contains(text(), 'Babu M')]"))
    )
    assert welcome_banner is not None

    # Verify stats and actions
    dashboard_text = driver.find_element(By.TAG_NAME, "body").text
    assert "Active Repairs" in dashboard_text or "Active" in dashboard_text

# ==============================================================================
# 3. Multimodal AI Complaint Intake Flow
# ==============================================================================
def test_selenium_raise_complaint_ai_flow(driver, live_server):
    wait = WebDriverWait(driver, 10)

    # Navigate to Raise Complaint tab via persistent ID
    raise_tab_btn = wait.until(EC.element_to_be_clickable((By.ID, "nav-raise-btn")))
    raise_tab_btn.click()

    # Select "Text Description" mode via persistent ID
    text_mode_btn = wait.until(EC.element_to_be_clickable((By.ID, "mode-text-btn")))
    text_mode_btn.click()

    # Fill Title
    title_input = wait.until(
        EC.presence_of_element_located((By.XPATH, "//input[@placeholder and (contains(@placeholder, 'fan') or contains(@placeholder, 'Title') or @type='text')]"))
    )
    title_input.clear()
    title_input.send_keys("Ceiling fan motor sparking and high heat vibration")

    # Fill Description
    desc_textarea = driver.find_element(By.TAG_NAME, "textarea")
    desc_textarea.clear()
    desc_textarea.send_keys("The fan motor produces loud screeching noises, high sparks, and continuous burning smell.")

    # Click "Analyze & Diagnose with AI" button via persistent ID
    diagnose_btn = driver.find_element(By.ID, "btn-diagnose")
    diagnose_btn.click()

    # Wait for AI Confirmation Box
    ai_box = wait.until(
        EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Understanding') or contains(text(), 'UNSAFE') or contains(text(), 'Diagnostic')]"))
    )
    assert ai_box is not None

    # Submit ticket via persistent ID
    submit_ticket_btn = driver.find_element(By.ID, "btn-submit-ticket")
    submit_ticket_btn.click()

    # Wait for success toast or redirection to history page
    success_indicator = wait.until(
        EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'registered') or contains(text(), 'Maintenance order') or contains(text(), 'Recent Maintenance') or contains(text(), 'History')]"))
    )
    assert success_indicator is not None
    time.sleep(1)

# ==============================================================================
# 4. AI Conversational Troubleshooting Assistant
# ==============================================================================
def test_selenium_ai_chat_assistant(driver, live_server):
    wait = WebDriverWait(driver, 10)

    # Navigate to Chat Assistant tab via persistent ID
    chat_nav_btn = wait.until(EC.element_to_be_clickable((By.ID, "nav-chat-btn")))
    chat_nav_btn.click()

    # Type query in chat input via persistent ID
    chat_input = wait.until(EC.presence_of_element_located((By.ID, "chat-query-input")))
    chat_input.clear()
    chat_input.send_keys("My washroom pipe is leaking water rapidly under the sink")

    # Send message via persistent ID
    send_btn = wait.until(EC.element_to_be_clickable((By.ID, "chat-send-btn")))
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'}); arguments[0].click();", send_btn)

    # Wait for AI reply message bubble
    reply_elem = wait.until(
        EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'valve') or contains(text(), 'leak') or contains(text(), 'plumber')]"))
    )
    assert reply_elem is not None

# ==============================================================================
# 5. Complaint History & AI Service Report Modal
# ==============================================================================
def test_selenium_history_and_report_modal(driver, live_server):
    wait = WebDriverWait(driver, 10)

    # Navigate to History & Status tab via persistent ID
    history_tab_btn = wait.until(EC.element_to_be_clickable((By.ID, "nav-history-btn")))
    history_tab_btn.click()

    # Wait for complaint cards to render and click report button
    report_btn = wait.until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "button[data-testid='btn-open-report']"))
    )
    report_btn.click()

    try:
        # Wait for Report Modal to be fully rendered with report data
        modal_elem = wait.until(
            EC.visibility_of_element_located((By.CLASS_NAME, "modal-content"))
        )
        assert modal_elem is not None
        modal_text = modal_elem.text
        assert "Report" in modal_text or "Diagnostics" in modal_text or "Analysis" in modal_text
    finally:
        # Guarantee modal is closed cleanly so overlay is removed
        try:
            close_btn = driver.find_element(By.ID, "btn-close-report-top")
            close_btn.click()
        except Exception:
            try:
                driver.find_element(By.ID, "btn-close-report-bottom").click()
            except Exception:
                pass
        wait.until(EC.invisibility_of_element_located((By.CLASS_NAME, "modal-overlay")))

# ==============================================================================
# 6. Technician Portal Login & Availability Persistence
# ==============================================================================
def test_selenium_technician_dispatch_and_availability(driver, live_server):
    wait = WebDriverWait(driver, 10)

    # 1. Sign Out via persistent ID
    sign_out_btn = wait.until(EC.element_to_be_clickable((By.ID, "btn-signout")))
    sign_out_btn.click()

    # 2. Wait for Login screen
    wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'FixLink Portal Login')]")))

    # 3. Select Field Technician role tab
    tech_tab_btn = wait.until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Field Technician')]"))
    )
    tech_tab_btn.click()

    # 4. Fill technician credentials
    email_input = driver.find_element(By.CSS_SELECTOR, "input[type='email']")
    email_input.clear()
    email_input.send_keys("tech@fixlink.ai")

    password_input = driver.find_element(By.CSS_SELECTOR, "input[type='password']")
    password_input.clear()
    password_input.send_keys("password123")

    # 5. Sign In
    submit_btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
    submit_btn.click()

    # 6. Verify Technician Hub loads
    tech_hub = wait.until(
        EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Suresh Kumar') or contains(text(), 'DISPATCH HUB')]"))
    )
    assert tech_hub is not None

    # 7. Test Availability Switcher
    avail_toggle = wait.until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Set Busy') or contains(text(), 'Set Ready') or contains(text(), 'Busy') or contains(text(), 'Available')]"))
    )
    initial_text = avail_toggle.text
    avail_toggle.click()
    time.sleep(0.5)

    # Verify toggle text changed
    new_text = driver.find_element(By.XPATH, "//button[contains(text(), 'Set Busy') or contains(text(), 'Set Ready') or contains(text(), 'Busy') or contains(text(), 'Available')]").text
    assert new_text != initial_text

    # Toggle back
    driver.find_element(By.XPATH, "//button[contains(text(), 'Set Busy') or contains(text(), 'Set Ready') or contains(text(), 'Busy') or contains(text(), 'Available')]").click()
    time.sleep(0.3)

    # 8. Check Assigned Jobs tab via persistent ID
    jobs_nav_btn = wait.until(EC.element_to_be_clickable((By.ID, "nav-tech-jobs")))
    jobs_nav_btn.click()

    # Verify Jobs page renders
    jobs_title = wait.until(
        EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Active Dispatches') or contains(text(), 'Assigned Jobs') or contains(text(), 'Assigned Maintenance Jobs') or contains(text(), 'FIELD REPAIR QUEUE')]"))
    )
    assert jobs_title is not None

# ==============================================================================
# 7. Multilingual Switcher (Clean execution at end of flow)
# ==============================================================================
def test_selenium_language_switcher(driver, live_server):
    wait = WebDriverWait(driver, 10)

    # Find the language select in Navbar by ID
    lang_select = wait.until(EC.presence_of_element_located((By.ID, "lang-select")))

    # Dispatch React synthetic event for Tamil
    driver.execute_script(
        "arguments[0].value = 'ta'; arguments[0].dispatchEvent(new Event('change', { bubbles: true }));",
        lang_select
    )
    time.sleep(0.6)

    # Verify page contains Tamil text
    page_content = driver.find_element(By.TAG_NAME, "body").text
    assert "பராமரிப்பு" in page_content or "வேலைகள்" in page_content or "தமிழ்" in page_content or "முகப்பு" in page_content

    # Switch back to English and reset
    driver.execute_script(
        "arguments[0].value = 'en'; arguments[0].dispatchEvent(new Event('change', { bubbles: true }));",
        lang_select
    )
    time.sleep(0.6)
