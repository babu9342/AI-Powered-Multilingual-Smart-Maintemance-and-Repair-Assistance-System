import os
import sys
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

ARTIFACTS_DIR = r"C:\Users\BABU M\.gemini\antigravity-ide\brain\70601b60-a8e9-4744-8d8d-6db983bd844c"
BASE_URL = "http://localhost:5173"

def main():
    print("Initializing Chrome headless...", flush=True)
    opts = Options()
    opts.add_argument("--headless=new")
    opts.add_argument("--disable-gpu")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--window-size=1440,1050")

    driver = webdriver.Chrome(options=opts)
    wait = WebDriverWait(driver, 10)

    try:
        print(f"Navigating to {BASE_URL}...", flush=True)
        driver.get(BASE_URL)
        time.sleep(2)

        # Login directly with localStorage injection for maximum speed and reliability
        print("Injecting authentication token into localStorage...", flush=True)
        driver.execute_script("""
            localStorage.setItem('fixlink_token', 'mock-token-12345');
            localStorage.setItem('fixlink_user', JSON.stringify({
                id: 'usr_001',
                name: 'Babu M',
                email: 'user@fixlink.ai',
                role: 'user',
                room: 'Block B, Room 304'
            }));
        """)
        
        # Navigate to Raise Complaint
        print("Navigating to Raise Complaint page...", flush=True)
        driver.get(f"{BASE_URL}/raise")
        time.sleep(2)

        # Fill Title
        print("Filling Title: electrical...", flush=True)
        title_inputs = driver.find_elements(By.CSS_SELECTOR, "input[type='text']")
        if title_inputs:
            title_inputs[0].clear()
            title_inputs[0].send_keys("electrical")

        # Fill Description
        print("Filling Description: ceiling fan in not rotating Note: fan is not rotating...", flush=True)
        desc_inputs = driver.find_elements(By.TAG_NAME, "textarea")
        if desc_inputs:
            desc_inputs[0].clear()
            desc_inputs[0].send_keys("ceiling fan in not rotating Note: fan is not rotating")

        time.sleep(1)

        # Click Ask AI
        print("Clicking 'Ask AI for Solution & Diagnosis'...", flush=True)
        ask_btns = driver.find_elements(By.XPATH, "//button[contains(text(), 'Ask AI')]")
        if ask_btns:
            driver.execute_script("arguments[0].click();", ask_btns[0])
        
        time.sleep(3)

        # Screenshot 1: AI Understanding Confirmation Card
        shot1 = os.path.join(ARTIFACTS_DIR, "shot1_ai_understanding.png")
        driver.save_screenshot(shot1)
        print(f"Captured AI Understanding screenshot: {shot1}", flush=True)

        # Click Yes, Correct
        print("Clicking 'Yes, Correct' button...", flush=True)
        yes_btns = driver.find_elements(By.XPATH, "//button[contains(text(), 'Yes, Correct') or contains(text(), 'Yes')]")
        if yes_btns:
            driver.execute_script("arguments[0].click();", yes_btns[0])

        time.sleep(2)

        # Screenshot 2: AI Solution Card
        shot2 = os.path.join(ARTIFACTS_DIR, "shot2_ai_fan_solution.png")
        driver.save_screenshot(shot2)
        print(f"Captured AI Solution Guide screenshot: {shot2}", flush=True)

        # Click View Full Guide (Modal)
        print("Opening Step-by-Step Guided DIY Walkthrough...", flush=True)
        view_btns = driver.find_elements(By.XPATH, "//button[contains(text(), 'View Full Guide') or contains(text(), 'Open Step-by-Step')]")
        if view_btns:
            driver.execute_script("arguments[0].click();", view_btns[0])
            time.sleep(2)
            shot3 = os.path.join(ARTIFACTS_DIR, "shot3_diy_modal.png")
            driver.save_screenshot(shot3)
            print(f"Captured DIY Walkthrough modal screenshot: {shot3}", flush=True)

        print("ALL SCREEN RECORDING STEPS COMPLETED!", flush=True)

    finally:
        driver.quit()

if __name__ == "__main__":
    main()
