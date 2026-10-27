import os
import copy
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
import motor.motor_asyncio
from backend.config import MONGO_URI, DB_NAME
from backend.auth import hash_password

def sanitize_doc(doc):
    """Recursively strip MongoDB internal _id and ensure JSON serializability."""
    if isinstance(doc, dict):
        return {k: sanitize_doc(v) for k, v in doc.items() if k != "_id"}
    elif isinstance(doc, list):
        return [sanitize_doc(item) for item in doc]
    return doc



INITIAL_USERS = [
    {
        "id": "USR-001",
        "name": "Babu M",
        "email": "user@fixlink.ai",
        "password": hash_password("password123"),
        "phone": "+91 98765 43210",
        "address": "Campus Hostel Block C, Room 204",
        "language": "en",
        "role": "user",
        "createdAt": "2026-09-01T10:00:00Z"
    }
]

INITIAL_TECHNICIANS = [
    {
        "id": "TECH-101",
        "name": "Karthik Raman",
        "email": "karthik.tech@fixlink.ai",
        "password": hash_password("password123"),
        "phone": "+91 98450 12345",
        "location": "Academic Blocks A & B",
        "experienceYears": 6,
        "category": "electrical",
        "rating": 4.9,
        "reviewsCount": 42,
        "status": "Available",
        "completedJobs": 128,
        "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        "role": "technician"
    },
    {
        "id": "TECH-102",
        "name": "Suresh Kumar",
        "email": "tech@fixlink.ai",
        "password": hash_password("password123"),
        "phone": "+91 97890 56789",
        "location": "Hostel Zone & Dining Hall",
        "experienceYears": 8,
        "category": "plumbing",
        "rating": 4.85,
        "reviewsCount": 38,
        "status": "Available",
        "completedJobs": 114,
        "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        "role": "technician"
    },
    {
        "id": "TECH-103",
        "name": "Priya Sharma",
        "email": "priya.tech@fixlink.ai",
        "password": hash_password("password123"),
        "phone": "+91 94432 98765",
        "location": "Central Admin & Library",
        "experienceYears": 5,
        "category": "infrastructure",
        "rating": 4.92,
        "reviewsCount": 29,
        "status": "Available",
        "completedJobs": 95,
        "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
        "role": "technician"
    },
    {
        "id": "TECH-104",
        "name": "Arun Venkatesh",
        "email": "arun.tech@fixlink.ai",
        "password": hash_password("password123"),
        "phone": "+91 99520 44321",
        "location": "Tech Park & Server Labs",
        "experienceYears": 4,
        "category": "network",
        "rating": 4.88,
        "reviewsCount": 24,
        "status": "Available",
        "completedJobs": 82,
        "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        "role": "technician"
    },
    {
        "id": "TECH-105",
        "name": "Murugan Selvam",
        "email": "murugan.tech@fixlink.ai",
        "password": hash_password("password123"),
        "phone": "+91 98401 56780",
        "location": "Hostel Zone & Cafeteria Block",
        "experienceYears": 7,
        "category": "cleaning",
        "rating": 4.90,
        "reviewsCount": 35,
        "status": "Available",
        "completedJobs": 142,
        "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
        "role": "technician"
    },
    {
        "id": "TECH-106",
        "name": "Rajesh Kannan",
        "email": "rajesh.tech@fixlink.ai",
        "password": hash_password("password123"),
        "phone": "+91 97910 87654",
        "location": "Campus Main Gates & Surveillance Hub",
        "experienceYears": 6,
        "category": "security",
        "rating": 4.87,
        "reviewsCount": 31,
        "status": "Available",
        "completedJobs": 110,
        "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
        "role": "technician"
    },
    {
        "id": "TECH-107",
        "name": "Ananya Nair",
        "email": "ananya.tech@fixlink.ai",
        "password": hash_password("password123"),
        "phone": "+91 94451 23456",
        "location": "Central Auditorium & Academic Labs",
        "experienceYears": 5,
        "category": "other",
        "rating": 4.95,
        "reviewsCount": 46,
        "status": "Available",
        "completedJobs": 118,
        "avatar": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
        "role": "technician"
    },
    {
        "id": "TECH-108",
        "name": "Vignesh Pandian",
        "email": "vignesh.tech@fixlink.ai",
        "password": hash_password("password123"),
        "phone": "+91 98842 34567",
        "location": "Power Grid & Generator Complex",
        "experienceYears": 9,
        "category": "electrical",
        "rating": 4.91,
        "reviewsCount": 52,
        "status": "Available",
        "completedJobs": 156,
        "avatar": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
        "role": "technician"
    },
    {
        "id": "TECH-109",
        "name": "Meena Sundaram",
        "email": "meena.tech@fixlink.ai",
        "password": hash_password("password123"),
        "phone": "+91 99403 45678",
        "location": "Hostel Blocks A, B, C & Rooftops",
        "experienceYears": 6,
        "category": "plumbing",
        "rating": 4.89,
        "reviewsCount": 39,
        "status": "Available",
        "completedJobs": 125,
        "avatar": "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80",
        "role": "technician"
    }
]

INITIAL_COMPLAINTS = [
    {
        "id": "CMP-2026-101",
        "userId": "USR-001",
        "userName": "Babu M",
        "userPhone": "+91 98765 43210",
        "title": "Severe PVC pipe leak flooding washroom floor",
        "description": "Water is bursting from the PVC pipe joint beneath the washbasin. Puddles are expanding rapidly.",
        "category": "plumbing",
        "location": "Hostel Block C, Washroom 204",
        "inputMode": "image",
        "imageUrl": "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&auto=format&fit=crop&q=80",
        "language": "en",
        "status": "In Progress",
        "severity": "High (Unsafe/Urgent)",
        "isSafeForDIY": False,
        "aiDiagnosis": {
            "category": "plumbing",
            "possibleIssue": "Damaged High-Pressure PVC Pipe Joint",
            "confidence": 0.96,
            "explanation": "I detected that your water pipe has a possible leakage problem due to a pressurized joint disconnection.",
            "safetyAssessment": "UNSAFE: Water accumulation near conduits creates electrical hazard and structural water damage. Professional plumber required.",
            "visionAnalysis": {
                "detectedObject": "Pipe Joint Water Leakage",
                "visionConfidence": 0.96,
                "boundingBox": [28.0, 24.0, 58.0, 52.0]
            }
        },
        "assignedTechnician": INITIAL_TECHNICIANS[1],
        "createdAt": "2026-09-07T07:30:00Z",
        "updatedAt": "2026-09-07T08:15:00Z",
        "timeline": [
            {"status": "Submitted", "timestamp": "2026-09-07T07:30:00Z", "note": "Issue reported with live photo"},
            {"status": "AI Confirmed", "timestamp": "2026-09-07T07:30:15Z", "note": "User confirmed AI diagnosis: Plumbing Pipe Rupture"},
            {"status": "Accepted", "timestamp": "2026-09-07T07:45:00Z", "note": "Accepted by Master Plumber Suresh Kumar"},
            {"status": "In Progress", "timestamp": "2026-09-07T08:15:00Z", "note": "Technician arrived on site with replacement coupling"}
        ],
        "feedback": None
    },
    {
        "id": "CMP-2026-102",
        "userId": "USR-001",
        "userName": "Babu M",
        "userPhone": "+91 98765 43210",
        "title": "Ceiling Fan humming loudly and wobbling",
        "description": "The ceiling fan in Room 204 makes an abrasive scraping noise and oscillates dangerously at speed 4.",
        "category": "electrical",
        "location": "Hostel Block C, Room 204",
        "inputMode": "voice",
        "imageUrl": None,
        "language": "en",
        "status": "Accepted",
        "severity": "High (Unsafe/Urgent)",
        "isSafeForDIY": False,
        "aiDiagnosis": {
            "category": "electrical",
            "possibleIssue": "Degraded Ball Bearing & Shaft Misalignment",
            "confidence": 0.93,
            "explanation": "I detected that your ceiling fan motor has a mechanical bearing failure causing hazardous vibration.",
            "safetyAssessment": "UNSAFE: Risk of fixture detachment and electrical coil overheating. Qualified electrician dispatched."
        },
        "assignedTechnician": INITIAL_TECHNICIANS[0],
        "createdAt": "2026-09-07T08:20:00Z",
        "updatedAt": "2026-09-07T08:40:00Z",
        "timeline": [
            {"status": "Submitted", "timestamp": "2026-09-07T08:20:00Z", "note": "Reported via Speech-to-Text Voice Input"},
            {"status": "Accepted", "timestamp": "2026-09-07T08:40:00Z", "note": "Assigned to Senior Electrician Karthik Raman"}
        ],
        "feedback": None
    },
    {
        "id": "CMP-2026-103",
        "userId": "USR-001",
        "userName": "Babu M",
        "userPhone": "+91 98765 43210",
        "title": "Wi-Fi Router dropping signal and blinking orange",
        "description": "Internet connection drops every few minutes. The LAN LED blinks amber.",
        "category": "network",
        "location": "Hostel Block C, Room 204",
        "inputMode": "text",
        "imageUrl": None,
        "language": "en",
        "status": "Completed",
        "severity": "Low (Safe DIY)",
        "isSafeForDIY": True,
        "aiDiagnosis": {
            "category": "network",
            "possibleIssue": "DHCP Lease Stalemate & Cable Connection Jitter",
            "confidence": 0.95,
            "explanation": "I detected that your Wi-Fi access point requires a network power-cycle and patch cable reseating.",
            "safetyAssessment": "SAFE: Safe for live guided self-repair."
        },
        "assignedTechnician": None,
        "createdAt": "2026-09-06T14:00:00Z",
        "updatedAt": "2026-09-06T14:45:00Z",
        "timeline": [
            {"status": "Submitted", "timestamp": "2026-09-06T14:00:00Z", "note": "Logged by resident"},
            {"status": "Completed", "timestamp": "2026-09-06T14:45:00Z", "note": "Resolved using Guided DIY instructions"}
        ],
        "feedback": {"rating": 5, "comment": "DIY guide worked like a charm! Router rebooted and working smoothly."}
    }
]

INITIAL_NOTIFICATIONS = [
    {
        "id": "NOTIF-01",
        "recipientId": "TECH-102",
        "title": "New Repair Request Assigned",
        "message": "Water pipe leak in Hostel Block C Washroom. High urgency.",
        "category": "plumbing",
        "priority": "High",
        "complaintId": "CMP-2026-101",
        "isRead": False,
        "createdAt": "2026-09-07T07:30:15Z"
    },
    {
        "id": "NOTIF-02",
        "recipientId": "USR-001",
        "title": "Technician Suresh Kumar Assigned",
        "message": "Master Plumber Suresh Kumar is heading to your location (+91 97890 56789).",
        "category": "plumbing",
        "priority": "Normal",
        "complaintId": "CMP-2026-101",
        "isRead": False,
        "createdAt": "2026-09-07T07:45:00Z"
    }
]

INITIAL_VERIFIED_KNOWLEDGE = [
    {
        "id": "KB-2026-001",
        "category": "plumbing",
        "title": "Quarter-Turn Basin Tap Water Dripping / Loose Spindle",
        "keywords": ["tap", "dripping", "leak", "faucet", "washer", "குழாய்", "தண்ணீர்"],
        "identifiedProblem": "Ceramic Disc Cartridge Washer Wear & Mineral Scale Accumulation",
        "possibleCauses": [
            "Worn-out rubber O-ring seal at base of cartridge",
            "Mineral calcification preventing full ceramic disc closure"
        ],
        "verifiedSolution": [
            "Shut OFF the angle stop valve beneath the sink basin",
            "Pop off the tap index cap and loosen the set screw with a 2.5mm Allen key",
            "Unscrew the cartridge collar using an adjustable wrench and remove cartridge",
            "Soak in warm vinegar or replace worn O-ring, apply silicone grease, re-seat cartridge firmly"
        ],
        "requiredTools": ["Adjustable Wrench", "2.5mm Hex/Allen Key", "Replacement O-ring", "Teflon Tape"],
        "safetyInstructions": ["Isolate angle stop valve first to prevent high pressure spray", "Place a towel in the drain to prevent screws falling in"],
        "verificationScore": 0.96,
        "consensusConfidence": 0.94,
        "verifiedBy": "Multi-LLM Consensus Engine (ChatGPT + DeepSeek + Gemini)",
        "userRating": 4.9,
        "successCount": 42,
        "createdAt": "2026-09-01T12:00:00Z"
    },
    {
        "id": "KB-2026-002",
        "category": "electrical",
        "title": "Ceiling Fan Regulator / Capacitor Failure Causing Low Speed",
        "keywords": ["fan", "slow", "capacitor", "speed", "regulator", "மின்விசிறி", "மெதுவாக"],
        "identifiedProblem": "De-rated Electrolytic Motor Run Capacitor (2.25uF - 2.5uF)",
        "possibleCauses": [
            "Thermal degradation of internal electrolyte reducing capacitance below 1.5uF",
            "Loose terminal crimp connection at upper canopy junction block"
        ],
        "verifiedSolution": [
            "Switch OFF both the room wall switch and the room MCB circuit breaker",
            "Lower the top canopy shroud and discharge the old capacitor with an insulated screwdriver",
            "Note wire connections, unscrew the clamp, and install a fresh 2.5uF 440V AC capacitor",
            "Tighten terminal block screws, secure canopy, restore MCB and verify 5-speed airflow"
        ],
        "requiredTools": ["Line Voltage Tester", "Insulated Screwdriver", "2.5uF 440V Fan Capacitor", "Wire Stripper"],
        "safetyInstructions": ["Mandatory: Shut OFF room MCB breaker before touching fan wiring", "Discharge capacitor terminals before handling"],
        "verificationScore": 0.98,
        "consensusConfidence": 0.96,
        "verifiedBy": "Multi-LLM Consensus Engine (ChatGPT + DeepSeek + Gemini)",
        "userRating": 4.95,
        "successCount": 58,
        "createdAt": "2026-09-02T15:30:00Z"
    },
    {
        "id": "KB-2026-003",
        "category": "network",
        "title": "Wi-Fi Router High Packet Loss / Stale IP Allocation",
        "keywords": ["wifi", "router", "internet", "lan", "slow", "disconnect", "drop", "வைஃபை"],
        "identifiedProblem": "DHCP ARP Cache Overload & RJ45 Pin Oxidation",
        "possibleCauses": [
            "Lease table overflow from multiple devices causing broadcast storms",
            "Unseated CAT6 patch cord in WAN gateway port"
        ],
        "verifiedSolution": [
            "Power down the router and optical ONT terminal for 45 seconds",
            "Inspect RJ45 clip connectors for debris, firmly re-seat into WAN/LAN1 ports until clicking",
            "Power ON optical terminal first, wait 90 seconds for PON LED solid green, then power router",
            "Log in to gateway admin panel (192.168.1.1) and clear DHCP client leases"
        ],
        "requiredTools": ["CAT6 Ethernet Patch Cord", "Dry Lint-Free Microfiber Cloth"],
        "safetyInstructions": ["Use only OEM 12V DC power adapter to prevent voltage spike", "Do not bend fiber optic patch cord below 30mm radius"],
        "verificationScore": 0.95,
        "consensusConfidence": 0.92,
        "verifiedBy": "Multi-LLM Consensus Engine (ChatGPT + DeepSeek + Gemini)",
        "userRating": 4.88,
        "successCount": 35,
        "createdAt": "2026-09-03T09:00:00Z"
    }
]

# In-memory storage cache
storage = {
    "users": copy.deepcopy(INITIAL_USERS),
    "technicians": copy.deepcopy(INITIAL_TECHNICIANS),
    "complaints": copy.deepcopy(INITIAL_COMPLAINTS),
    "notifications": copy.deepcopy(INITIAL_NOTIFICATIONS),
    "verified_knowledge": copy.deepcopy(INITIAL_VERIFIED_KNOWLEDGE),
    "chat_history": []
}

class DatabaseManager:
    def __init__(self):
        self.client = None
        self.db = None
        self.use_mongo = False

    async def connect(self):
        try:
            self.client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI, serverSelectionTimeoutMS=2000)
            await self.client.admin.command('ping')
            self.db = self.client[DB_NAME]
            self.use_mongo = True
            print(f"[MongoDB] FixLink connected to MongoDB database '{DB_NAME}' at {MONGO_URI}")
            await self.seed_initial_data()
        except Exception as e:
            print(f"[MongoDB Fallback] Notice: Running with robust in-memory storage ({e})")
            self.use_mongo = False
            storage["users"] = list(INITIAL_USERS)
            storage["technicians"] = list(INITIAL_TECHNICIANS)
            storage["complaints"] = list(INITIAL_COMPLAINTS)
            storage["notifications"] = list(INITIAL_NOTIFICATIONS)

    async def seed_initial_data(self):
        if not self.use_mongo:
            return

        if await self.db.users.count_documents({}) == 0:
            await self.db.users.insert_many([copy.deepcopy(u) for u in INITIAL_USERS])

        # Ensure all initial technicians are present in MongoDB
        for t in INITIAL_TECHNICIANS:
            existing = await self.db.technicians.find_one({"email": t["email"].lower()})
            if not existing:
                await self.db.technicians.insert_one(copy.deepcopy(t))

        if await self.db.complaints.count_documents({}) == 0:
            await self.db.complaints.insert_many([copy.deepcopy(c) for c in INITIAL_COMPLAINTS])
        if await self.db.notifications.count_documents({}) == 0:
            await self.db.notifications.insert_many([copy.deepcopy(n) for n in INITIAL_NOTIFICATIONS])
        if await self.db.verified_knowledge.count_documents({}) == 0:
            await self.db.verified_knowledge.insert_many([copy.deepcopy(k) for k in INITIAL_VERIFIED_KNOWLEDGE])
        print("[MongoDB] FixLink collections verified & seeded.")

    # User Operations
    async def find_user_by_email(self, email: str):
        if self.use_mongo:
            doc = await self.db.users.find_one({"email": email.lower()}, {"_id": 0})
            return sanitize_doc(doc)
        for u in storage["users"]:
            if u["email"].lower() == email.lower():
                return sanitize_doc(u)
        return None

    async def create_user(self, user_doc: dict):
        clean = copy.deepcopy(user_doc)
        if self.use_mongo:
            await self.db.users.insert_one(clean)
        storage["users"].append(sanitize_doc(user_doc))
        return sanitize_doc(user_doc)

    async def update_user_password(self, email: str, new_hashed_password: str):
        if self.use_mongo:
            await self.db.users.update_one({"email": email.lower()}, {"$set": {"password": new_hashed_password}})
        for u in storage["users"]:
            if u["email"].lower() == email.lower():
                u["password"] = new_hashed_password
                return sanitize_doc(u)
        return None

    # Technician Operations
    async def find_technician_by_email(self, email: str):
        if self.use_mongo:
            doc = await self.db.technicians.find_one({"email": email.lower()}, {"_id": 0})
            return sanitize_doc(doc)
        for t in storage["technicians"]:
            if t["email"].lower() == email.lower():
                return sanitize_doc(t)
        return None

    async def update_technician_password(self, email: str, new_hashed_password: str):
        if self.use_mongo:
            await self.db.technicians.update_one({"email": email.lower()}, {"$set": {"password": new_hashed_password}})
        for t in storage["technicians"]:
            if t["email"].lower() == email.lower():
                t["password"] = new_hashed_password
                return sanitize_doc(t)
        return None

    async def find_technician_by_id(self, tech_id: str):
        if self.use_mongo:
            doc = await self.db.technicians.find_one({"id": tech_id}, {"_id": 0})
            return sanitize_doc(doc)
        for t in storage["technicians"]:
            if t["id"] == tech_id:
                return sanitize_doc(t)
        return None

    async def get_all_technicians(self):
        if self.use_mongo:
            cursor = self.db.technicians.find({}, {"_id": 0})
            docs = await cursor.to_list(length=100)
            return sanitize_doc(docs)
        return sanitize_doc(storage["technicians"])

    async def create_technician(self, tech_doc: dict):
        clean = copy.deepcopy(tech_doc)
        if self.use_mongo:
            await self.db.technicians.insert_one(clean)
        storage["technicians"].append(sanitize_doc(tech_doc))
        return sanitize_doc(tech_doc)

    async def update_technician_status(self, tech_id: str, status: str):
        return await self.update_technician(tech_id, {"status": status})

    async def update_technician(self, tech_id: str, updates: dict):
        if self.use_mongo:
            mongo_updates = updates
            if not any(k.startswith("$") for k in updates):
                mongo_updates = {"$set": updates}
            await self.db.technicians.update_one({"id": tech_id}, mongo_updates)
        for t in storage["technicians"]:
            if t["id"] == tech_id:
                if "$set" in updates:
                    t.update(updates["$set"])
                if "$inc" in updates:
                    for k, v in updates["$inc"].items():
                        t[k] = t.get(k, 0) + v
                if not any(k.startswith("$") for k in updates):
                    t.update(updates)
                return sanitize_doc(t)
        return None

    # Complaint Operations
    async def get_complaints(self, user_id=None, technician_id=None, status=None):
        if self.use_mongo:
            query = {}
            if user_id:
                query["userId"] = user_id
            if technician_id:
                query["assignedTechnician.id"] = technician_id
            if status and status != "all":
                query["status"] = {"$regex": f"^{status}$", "$options": "i"}
            cursor = self.db.complaints.find(query, {"_id": 0}).sort("createdAt", -1)
            docs = await cursor.to_list(length=200)
            return sanitize_doc(docs)

        results = list(storage["complaints"])
        if user_id:
            results = [c for c in results if c.get("userId") == user_id]
        if technician_id:
            results = [c for c in results if (c.get("assignedTechnician") or {}).get("id") == technician_id]
        if status and status != "all":
            results = [c for c in results if c.get("status", "").lower() == status.lower()]
        results.sort(key=lambda x: x.get("createdAt", ""), reverse=True)
        return sanitize_doc(results)

    async def get_complaint_by_id(self, complaint_id: str):
        if self.use_mongo:
            doc = await self.db.complaints.find_one({"id": complaint_id}, {"_id": 0})
            return sanitize_doc(doc)
        for c in storage["complaints"]:
            if c.get("id") == complaint_id:
                return sanitize_doc(c)
        return None

    async def create_complaint(self, complaint_doc: dict):
        clean = copy.deepcopy(complaint_doc)
        if self.use_mongo:
            await self.db.complaints.insert_one(clean)
        storage["complaints"].insert(0, sanitize_doc(complaint_doc))
        return sanitize_doc(complaint_doc)

    async def update_complaint(self, complaint_id: str, updates: dict):
        if self.use_mongo:
            await self.db.complaints.update_one({"id": complaint_id}, {"$set": updates})
        for c in storage["complaints"]:
            if c.get("id") == complaint_id:
                c.update(updates)
                return sanitize_doc(c)
        return None

    # Notification Operations
    async def create_notification(self, notif_doc: dict):
        clean = copy.deepcopy(notif_doc)
        if self.use_mongo:
            await self.db.notifications.insert_one(clean)
        storage["notifications"].insert(0, sanitize_doc(notif_doc))
        return sanitize_doc(notif_doc)

    async def get_notifications(self, recipient_id: str):
        if self.use_mongo:
            cursor = self.db.notifications.find({"recipientId": recipient_id}, {"_id": 0}).sort("createdAt", -1)
            docs = await cursor.to_list(length=50)
            return sanitize_doc(docs)
        return sanitize_doc([n for n in storage["notifications"] if n.get("recipientId") == recipient_id])

    async def mark_notifications_read(self, recipient_id: str):
        if self.use_mongo:
            await self.db.notifications.update_many({"recipientId": recipient_id}, {"$set": {"isRead": True}})
        for n in storage["notifications"]:
            if n.get("recipientId") == recipient_id:
                n["isRead"] = True

    # Chat History Operations
    async def save_chat_message(self, user_id: str, message_doc: dict):
        doc = copy.deepcopy(message_doc)
        doc["userId"] = user_id
        if "createdAt" not in doc:
            doc["createdAt"] = datetime.now(timezone.utc).isoformat()
        if self.use_mongo:
            await self.db.chat_history.insert_one(copy.deepcopy(doc))
        storage["chat_history"].append(sanitize_doc(doc))
        return sanitize_doc(doc)

    async def get_chat_history(self, user_id: str, limit: int = 50):
        if self.use_mongo:
            cursor = self.db.chat_history.find({"userId": user_id}, {"_id": 0}).sort("createdAt", 1)
            docs = await cursor.to_list(length=limit)
            return sanitize_doc(docs)
        user_msgs = [m for m in storage["chat_history"] if m.get("userId") == user_id]
        user_msgs.sort(key=lambda x: x.get("createdAt", ""))
        return sanitize_doc(user_msgs[-limit:])

    async def clear_chat_history(self, user_id: str):
        if self.use_mongo:
            await self.db.chat_history.delete_many({"userId": user_id})
        storage["chat_history"] = [m for m in storage["chat_history"] if m.get("userId") != user_id]
        return True

    # ── Verified Solutions Knowledge Base Operations ────────────────────────
    async def save_verified_solution(self, solution_doc: dict):
        doc = copy.deepcopy(solution_doc)
        if "id" not in doc:
            doc["id"] = f"KB-{int(time.time()*1000)}"
        if "createdAt" not in doc:
            doc["createdAt"] = datetime.now(timezone.utc).isoformat()
        if "userRating" not in doc:
            doc["userRating"] = 5.0
        if "successCount" not in doc:
            doc["successCount"] = 1

        if self.use_mongo:
            await self.db.verified_knowledge.insert_one(copy.deepcopy(doc))
        storage["verified_knowledge"].insert(0, sanitize_doc(doc))
        return sanitize_doc(doc)

    async def get_verified_solutions(self, category: Optional[str] = None, limit: int = 50):
        if self.use_mongo:
            query = {}
            if category and category != "all":
                query["category"] = category.lower()
            cursor = self.db.verified_knowledge.find(query, {"_id": 0}).sort("createdAt", -1)
            docs = await cursor.to_list(length=limit)
            return sanitize_doc(docs)

        results = list(storage.get("verified_knowledge", []))
        if category and category != "all":
            results = [k for k in results if k.get("category", "").lower() == category.lower()]
        return sanitize_doc(results[:limit])

    async def search_verified_knowledge(self, query_text: str, category: Optional[str] = None) -> List[dict]:
        all_kb = await self.get_verified_solutions(category=category, limit=100)
        q_lower = (query_text or "").lower()
        terms = [t for t in q_lower.split() if len(t) > 2]

        def match_score(item):
            score = 0
            title = (item.get("title") or "").lower()
            prob = (item.get("identifiedProblem") or "").lower()
            kws = [k.lower() for k in item.get("keywords", [])]
            for term in terms:
                if term in title: score += 3
                if term in prob: score += 2
                if any(term in kw for kw in kws): score += 3
            return score

        scored = [(match_score(k), k) for k in all_kb]
        scored.sort(key=lambda x: x[0], reverse=True)
        return [k for s, k in scored if s > 0][:5]

db_manager = DatabaseManager()
