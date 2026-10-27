from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional
from datetime import datetime, timezone
import random
from backend.models import UserRegister, TechnicianRegister, LoginRequest, TokenResponse, ForgotPasswordRequest, ResetPasswordRequest
from backend.database import db_manager
from backend.auth import hash_password, verify_password, create_access_token, decode_access_token

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# In-memory OTP storage for password reset verification
_password_reset_otps = {}

async def get_current_user_or_tech(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authentication token")
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token has expired or is invalid")

    role = payload.get("role", "user")
    email = payload.get("sub")
    if role == "technician":
        tech = await db_manager.find_technician_by_email(email)
        if not tech:
            raise HTTPException(status_code=404, detail="Technician not found")
        return tech
    else:
        user = await db_manager.find_user_by_email(email)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user

async def get_optional_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        return None
    try:
        token = authorization.split(" ")[1]
        payload = decode_access_token(token)
        if not payload:
            return None
        email = payload.get("sub")
        return await db_manager.find_user_by_email(email) or await db_manager.find_technician_by_email(email)
    except Exception:
        return None


@router.post("/register/user")
async def register_user(payload: UserRegister):
    existing = await db_manager.find_user_by_email(payload.email) or await db_manager.find_technician_by_email(payload.email)
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists. Please log in.")

    user_id = f"USR-{str(int(datetime.now().timestamp()))[-4:]}"
    user_doc = {
        "id": user_id,
        "name": payload.name,
        "email": payload.email.lower(),
        "password": hash_password(payload.password),
        "phone": payload.phone,
        "address": payload.address,
        "language": payload.language,
        "role": "user",
        "createdAt": datetime.now(timezone.utc).isoformat()
    }

    await db_manager.create_user(user_doc)
    return {
        "status": "success",
        "message": "Resident account registered successfully! Please sign in with your credentials.",
        "email": user_doc["email"],
        "role": "user"
    }

@router.post("/register/technician")
async def register_technician(payload: TechnicianRegister):
    existing = await db_manager.find_technician_by_email(payload.email) or await db_manager.find_user_by_email(payload.email)
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists. Please log in.")

    tech_id = f"TECH-{str(int(datetime.now().timestamp()))[-4:]}"
    tech_doc = {
        "id": tech_id,
        "name": payload.name,
        "email": payload.email.lower(),
        "password": hash_password(payload.password),
        "phone": payload.phone,
        "location": payload.location,
        "experienceYears": payload.experienceYears,
        "category": payload.category.lower(),
        "rating": 5.0,
        "reviewsCount": 0,
        "status": "Available",
        "completedJobs": 0,
        "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        "role": "technician",
        "createdAt": datetime.now(timezone.utc).isoformat()
    }

    await db_manager.create_technician(tech_doc)
    return {
        "status": "success",
        "message": "Technician account registered successfully! Please sign in with your credentials.",
        "email": tech_doc["email"],
        "role": "technician"
    }

@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest):
    email = payload.email.lower().strip()
    role = payload.role or "user"

    account = None
    if role == "technician":
        account = await db_manager.find_technician_by_email(email)
        if not account:
            # Check if this email exists as a resident user instead
            user_acc = await db_manager.find_user_by_email(email)
            if user_acc:
                raise HTTPException(status_code=400, detail="This account is registered as a Resident User. Please select the 'Resident User' tab to sign in.")
            raise HTTPException(status_code=401, detail="No technician found with this email.")
    else:
        account = await db_manager.find_user_by_email(email)
        if not account:
            # Check if this email exists as a technician instead
            tech_acc = await db_manager.find_technician_by_email(email)
            if tech_acc:
                raise HTTPException(status_code=400, detail="This account is registered as a Field Technician. Please select the 'Field Technician' tab to sign in.")
            raise HTTPException(status_code=401, detail="No user found with this email.")

    if not verify_password(payload.password, account.get("password", "")):
        raise HTTPException(status_code=401, detail="Incorrect password. Please verify and try again.")

    actual_role = account.get("role", role)
    token = create_access_token({"sub": account["email"], "role": actual_role, "id": account["id"]})
    safe_account = {k: v for k, v in account.items() if k != "password"}

    return {"accessToken": token, "tokenType": "bearer", "user": safe_account}

@router.post("/forgot-password")
async def forgot_password(payload: ForgotPasswordRequest):
    email = payload.email.lower().strip()
    role = payload.role or "user"

    account = None
    if role == "technician":
        account = await db_manager.find_technician_by_email(email)
    else:
        account = await db_manager.find_user_by_email(email)

    if not account:
        # Cross-check other role for helpful error
        other_role = "user" if role == "technician" else "technician"
        other_acc = await db_manager.find_user_by_email(email) if role == "technician" else await db_manager.find_technician_by_email(email)
        if other_acc:
            raise HTTPException(status_code=400, detail=f"This account is registered as a {other_role.capitalize()}. Please select the {other_role.capitalize()} option.")
        raise HTTPException(status_code=404, detail="No account registered with this email address.")

    # Generate 6-digit OTP code for secure verification
    otp = str(random.randint(100000, 999999))
    _password_reset_otps[email] = otp

    return {
        "status": "success",
        "message": f"Verification code generated successfully for {email}.",
        "otp": otp,
        "email": email,
        "role": role
    }

@router.post("/reset-password")
async def reset_password(payload: ResetPasswordRequest):
    email = payload.email.lower().strip()
    role = payload.role or "user"
    new_pwd = payload.newPassword.strip()

    if len(new_pwd) < 4:
        raise HTTPException(status_code=400, detail="New password must be at least 4 characters long.")

    # Check OTP if provided
    if payload.otp:
        expected_otp = _password_reset_otps.get(email)
        if expected_otp and payload.otp.strip() != expected_otp:
            raise HTTPException(status_code=400, detail="Invalid verification code (OTP). Please check and retry.")

    account = None
    if role == "technician":
        account = await db_manager.find_technician_by_email(email)
        if not account:
            raise HTTPException(status_code=404, detail="Technician account not found.")
        hashed = hash_password(new_pwd)
        await db_manager.update_technician_password(email, hashed)
    else:
        account = await db_manager.find_user_by_email(email)
        if not account:
            raise HTTPException(status_code=404, detail="Resident account not found.")
        hashed = hash_password(new_pwd)
        await db_manager.update_user_password(email, hashed)

    # Clean up OTP
    _password_reset_otps.pop(email, None)

    return {
        "status": "success",
        "message": "Password reset successfully! You can now log in with your new password.",
        "email": email
    }

@router.get("/me")
async def get_me(account = Depends(get_current_user_or_tech)):
    return {k: v for k, v in account.items() if k != "password"}

