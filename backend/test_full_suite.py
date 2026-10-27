import os
import sys
import pytest
import copy

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from fastapi.testclient import TestClient
from backend.main import app
from backend.database import db_manager, storage, INITIAL_COMPLAINTS, INITIAL_TECHNICIANS

@pytest.fixture(scope="session")
def client():
    with TestClient(app) as c:
        yield c

# ==========================================
# 1. Health & Server Diagnostics
# ==========================================
def test_health_endpoint(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["app"] == "FixLink"
    assert data["status"] == "healthy"
    assert "User" in data["roles"]
    assert "Technician" in data["roles"]

# ==========================================
# 2. Authentication & Authorization
# ==========================================
def test_user_registration_and_login(client):
    email = "test_resident_01@fixlink.ai"
    reg_payload = {
        "name": "Test Resident",
        "email": email,
        "password": "Password@123",
        "phone": "+91 91234 56789",
        "address": "Block D, Room 101",
        "language": "en"
    }

    # Register user
    reg_res = client.post("/api/auth/register/user", json=reg_payload)
    assert reg_res.status_code in [200, 400] # 400 if rerun with existing in mongo

    # Test duplicate registration error
    dup_res = client.post("/api/auth/register/user", json=reg_payload)
    assert dup_res.status_code == 400

    # Wrong password
    bad_login = client.post("/api/auth/login", json={
        "email": email,
        "password": "WrongPassword",
        "role": "user"
    })
    assert bad_login.status_code == 401

    # Successful login
    login_res = client.post("/api/auth/login", json={
        "email": email,
        "password": "Password@123",
        "role": "user"
    })
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert "accessToken" in login_data
    assert login_data["user"]["email"] == email.lower()
    assert "password" not in login_data["user"]

    token = login_data["accessToken"]

    # Verify /me endpoint
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == email.lower()

def test_technician_registration_and_login(client):
    email = "test_tech_01@fixlink.ai"
    reg_payload = {
        "name": "Arvind Electrician",
        "email": email,
        "password": "TechPassword@123",
        "phone": "+91 94567 89012",
        "location": "Academic Blocks A & B",
        "experienceYears": 7,
        "category": "electrical"
    }

    # Register technician
    reg_res = client.post("/api/auth/register/technician", json=reg_payload)
    assert reg_res.status_code in [200, 400]

    # Test login with wrong role selected (resident tab trying tech email)
    role_mismatch = client.post("/api/auth/login", json={
        "email": email,
        "password": "TechPassword@123",
        "role": "user"
    })
    assert role_mismatch.status_code == 400

    # Successful technician login
    login_res = client.post("/api/auth/login", json={
        "email": email,
        "password": "TechPassword@123",
        "role": "technician"
    })
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert login_data["user"]["role"] == "technician"
    assert login_data["user"]["category"] == "electrical"

def test_forgot_and_reset_password(client):
    email = "user@fixlink.ai"
    
    # 1. Request forgot password OTP
    forgot_res = client.post("/api/auth/forgot-password", json={"email": email, "role": "user"})
    assert forgot_res.status_code == 200
    forgot_data = forgot_res.json()
    assert "otp" in forgot_data
    otp = forgot_data["otp"]

    # 2. Reset password using OTP
    new_pwd = "newpassword456"
    reset_res = client.post("/api/auth/reset-password", json={
        "email": email,
        "newPassword": new_pwd,
        "role": "user",
        "otp": otp
    })
    assert reset_res.status_code == 200

    # 3. Verify old password fails
    old_login = client.post("/api/auth/login", json={"email": email, "password": "password123", "role": "user"})
    assert old_login.status_code == 401

    # 4. Verify new password succeeds
    new_login = client.post("/api/auth/login", json={"email": email, "password": new_pwd, "role": "user"})
    assert new_login.status_code == 200

    # Restore default password for other test suites
    client.post("/api/auth/reset-password", json={
        "email": email,
        "newPassword": "password123",
        "role": "user"
    })

# ==========================================
# 3. AI Diagnostics & Vision Simulation
# ==========================================
def test_ai_diagnose_electrical_hazard(client):
    res = client.post("/api/ai/diagnose", json={
        "text": "The wall socket had high voltage sparks and smoke came out",
        "imageUrl": "https://example.com/test_socket.jpg",
        "preferredLang": "en"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["category"] == "electrical"
    assert data["isSafeForDIY"] is False
    assert "UNSAFE" in data["safetyAssessment"]
    assert data["visionAnalysis"] is not None
    assert "boundingBox" in data["visionAnalysis"]

def test_ai_diagnose_safe_diy(client):
    res = client.post("/api/ai/diagnose", json={
        "text": "Clean loose minor dust on wifi router and restart power",
        "preferredLang": "en"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["isSafeForDIY"] is True
    assert data["diyGuide"] is not None
    assert len(data["diyGuide"]["steps"]) > 0

def test_ai_confirmation_dialog_multilingual(client):
    # Confirmation accept
    res_confirm = client.post("/api/ai/confirm", json={
        "confirmed": True,
        "category": "plumbing"
    })
    assert res_confirm.status_code == 200
    assert res_confirm.json()["status"] == "confirmed"

    # Confirmation reject with Tamil language
    res_reject_ta = client.post("/api/ai/confirm", json={
        "confirmed": False,
        "category": "electrical",
        "language": "ta"
    })
    assert res_reject_ta.status_code == 200
    assert res_reject_ta.json()["status"] == "refining"
    assert len(res_reject_ta.json()["questions"]) > 0

def test_ai_chat_assistant_multilingual(client):
    # English chat (supports 200 with live LLM or 503 when all live keys are exhausted)
    chat_en = client.post("/api/ai/chat", json={
        "message": "Water is leaking from my washbasin tap",
        "language": "en"
    })
    assert chat_en.status_code in [200, 503]
    if chat_en.status_code == 200:
        assert "water" in chat_en.json()["reply"].lower() or "valve" in chat_en.json()["reply"].lower()
        assert chat_en.json()["detectedCategory"] == "plumbing"
    else:
        assert "AI assistant is temporarily unavailable" in chat_en.json()["detail"]

    # Tamil chat
    chat_ta = client.post("/api/ai/chat", json={
        "message": "மின்விசிறி வேலை செய்யவில்லை",
        "language": "ta"
    })
    assert chat_ta.status_code in [200, 503]


def test_ai_predictive_maintenance(client):
    res = client.get("/api/ai/predictive")
    assert res.status_code == 200
    alerts = res.json()
    assert isinstance(alerts, list)
    assert len(alerts) > 0
    assert "repairCount" in alerts[0]
    assert "recommendation" in alerts[0]

# ==========================================
# 4. Complaints Lifecycle & Job Dispatch
# ==========================================
def test_complaint_full_lifecycle(client):
    # 1. Login user
    user_login = client.post("/api/auth/login", json={
        "email": "user@fixlink.ai",
        "password": "password123",
        "role": "user"
    })
    user_token = user_login.json()["accessToken"]
    user_headers = {"Authorization": f"Bearer {user_token}"}

    # 2. Login technician
    tech_login = client.post("/api/auth/login", json={
        "email": "karthik.tech@fixlink.ai",
        "password": "password123",
        "role": "technician"
    })
    tech_token = tech_login.json()["accessToken"]
    tech_headers = {"Authorization": f"Bearer {tech_token}"}

    # 3. Create an urgent electrical complaint
    complaint_payload = {
        "title": "Severe sparked wire and burning smell in switchboard",
        "description": "High sparks and electrical short circuit risk in Hostel Block A",
        "category": "electrical",
        "location": "Hostel Block A, Room 105",
        "inputMode": "text",
        "language": "en"
    }
    create_res = client.post("/api/complaints", json=complaint_payload, headers=user_headers)
    assert create_res.status_code == 201
    created_comp = create_res.json()
    comp_id = created_comp["id"]
    assert "High" in created_comp["severity"]

    # 3b. Select technician manually
    select_res = client.post(
        f"/api/complaints/{comp_id}/select-technician",
        json={"technicianId": "TECH-101"},
        headers=user_headers
    )
    assert select_res.status_code == 200
    assert select_res.json()["technician"]["id"] == "TECH-101"

    # 4. View complaint by ID
    get_res = client.get(f"/api/complaints/{comp_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == comp_id
    assert get_res.json()["assignedTechnician"]["id"] == "TECH-101"

    # 5. Technician views jobs
    jobs_res = client.get("/api/technicians/jobs", headers=tech_headers)
    assert jobs_res.status_code == 200
    assert isinstance(jobs_res.json(), list)

    # 6. Technician updates job status to In Progress
    status_prog_res = client.patch(
        f"/api/technicians/jobs/{comp_id}/status",
        json={"status": "In Progress", "notes": "On site diagnosing circuit board."},
        headers=tech_headers
    )
    assert status_prog_res.status_code == 200
    assert status_prog_res.json()["status"] == "In Progress"

    # 7. Technician completes job with proof
    status_done_res = client.patch(
        f"/api/technicians/jobs/{comp_id}/status",
        json={
            "status": "Completed",
            "notes": "Replaced burnt 16A breaker and terminal screws.",
            "proofImage": "https://example.com/proof_fixed.jpg"
        },
        headers=tech_headers
    )
    assert status_done_res.status_code == 200
    assert status_done_res.json()["status"] == "Completed"

    # 8. User submits feedback and rating
    feedback_res = client.post(
        f"/api/complaints/{comp_id}/feedback",
        json={"rating": 5, "comment": "Prompt service and safe electrical repair!"},
        headers=user_headers
    )
    assert feedback_res.status_code == 200
    assert feedback_res.json()["status"] == "success"

# ==========================================
# 5. Reports & Regression Bug Verification
# ==========================================
def test_report_generation_technician_serviced(client):
    # Test report for complaint with assigned technician
    res = client.get("/api/reports/CMP-2026-101")
    assert res.status_code == 200
    data = res.json()
    assert data["reportId"] == "REP-CMP-2026-101"
    assert data["assignedTechnician"]["name"] != ""
    assert "FixLink" in data["title"]

def test_report_generation_diy_no_technician(client):
    # REGRESSION TEST for AttributeError: 'NoneType' object has no attribute 'get'
    # CMP-2026-103 has assignedTechnician: None
    res = client.get("/api/reports/CMP-2026-103")
    assert res.status_code == 200
    data = res.json()
    assert data["reportId"] == "REP-CMP-2026-103"
    assert data["assignedTechnician"]["name"] == "Guided Self-Repair AI"

# ==========================================
# 6. Notifications System
# ==========================================
def test_notifications_lifecycle(client):
    user_login = client.post("/api/auth/login", json={
        "email": "user@fixlink.ai",
        "password": "password123",
        "role": "user"
    })
    token = user_login.json()["accessToken"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch notifications
    notifs_res = client.get("/api/notifications", headers=headers)
    assert notifs_res.status_code == 200
    assert isinstance(notifs_res.json(), list)

    # Mark as read
    read_res = client.post("/api/notifications/read", headers=headers)
    assert read_res.status_code == 200
    assert read_res.json()["status"] == "success"

# ==========================================
# 7. Technician Status Toggle
# ==========================================
def test_technician_status_toggle(client):
    tech_login = client.post("/api/auth/login", json={
        "email": "tech@fixlink.ai",
        "password": "password123",
        "role": "technician"
    })
    token = tech_login.json()["accessToken"]
    headers = {"Authorization": f"Bearer {token}"}

    # Toggle via query param
    q_res = client.patch("/api/technicians/status?status=Busy", headers=headers)
    assert q_res.status_code == 200
    assert q_res.json()["status"] == "Busy"

    # Toggle via JSON body
    b_res = client.patch("/api/technicians/status", json={"status": "Available"}, headers=headers)
    assert b_res.status_code == 200
    assert b_res.json()["status"] == "Available"

# ==========================================
# 8. In-Memory Fallback Regression Verification
# ==========================================
def test_in_memory_technician_id_filter_regression(client):
    # REGRESSION TEST: In-memory filtering when a complaint has assignedTechnician: None
    original_use_mongo = db_manager.use_mongo
    try:
        db_manager.use_mongo = False
        storage["complaints"] = list(INITIAL_COMPLAINTS)
        storage["technicians"] = list(INITIAL_TECHNICIANS)

        # Query with technicianId should not crash with AttributeError
        complaints = client.get("/api/complaints?technicianId=TECH-102")
        assert complaints.status_code == 200
        data = complaints.json()
        assert isinstance(data, list)
        for c in data:
            assert c["assignedTechnician"]["id"] == "TECH-102"

        # Update in-memory technician completed jobs
        res = client.patch(
            "/api/technicians/jobs/CMP-2026-101/status",
            json={"status": "Completed", "notes": "Done in memory"},
            headers={"Authorization": f"Bearer {client.post('/api/auth/login', json={'email':'tech@fixlink.ai','password':'password123','role':'technician'}).json()['accessToken']}"}
        )
        assert res.status_code == 200

    finally:
        db_manager.use_mongo = original_use_mongo

# ==========================================
# 9. Edge Cases & Error Boundaries
# ==========================================
def test_complaint_empty_validation(client):
    user_login = client.post("/api/auth/login", json={
        "email": "user@fixlink.ai",
        "password": "password123",
        "role": "user"
    })
    token = user_login.json()["accessToken"]
    headers = {"Authorization": f"Bearer {token}"}

    # Empty description and empty title
    res = client.post("/api/complaints", json={"title": "", "description": "   "}, headers=headers)
    assert res.status_code == 400

def test_unauthorized_endpoints(client):
    # No auth header
    res = client.get("/api/auth/me")
    assert res.status_code == 401

    # Malformed token
    res_bad = client.get("/api/auth/me", headers={"Authorization": "Bearer invalid.jwt.token"})
    assert res_bad.status_code == 401

    # Resident trying to call technician endpoint
    user_token = client.post("/api/auth/login", json={"email": "user@fixlink.ai", "password": "password123", "role": "user"}).json()["accessToken"]
    res_forbidden = client.get("/api/technicians/jobs", headers={"Authorization": f"Bearer {user_token}"})
    assert res_forbidden.status_code == 403

def test_nonexistent_complaint(client):
    res = client.get("/api/complaints/CMP-NONEXISTENT")
    assert res.status_code == 404

    rep_res = client.get("/api/reports/CMP-NONEXISTENT")
    assert rep_res.status_code == 404

def test_technician_rejection_requeuing(client):
    tech_token = client.post("/api/auth/login", json={"email": "tech@fixlink.ai", "password": "password123", "role": "technician"}).json()["accessToken"]
    tech_headers = {"Authorization": f"Bearer {tech_token}"}

    # Reject job
    res = client.post("/api/technicians/jobs/CMP-2026-101/reject", headers=tech_headers)
    assert res.status_code == 200
    assert res.json()["status"] == "Re-queued"

    # Verify complaint was re-queued with assignedTechnician = None
    comp = client.get("/api/complaints/CMP-2026-101").json()
    assert comp["assignedTechnician"] is None
    assert comp["status"] == "Submitted"

    # Accept again to restore state
    acc_res = client.post("/api/technicians/jobs/CMP-2026-101/accept", headers=tech_headers)
    assert acc_res.status_code == 200

def test_ai_language_detection(client):
    from backend.ai.language_detector import detect_language
    assert detect_language("This is an English sentence") == "en"
    assert detect_language("மின்விசிறி சுழலவில்லை") == "ta"
    assert detect_language("पंखा काम नहीं कर रहा है") == "hi"
    assert detect_language("లైట్ వెలగడం లేదు") == "te"
    assert detect_language("ലൈറ്റ് കത്തുന്നില്ല") == "ml"
    assert detect_language("ಫ್ಯಾನ್ ತಿರುಗುತ್ತಿಲ್ಲ") == "kn"

def test_media_upload_endpoint(client):
    import io
    dummy_file = io.BytesIO(b"fake image bytes content for test")
    res = client.post("/api/ai/upload", files={"file": ("test_defect.jpg", dummy_file, "image/jpeg")})
    assert res.status_code == 200
    assert "imageUrl" in res.json()
    assert res.json()["imageUrl"].startswith("/uploads/")
