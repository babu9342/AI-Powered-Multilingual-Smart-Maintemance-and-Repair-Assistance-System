from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any

class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    phone: Optional[str] = "+91 98765 43210"
    address: Optional[str] = "Campus Main Block"
    language: Optional[str] = "en"
    role: str = "user" # "user" or "technician"

class TechnicianRegister(BaseModel):
    name: str
    email: str
    password: str
    phone: str
    location: str
    experienceYears: int = 3
    category: str # "electrical", "plumbing", "infrastructure", "cleaning", "security", "network", "other"
    language: Optional[str] = "en"
    role: str = "technician"

class LoginRequest(BaseModel):
    email: str
    password: str
    role: Optional[str] = "user"

class ForgotPasswordRequest(BaseModel):
    email: str
    role: Optional[str] = "user"

class ResetPasswordRequest(BaseModel):
    email: str
    newPassword: str
    role: Optional[str] = "user"
    otp: Optional[str] = None

class TokenResponse(BaseModel):
    accessToken: str
    tokenType: str = "bearer"
    user: Dict[str, Any]

class ComplaintCreate(BaseModel):
    title: Optional[str] = ""
    description: str
    category: Optional[str] = None
    location: str = "Hostel Block A, Room 204"
    inputMode: str = "text" # "voice", "text", "image", "video"
    imageUrl: Optional[str] = None
    language: Optional[str] = "en"
    technicianId: Optional[str] = None

class ComplaintStatusUpdate(BaseModel):
    status: str # "Accepted", "In Progress", "Completed", "Rejected"
    notes: Optional[str] = None
    proofImage: Optional[str] = None

class FeedbackSubmit(BaseModel):
    rating: int # 1 to 5
    comment: Optional[str] = ""

class TechAvailabilityUpdate(BaseModel):
    status: str # "Available", "Busy", etc.

class DiagnoseRequest(BaseModel):
    title: Optional[str] = None
    text: Optional[str] = ""
    description: Optional[str] = None
    imageUrl: Optional[str] = None
    preferredLang: Optional[str] = None
    inputMode: Optional[str] = "text"
    category: Optional[str] = None

class ConfirmRequest(BaseModel):
    complaintId: Optional[str] = None
    confirmed: bool # True = YES, False = NO
    additionalNotes: Optional[str] = None
    category: Optional[str] = None
    language: Optional[str] = "en"

class ChatMessageItem(BaseModel):
    role: str # "user", "assistant", "system"
    content: str
    id: Optional[str] = None
    lang: Optional[str] = None
    provider: Optional[str] = None
    model: Optional[str] = None
    timestamp: Optional[str] = None

class ChatRequest(BaseModel):
    provider: Optional[str] = "claude" # "claude" | "openai" | "deepseek" | "auto"
    messages: Optional[List[ChatMessageItem]] = None
    message: Optional[str] = None # single message fallback compatibility
    language: Optional[str] = "en"
    contextId: Optional[str] = None

class ChatMessageRequest(BaseModel):
    # Backwards compatibility alias
    provider: Optional[str] = "claude"
    message: Optional[str] = None
    messages: Optional[List[ChatMessageItem]] = None
    language: Optional[str] = "en"
    contextId: Optional[str] = None

class StructuredTicketRequest(BaseModel):
    messages: List[ChatMessageItem]
    language: Optional[str] = "en"

