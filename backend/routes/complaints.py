from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, List
from datetime import datetime, timezone
from backend.models import ComplaintCreate, FeedbackSubmit
from backend.database import db_manager
from backend.routes.auth import get_current_user_or_tech
from backend.ai.language_detector import detect_language
from backend.ai.safety_engine import evaluate_safety_and_repair
from backend.ai.vision_engine import analyze_vision
from backend.ai.ml_classifier import generate_accurate_diagnosis
from pydantic import BaseModel

from backend.ai.solution_verification_engine import process_complaint_with_verification

class TechnicianSelectPayload(BaseModel):
    technicianId: str

router = APIRouter(prefix="/api/complaints", tags=["Complaints"])

@router.get("")
async def list_complaints(
    userId: Optional[str] = Query(None),
    technicianId: Optional[str] = Query(None),
    status: Optional[str] = Query(None)
):
    return await db_manager.get_complaints(user_id=userId, technician_id=technicianId, status=status)

@router.get("/{complaint_id}")
async def get_complaint(complaint_id: str):
    complaint = await db_manager.get_complaint_by_id(complaint_id)
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return complaint

@router.post("", status_code=201)
async def create_complaint(payload: ComplaintCreate, account = Depends(get_current_user_or_tech)):
    if account.get("role") != "user":
        raise HTTPException(status_code=403, detail="Forbidden: Only registered resident users can report maintenance issues")

    desc = payload.description.strip()
    if not desc and not payload.title:
        raise HTTPException(status_code=400, detail="Issue description or title is required")

    full_text = f"{payload.title or ''} {desc}".strip()
    lang = payload.language or detect_language(full_text)

    # Use central Multilingual ML diagnosis engine
    diag = generate_accurate_diagnosis(
        text=full_text,
        user_selected_category=payload.category,
        lang=lang
    )
    category = diag["category"]

    # Safety evaluation with localized language
    safety = evaluate_safety_and_repair(category, full_text, lang=lang)

    # Vision Analysis if image provided
    vision = None
    if payload.imageUrl:
        vision = analyze_vision(category, full_text)

    # Multi-LLM Solution Verification Mechanism (ChatGPT + DeepSeek + Gemini)
    prior_matches = await db_manager.search_verified_knowledge(full_text, category)
    prior_context = f"Known: {prior_matches[0].get('identifiedProblem')}" if prior_matches else ""
    verification_data = process_complaint_with_verification(
        complaint_text=full_text,
        category=category,
        lang=lang,
        prior_knowledge=prior_context
    )
    v_report = verification_data.get("verificationReport", {})
    verified_sol = verification_data.get("finalSolution", {})

    # Handle technician assignment if technicianId is provided in payload
    all_complaints = await db_manager.get_complaints()
    now_str = datetime.now(timezone.utc).isoformat()
    new_id = f"CMP-2026-{str(len(all_complaints) + 101).zfill(3)}"

    assigned_tech = None
    status = "Submitted"

    v_score_pct = int(v_report.get("verificationScore", 0.95) * 100)
    timeline = [
        {"status": "Submitted", "timestamp": now_str, "note": f"Complaint filed via {payload.inputMode.upper()}"},
        {"status": "AI Verified", "timestamp": now_str, "note": f"Multi-LLM Verified (ChatGPT + DeepSeek + Gemini: {v_score_pct}% Consensus)"},
        {"status": "AI Diagnosed", "timestamp": now_str, "note": f"Categorized as {category.upper()} ({safety['severity']})"}
    ]

    if payload.technicianId:
        all_techs = await db_manager.get_all_technicians()
        assigned_tech = next((t for t in all_techs if t["id"] == payload.technicianId), None)
        if assigned_tech:
            status = "Assigned"
            timeline.append({
                "status": "Assigned",
                "timestamp": now_str,
                "note": f"Technician selected: {assigned_tech['name']} ({assigned_tech.get('category','').capitalize()})"
            })

    complaint_doc = {
        "id": new_id,
        "userId": account.get("id", "USR-001"),
        "userName": account.get("name", "Resident"),
        "userPhone": account.get("phone", "+91 98765 43210"),
        "title": payload.title or f"{category.capitalize()} Maintenance Issue",
        "description": desc,
        "category": category,
        "location": payload.location,
        "inputMode": payload.inputMode,
        "imageUrl": payload.imageUrl,
        "language": lang,
        "status": status,
        "severity": safety["severity"],
        "isSafeForDIY": safety["isSafeForDIY"] if v_report.get("decision") != "ESCALATED_TO_CERTIFIED_TECHNICIAN" else False,
        "aiDiagnosis": {
            "category": category,
            "possibleIssue": diag["possibleIssue"],
            "confidence": diag["confidence"],
            "explanation": diag["explanation"],
            "confirmationQuestion": diag["confirmationQuestion"],
            "safetyAssessment": safety["safetyAssessment"],
            "diyGuide": safety["diyGuide"],
            "visionAnalysis": vision,
            "verificationReport": v_report,
            "multiLlmResponses": verification_data.get("multiLlmResponses"),
            "verifiedSolution": verified_sol,
            "verificationDecision": verification_data.get("status")
        },
        "assignedTechnician": assigned_tech,
        "createdAt": now_str,
        "updatedAt": now_str,
        "timeline": timeline,
        "feedback": None
    }

    created = await db_manager.create_complaint(complaint_doc)

    if assigned_tech:
        # Notify technician
        await db_manager.create_notification({
            "id": f"NOTIF-{str(int(datetime.now().timestamp()))[-5:]}",
            "recipientId": assigned_tech["id"],
            "title": f"🔔 New {category.capitalize()} Job Request",
            "message": f"A user has requested repair at {payload.location}: {desc[:80]}...",
            "category": category,
            "priority": "High",
            "complaintId": new_id,
            "isRead": False,
            "createdAt": now_str
        })

    return created


@router.post("/{complaint_id}/select-technician", status_code=200)
async def select_technician(complaint_id: str, payload: TechnicianSelectPayload, account = Depends(get_current_user_or_tech)):
    """User manually selects a technician for their complaint."""
    if account.get("role") != "user":
        raise HTTPException(status_code=403, detail="Only users can select technicians")

    complaint = await db_manager.get_complaint_by_id(complaint_id)
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    technician_id = payload.technicianId
    if not technician_id:
        raise HTTPException(status_code=400, detail="technicianId is required")

    all_techs = await db_manager.get_all_technicians()
    selected_tech = next((t for t in all_techs if t["id"] == technician_id), None)
    if not selected_tech:
        raise HTTPException(status_code=404, detail="Technician not found")

    now_str = datetime.now(timezone.utc).isoformat()
    timeline = complaint.get("timeline", [])
    timeline.append({
        "status": "Assigned",
        "timestamp": now_str,
        "note": f"User selected technician: {selected_tech['name']} ({selected_tech.get('category','').capitalize()})"
    })

    updates = {
        "assignedTechnician": selected_tech,
        "status": "Assigned",
        "updatedAt": now_str,
        "timeline": timeline
    }
    await db_manager.update_complaint(complaint_id, updates)

    # Send notification to selected technician
    await db_manager.create_notification({
        "id": f"NOTIF-{str(int(datetime.now().timestamp()))[-5:]}",
        "recipientId": selected_tech["id"],
        "title": f"🔔 New {complaint.get('category','').capitalize()} Job Request",
        "message": f"A user has selected you for a repair at {complaint.get('location','')}: {complaint.get('description','')[:80]}...",
        "category": complaint.get("category", "general"),
        "priority": "High",
        "complaintId": complaint_id,
        "isRead": False,
        "createdAt": now_str
    })

    # Also notify user that technician was assigned
    await db_manager.create_notification({
        "id": f"NOTIF-{str(int(datetime.now().timestamp()) + 1)[-5:]}",
        "recipientId": account.get("id"),
        "title": f"✅ Technician Assigned: {selected_tech['name']}",
        "message": f"{selected_tech['name']} has been notified and will attend to your request shortly.",
        "category": complaint.get("category", "general"),
        "priority": "Normal",
        "complaintId": complaint_id,
        "isRead": False,
        "createdAt": now_str
    })

    return {"status": "Assigned", "technician": selected_tech}

@router.post("/{complaint_id}/complete-self-repair", status_code=200)
async def complete_self_repair(complaint_id: str, account = Depends(get_current_user_or_tech)):
    """Marks a complaint as completed by the user via self-repair walkthrough."""
    complaint = await db_manager.get_complaint_by_id(complaint_id)
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    now_str = datetime.now(timezone.utc).isoformat()
    timeline = complaint.get("timeline", [])
    timeline.append({
        "status": "Completed",
        "timestamp": now_str,
        "note": "Resolved via Interactive DIY Self-Repair Walkthrough"
    })

    updates = {
        "status": "Completed",
        "updatedAt": now_str,
        "timeline": timeline
    }
    await db_manager.update_complaint(complaint_id, updates)

    # Notify user
    await db_manager.create_notification({
        "id": f"NOTIF-{str(int(datetime.now().timestamp()))[-5:]}",
        "recipientId": account.get("id"),
        "title": "🎉 Self-Repair Completed!",
        "message": f"Complaint {complaint_id} was successfully resolved using the guided walkthrough. Status: Completed.",
        "category": complaint.get("category", "general"),
        "priority": "Normal",
        "complaintId": complaint_id,
        "isRead": False,
        "createdAt": now_str
    })

    return {"status": "Completed", "message": "Self repair completed successfully"}

@router.post("/{complaint_id}/feedback")
async def submit_feedback(complaint_id: str, payload: FeedbackSubmit, account = Depends(get_current_user_or_tech)):
    complaint = await db_manager.get_complaint_by_id(complaint_id)
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    feedback_data = {
        "rating": payload.rating,
        "comment": payload.comment,
        "submittedAt": datetime.now(timezone.utc).isoformat()
    }

    # Update technician rating if assigned
    tech = complaint.get("assignedTechnician")
    if tech:
        cur_rating = tech.get("rating", 4.8)
        cur_count = tech.get("reviewsCount", 1)
        new_rating = round(((cur_rating * cur_count) + payload.rating) / (cur_count + 1), 2)
        # Update technician in db / in-memory
        await db_manager.update_technician(
            tech["id"],
            {"$set": {"rating": new_rating}, "$inc": {"reviewsCount": 1}}
        )

    # Continuous Improvement: Save successful verified solutions (rating >= 4) into Knowledge Base
    if payload.rating >= 4:
        diag = complaint.get("aiDiagnosis", {})
        verified_sol = diag.get("verifiedSolution", {})
        if verified_sol and verified_sol.get("recommendedSolution"):
            kb_doc = {
                "id": f"KB-{int(time.time() * 1000)}",
                "category": complaint.get("category", "general"),
                "title": complaint.get("title") or complaint.get("description", "")[:60],
                "keywords": [w for w in complaint.get("description", "").lower().split() if len(w) > 3][:8],
                "identifiedProblem": verified_sol.get("identifiedProblem") or diag.get("possibleIssue", "General Maintenance"),
                "possibleCauses": verified_sol.get("possibleCauses", []),
                "verifiedSolution": verified_sol.get("recommendedSolution", []),
                "requiredTools": verified_sol.get("requiredTools", []),
                "safetyInstructions": verified_sol.get("safetyInstructions", []),
                "verificationScore": verified_sol.get("verificationScore", 0.95),
                "consensusConfidence": verified_sol.get("consensusConfidence", 0.92),
                "verifiedBy": "Multi-LLM Consensus Engine (ChatGPT + DeepSeek + Gemini)",
                "userRating": payload.rating,
                "userFeedbackComment": payload.comment,
                "sourceComplaintId": complaint_id,
                "successCount": 1,
                "createdAt": datetime.now(timezone.utc).isoformat()
            }
            await db_manager.save_verified_solution(kb_doc)

    await db_manager.update_complaint(complaint_id, {"feedback": feedback_data})
    return {"status": "success", "message": "Feedback submitted & continuous improvement learning recorded"}
