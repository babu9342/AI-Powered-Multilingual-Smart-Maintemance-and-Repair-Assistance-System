from fastapi import APIRouter, Depends
from backend.database import db_manager
from backend.routes.auth import get_current_user_or_tech

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

@router.get("")
async def get_my_notifications(account = Depends(get_current_user_or_tech)):
    return await db_manager.get_notifications(account["id"])

@router.post("/read")
async def mark_read(account = Depends(get_current_user_or_tech)):
    await db_manager.mark_notifications_read(account["id"])
    return {"status": "success"}
