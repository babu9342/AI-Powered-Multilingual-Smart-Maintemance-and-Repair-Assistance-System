from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional
from datetime import datetime, timezone
from backend.models import ComplaintStatusUpdate, TechAvailabilityUpdate
from backend.database import db_manager
from backend.routes.auth import get_current_user_or_tech

router = APIRouter(prefix="/api/technicians", tags=["Technician Module"])

@router.get("")
async def list_technicians(category: Optional[str] = Query(None)):
    """Public endpoint: List all registered technicians (optionally filtered by category)."""
    techs = await db_manager.get_all_technicians()
    if category:
        techs = [t for t in techs if t.get("category", "").lower() == category.lower()]
    # Return safe public fields only (no password)
    safe_fields = ["id", "name", "phone", "location", "experienceYears", "category",
                   "rating", "reviewsCount", "status", "completedJobs", "avatar", "role"]
    return [
        {k: v for k, v in t.items() if k in safe_fields}
        for t in techs
    ]

@router.get("/jobs")
async def get_my_jobs(account = Depends(get_current_user_or_tech)):
    if account.get("role") != "technician":
        raise HTTPException(status_code=403, detail="Technician access required")
    return await db_manager.get_complaints(technician_id=account["id"])

@router.post("/jobs/{complaint_id}/accept")
async def accept_job(complaint_id: str, account = Depends(get_current_user_or_tech)):
    if account.get("role") != "technician":
        raise HTTPException(status_code=403, detail="Technician access required")

    complaint = await db_manager.get_complaint_by_id(complaint_id)
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    now_str = datetime.now(timezone.utc).isoformat()
    timeline = complaint.get("timeline", [])
    timeline.append({
        "status": "Accepted",
        "timestamp": now_str,
        "note": f"Technician {account['name']} accepted the task."
    })

    updates = {
        "status": "Accepted",
        "updatedAt": now_str,
        "timeline": timeline
    }
    await db_manager.update_complaint(complaint_id, updates)

    # Notify User
    await db_manager.create_notification({
        "id": f"NOTIF-{str(int(datetime.now().timestamp()))[-5:]}",
        "recipientId": complaint["userId"],
        "title": "Technician En Route",
        "message": f"{account['name']} ({account.get('category','').capitalize()}) has accepted your request.",
        "category": complaint.get("category", "general"),
        "priority": "Normal",
        "complaintId": complaint_id,
        "isRead": False,
        "createdAt": now_str
    })

    return {"status": "Accepted"}

@router.post("/jobs/{complaint_id}/reject")
async def reject_job(complaint_id: str, account = Depends(get_current_user_or_tech)):
    if account.get("role") != "technician":
        raise HTTPException(status_code=403, detail="Technician access required")

    complaint = await db_manager.get_complaint_by_id(complaint_id)
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    now_str = datetime.now(timezone.utc).isoformat()
    timeline = complaint.get("timeline", [])
    timeline.append({
        "status": "Submitted",
        "timestamp": now_str,
        "note": f"Technician {account['name']} was unavailable; re-queued for dispatch."
    })

    updates = {
        "assignedTechnician": None,
        "status": "Submitted",
        "updatedAt": now_str,
        "timeline": timeline
    }
    await db_manager.update_complaint(complaint_id, updates)
    return {"status": "Re-queued"}

@router.patch("/jobs/{complaint_id}/status")
async def update_job_status(complaint_id: str, payload: ComplaintStatusUpdate, account = Depends(get_current_user_or_tech)):
    if account.get("role") != "technician":
        raise HTTPException(status_code=403, detail="Technician access required")

    complaint = await db_manager.get_complaint_by_id(complaint_id)
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    now_str = datetime.now(timezone.utc).isoformat()
    timeline = complaint.get("timeline", [])
    timeline.append({
        "status": payload.status,
        "timestamp": now_str,
        "note": payload.notes or f"Status transitioned to {payload.status}"
    })

    updates = {
        "status": payload.status,
        "updatedAt": now_str,
        "timeline": timeline
    }
    if payload.proofImage:
        updates["resolutionProof"] = payload.proofImage
    if payload.notes:
        updates["completionNotes"] = payload.notes

    if payload.status == "Completed":
        # Increment completed jobs for technician in db/memory
        await db_manager.update_technician(account["id"], {"$inc": {"completedJobs": 1}})

    await db_manager.update_complaint(complaint_id, updates)

    # Notify User
    await db_manager.create_notification({
        "id": f"NOTIF-{str(int(datetime.now().timestamp()))[-5:]}",
        "recipientId": complaint["userId"],
        "title": f"Repair {payload.status}",
        "message": f"Your maintenance request #{complaint_id} was marked as {payload.status}.",
        "category": complaint.get("category", "general"),
        "priority": "High" if payload.status == "Completed" else "Normal",
        "complaintId": complaint_id,
        "isRead": False,
        "createdAt": now_str
    })

    return {"status": payload.status}

@router.patch("/status")
async def update_my_availability(
    payload: Optional[TechAvailabilityUpdate] = None,
    status: Optional[str] = Query(None),
    account = Depends(get_current_user_or_tech)
):
    if account.get("role") != "technician":
        raise HTTPException(status_code=403, detail="Technician access required")
    new_status = (payload.status if payload else None) or status or "Available"
    await db_manager.update_technician_status(account["id"], new_status)
    return {"status": new_status}
