import re
from typing import Dict, Any, List

def match_words(word_list: List[str], text: str) -> bool:
    for w in word_list:
        if w.isascii() and w.isalnum():
            if re.search(r'\b' + re.escape(w) + r'\b', text, re.IGNORECASE):
                return True
        else:
            if w in text:
                return True
    return False

HAZARD_KEYWORDS = [
    "spark", "shock", "smoke", "fire", "blast", "explosion", "burning",
    "burnt", "burning smell", "smell varuthu", "smell aaguthu",
    "gas", "short circuit", "burst", "flooding", "high voltage", "collapse",
    "broken glass", "deep crack", "sewage overflow", "overheat", "overheating",
    # Regional keywords
    "நெருப்பு", "புகை", "மின்கசிவு", "வெடிப்பு", "கருகிய வாசனை", "எரிந்த வாசனை",
    "ஆபத்து", "எரியுது", "சூடாகுது",
    "आग", "धुआं", "करंट", "धमाका", "गैस लीक", "जलने की बदबू",
    "మంటలు", "పొగ", "కరెంట్ షాక్",
    "തീ", "പുക", "ഷോക്ക്",
    "ಬೆಂಕಿ", "ಹೊಗೆ", "ಶಾಕ್"
]

SAFE_DIY_GUIDES_EN = {
    "electrical": {
        "title": "Loose Switch Plate or Bulb Replacement",
        "estimatedMinutes": 10,
        "tools": ["Insulated Flathead Screwdriver", "Safety Rubber Gloves", "Voltage Tester Pen"],
        "parts": ["Replacement LED Bulb or Switch Faceplate (Matching Spec)"],
        "precautions": [
            "Shut off the room circuit breaker before touching any socket fixture.",
            "Confirm zero voltage using the tester pen before working.",
            "Never perform repairs with wet hands or bare feet."
        ],
        "steps": [
            "Turn OFF the wall switch and the corresponding circuit breaker in the distribution box.",
            "Test socket terminals with the voltage tester to ensure current is dead.",
            "Use the insulated screwdriver to loosen the mounting screws counter-clockwise.",
            "Clean internal dust with a dry cloth and check that wire leads are seated tightly in the terminal screws.",
            "Align faceplate flush to wall, tighten screws until snug, and restore main power."
        ]
    },
    "plumbing": {
        "title": "Minor Tap Leak & Aerator Cleaning",
        "estimatedMinutes": 15,
        "tools": ["Adjustable Spanner / Wrench", "Teflon Thread Seal Tape", "Old Toothbrush", "Cleaning Vinegar"],
        "parts": ["Rubber Washer / O-ring (1/2 inch standard)"],
        "precautions": [
            "Turn off the under-sink water stopcock valve first.",
            "Wrap wrench jaws with cloth to avoid scratching metallic tap finish."
        ],
        "steps": [
            "Locate the isolation angle valve below the sink and rotate clockwise to shut water.",
            "Unscrew the spout aerator tip with the wrench and rinse out accumulated sand/grit.",
            "Soak the mesh filter cartridge in vinegar for 5 minutes to dissolve limescale.",
            "Wrap 3 turns of Teflon plumbers tape clockwise over the threaded nozzle.",
            "Replace worn rubber washer, re-tighten the aerator firmly, and restore water."
        ]
    },
    "infrastructure": {
        "title": "Squeaky / Misaligned Door Hinge Fix",
        "estimatedMinutes": 8,
        "tools": ["Phillips Screwdriver", "WD-40 / Silicone Lubricant Spray", "Microfiber Rag"],
        "parts": ["1.5-inch Wood Screws (if existing holes stripped)"],
        "precautions": [
            "Place a rag underneath hinge to prevent oil dripping onto floor.",
            "Keep children and pets away from lubricated metal surfaces."
        ],
        "steps": [
            "Wipe away loose dust and rust from top and bottom hinge plates with a cloth.",
            "Apply 2 short bursts of lubricant spray directly into hinge pin gaps.",
            "Swing the door back and forth 10 times to circulate lubricant into internal knuckles.",
            "Tighten any loose frame screws firmly with the Phillips screwdriver.",
            "Wipe off excess lubricant with the rag."
        ]
    },
    "cleaning": {
        "title": "Corridor Surface Spill & Odor Neutralization",
        "estimatedMinutes": 12,
        "tools": ["Microfiber Mop", "Rubber Cleaning Gloves", "Safety Wet-Floor Sign"],
        "parts": ["Hospital-Grade Neutral Disinfectant Cleaner"],
        "precautions": [
            "Always erect the wet-floor cautionary sign prior to mopping."
        ],
        "steps": [
            "Put on protective rubber gloves and dilute 30ml disinfectant into a mop bucket.",
            "Place the wet-floor caution triangle visibly at the corridor entrance.",
            "Mop the spill inward towards the center to avoid spreading contamination.",
            "Perform a final rinse mop with clean warm water and let dry naturally for 5 minutes."
        ]
    },
    "network": {
        "title": "Wi-Fi Router Reset & Patch Cable Reseating",
        "estimatedMinutes": 5,
        "tools": ["None required (Finger-operated)"],
        "parts": ["Cat6 RJ45 Patch Cord (Optional if damaged)"],
        "precautions": [
            "Do NOT press the needle factory-reset button unless advised by IT."
        ],
        "steps": [
            "Unplug the black power adapter cord from the rear of the router.",
            "Inspect the Ethernet cable connector clip; ensure it clicks firmly into the WAN port.",
            "Wait 30 full seconds for internal capacitors to discharge.",
            "Plug power adapter back in and wait 90 seconds for internet LED to glow solid green.",
            "Reconnect your device and test speed on campus intranet."
        ]
    },
    "security": {
        "title": "CCTV Dome Lens Wipe & Angle Adjustment",
        "estimatedMinutes": 7,
        "tools": ["Microfiber Optical Lens Cloth", "Step Ladder (Certified)"],
        "parts": ["None"],
        "precautions": [
            "Ensure ladder legs are locked firmly on flat ground before ascending."
        ],
        "steps": [
            "Visually check camera status LED indicator (steady green/blue).",
            "Climb ladder carefully and gently wipe glass dome in circular motions with optical cloth.",
            "Ensure sun visor is shielded from direct lamp glare.",
            "Verify live video feed clarity on monitoring terminal."
        ]
    },
    "other": {
        "title": "General Minor Fastener Tightening",
        "estimatedMinutes": 10,
        "tools": ["Multi-bit Screwdriver", "Pliers"],
        "parts": ["Lock Washers"],
        "precautions": ["Do not overtighten screws into plastic or cast iron."],
        "steps": [
            "Inspect loose component and check for stripped threads.",
            "Align mating surfaces and tighten bolts in a cross-pattern.",
            "Test mechanical stability by applying light manual pressure."
        ]
    },
    "keyboard": {
        "title": "Keyboard Keycap / Cable / Unresponsive Key Troubleshooting",
        "estimatedMinutes": 5,
        "tools": ["Keycap Puller or Tweezers", "Compressed Air Can / Soft Brush", "Cotton Swab & Isopropyl Alcohol"],
        "parts": ["Replacement Key Switch or USB Cable / Wireless Dongle"],
        "precautions": [
            "Unplug the keyboard from computer / USB port before cleaning or removing keycaps.",
            "Do not pour liquid cleaner directly onto the keyboard PCB board."
        ],
        "steps": [
            "Unplug the USB connector or turn off wireless power switch.",
            "Gently pull up the stuck or broken keycap vertically using tweezers or keycap puller.",
            "Clear accumulated dust, debris, or food particles beneath the membrane/switch with compressed air.",
            "Inspect the mechanical stem or rubber dome for damage; re-seat the keycap firmly until it clicks.",
            "Plug into an alternate USB 3.0 port on the CPU to verify key recognition in Device Manager."
        ]
    },
    "mouse": {
        "title": "Optical Mouse Sensor & Click Switch Troubleshooting",
        "estimatedMinutes": 5,
        "tools": ["Cotton Swab", "Rubbing Alcohol"],
        "parts": ["AA/AAA Battery (if wireless)"],
        "precautions": ["Never look directly into the infrared/optical sensor LED."],
        "steps": [
            "Unplug mouse USB cable or replace wireless mouse batteries.",
            "Clean the optical lens cavity underneath using a dry cotton swab.",
            "Test click micro-switches by pressing 10 times to dislodge dust.",
            "Plug into a direct motherboard USB port to test tracking."
        ]
    },
    "fan": {
        "title": "Ceiling / Table Fan Speed & Cleaning Walkthrough",
        "estimatedMinutes": 10,
        "tools": ["Dry Microfiber Cloth", "Insulated Screwdriver", "Tester Pen"],
        "parts": ["Fan Regulator Knob / Capacitor (if required)"],
        "precautions": [
            "Switch off wall switch and MCB breaker before touching fan components.",
            "Do not stop moving blades manually with hands."
        ],
        "steps": [
            "Turn off the fan switch and confirm power isolation with voltage tester.",
            "Wipe accumulated dust from fan blades and motor housing with a dry cloth.",
            "Inspect speed regulator knob on the wall board to ensure tight physical contact.",
            "Check that suspension down-rod bolts and safety pins are firmly tightened.",
            "Turn on power and test operation through all speed steps (1 through 5)."
        ]
    },
    "light": {
        "title": "Tube Light / LED Bulb Replacement & Fixture Check",
        "estimatedMinutes": 8,
        "tools": ["Dry Clean Cloth", "Replacement LED Bulb", "Step Stool"],
        "parts": ["Matching Spec LED Bulb or Starter"],
        "precautions": [
            "Ensure switch is turned OFF; bulbs can be very hot immediately after use.",
            "Never replace bulbs with wet hands."
        ],
        "steps": [
            "Switch off wall power switch and wait 2 minutes for the bulb to cool down.",
            "Gently rotate the bulb counter-clockwise to release it from the socket.",
            "Clean holder contacts with a dry cloth and align the new bulb pins.",
            "Push gently and rotate clockwise until firmly locked in position.",
            "Turn switch back on and verify steady, flicker-free illumination."
        ]
    },
    "switch": {
        "title": "Loose Switch Plate & Socket Fastener Adjustment",
        "estimatedMinutes": 10,
        "tools": ["Insulated Flathead Screwdriver", "Voltage Tester Pen", "Rubber Gloves"],
        "parts": ["Switch Faceplate / Screws"],
        "precautions": [
            "Always shut off the room circuit breaker before touching switch terminals.",
            "Verify absence of voltage with tester before proceeding."
        ],
        "steps": [
            "Switch OFF circuit breaker (MCB) in distribution board.",
            "Use voltage tester on socket contacts to guarantee zero electric current.",
            "Loosen faceplate screws counter-clockwise and check for loose terminal wires.",
            "Carefully tighten terminal connection screws with insulated screwdriver.",
            "Secure faceplate flush against wall, tighten screws, and restore MCB power."
        ]
    },
    "ac": {
        "title": "Air Conditioner (AC) Air Filter Cleaning & Power Check",
        "estimatedMinutes": 12,
        "tools": ["Dry Cloth", "Soft Brush", "Luke-warm Water"],
        "parts": ["None"],
        "precautions": ["Turn off AC main isolator switch before opening front cover."],
        "steps": [
            "Power down the AC unit and unplug or flip wall breaker switch.",
            "Gently lift the front intake grille panel until it clicks into position.",
            "Slide out the dual mesh air filters and wash under running warm water.",
            "Allow filters to dry completely in shade before re-installing.",
            "Re-insert filters into guide rails, close front panel, and test cooling."
        ]
    },
    "geyser": {
        "title": "Water Heater (Geyser) Power & Inlet Valve Check",
        "estimatedMinutes": 10,
        "tools": ["Tester Pen", "Dry Cloth"],
        "parts": ["None"],
        "precautions": ["Never touch geyser metal tank when power switch is ON."],
        "steps": [
            "Turn OFF geyser switch and check plug pin for burning marks.",
            "Verify cold water inlet valve below geyser is fully rotated open.",
            "Ensure geyser tank is completely full of water before turning on power.",
            "Turn ON power switch and verify red heating indicator lamp illuminates.",
            "Wait 10 minutes and check tap for warm water discharge."
        ]
    },
    "tap": {
        "title": "Water Tap Washer & Leak Repair Walkthrough",
        "estimatedMinutes": 12,
        "tools": ["Adjustable Spanner / Wrench", "Teflon Thread Seal Tape"],
        "parts": ["Rubber Washer (1/2 inch standard)"],
        "precautions": ["Turn off the under-sink water stopcock valve first."],
        "steps": [
            "Locate and rotate the angle stop valve clockwise to shut off water.",
            "Unscrew the tap spout head with wrench counter-clockwise.",
            "Inspect and remove worn internal rubber washer; insert new washer.",
            "Wrap 3 turns of Teflon plumbers tape over thread ridges.",
            "Re-tighten tap firmly, open water valve, and inspect for leaks."
        ]
    },
    "drain": {
        "title": "Sink & Floor Drainage Clog Removal",
        "estimatedMinutes": 10,
        "tools": ["Suction Plunger", "Protective Gloves", "Warm Water"],
        "parts": ["Baking Soda / Vinegar (Optional)"],
        "precautions": ["Do not pour hazardous concentrated acid chemicals into pipes."],
        "steps": [
            "Remove surface hair and debris from drain strainer with gloves.",
            "Place plunger firmly over the drain opening to create an airtight seal.",
            "Push and pull plunger vigorously 5 to 6 times to dislodge the obstruction.",
            "Pour hot water down the drain to flush remaining loosened residue.",
            "Run cold tap water to confirm normal, free-flowing drainage."
        ]
    },
    "flush": {
        "title": "Toilet Flush Tank & Water Fill Valve Inspection",
        "estimatedMinutes": 10,
        "tools": ["Spanner", "Rubber Gloves"],
        "parts": ["Flush Flapper / Float Ball"],
        "precautions": ["Shut off the toilet inlet mini-valve before opening tank lid."],
        "steps": [
            "Rotate the cistern water inlet angle valve clockwise to stop refill.",
            "Carefully lift cistern tank ceramic lid and set aside safely.",
            "Inspect lift chain and ensure flapper seal rests flat on the outlet valve.",
            "Adjust float arm if water level was overflowing the siphon tube.",
            "Turn on inlet valve and depress flush lever to test complete discharge."
        ]
    },
    "door": {
        "title": "Door Surface Crack Patching, Hinge & Latch Alignment",
        "estimatedMinutes": 10,
        "tools": ["Phillips Screwdriver", "Wood Filler / Epoxy Putty", "Sandpaper (120 Grit)", "Lubricant Oil / Spray"],
        "parts": ["Wood Screws / Surface Sealant"],
        "precautions": [
            "Keep oil from dripping onto tiles to prevent slipping.",
            "Wipe away excess putty immediately before it hardens."
        ],
        "steps": [
            "Clean the cracked surface seam or hinge area with a dry microfiber cloth.",
            "For surface cracks: Apply wood filler or epoxy repair putty evenly along the crack and smooth flat.",
            "Allow the repair compound to set for 15 minutes, then lightly sand flush with the door panel.",
            "Apply 2 drops of lubricant oil into hinge knuckles and tighten loosened mounting screws firmly.",
            "Swing the door open and shut to verify smooth clearance and positive latch closure."
        ]
    },
    "chair": {
        "title": "Chair / Study Desk Fastener & Leveling Fix",
        "estimatedMinutes": 8,
        "tools": ["Screwdriver", "Allen Key", "Adjustable Spanner"],
        "parts": ["Lock Washers / Screws"],
        "precautions": ["Do not over-torque bolts into wooden panels."],
        "steps": [
            "Inspect wobbling legs and locate loosened connecting bolts underneath.",
            "Tighten all leg bracket screws in a criss-cross pattern.",
            "Adjust bottom leveling rubber pads to eliminate uneven ground tilt.",
            "Apply downward test pressure to confirm sturdy mechanical support."
        ]
    },
    "wifi": {
        "title": "Wi-Fi Router Reset & Patch Cable Reseating",
        "estimatedMinutes": 5,
        "tools": ["Finger-operated"],
        "parts": ["RJ45 Ethernet Cable (Optional)"],
        "precautions": ["Do not press pinhole factory reset button without IT."],
        "steps": [
            "Unplug router black DC power adapter from the wall outlet.",
            "Inspect blue WAN ethernet cable and press until locking tab clicks.",
            "Wait 30 seconds for power capacitors to discharge.",
            "Plug power adapter back in and wait 90 seconds for green lights.",
            "Connect device and verify connectivity on browser."
        ]
    }
}

SAFE_DIY_GUIDES_TA = {
    "fan": {
        "title": "மின்விசிறி இயக்கம் & தூசி சுத்தம் செய்தல் வழிகாட்டி",
        "estimatedMinutes": 10,
        "tools": ["உலர் துணி / தூரிகை", "ஸ்க்ரூடிரைவர்", "வோல்டேஜ் டெஸ்டர்"],
        "parts": ["மின்விசிறி ரெகுலேட்டர் (தேவைப்பட்டால்)"],
        "precautions": [
            "மின்விசிறியை தொடுவதற்கு முன் சுவிட்ச் மற்றும் MCB-யை கட்டாயம் அணைக்கவும்.",
            "சுழலும் பிளேடுகளை கைகளால் நிறுத்த முயற்சிக்காதீர்கள்.",
            "ஈரமான கைகளுடன் மின் சாதனங்களை தொடாதீர்கள்."
        ],
        "steps": [
            "மின்விசிறி சுவிட்சை ஆஃப் செய்து, மின்சாரம் முற்றிலும் துண்டிக்கப்பட்டுள்ளதா என டெஸ்டர் கொண்டு உறுதி செய்யவும்.",
            "மின்விசிறி பிளேடுகள் மற்றும் மோட்டார் பகுதியில் படிந்துள்ள தூசியை உலர் துணியால் துடைக்கவும்.",
            "சுவிட்ச் போர்டில் உள்ள ரெகுலேட்டர் தளர்வாக உள்ளதா அல்லது சுவிட்ச் சரியாக வேலை செய்கிறதா எனப் பார்க்கவும்.",
            "மின்விசிறி தொங்கும் கம்பியின் திருகுகள் இறுக்கமாக உள்ளதா என ஸ்க்ரூடிரைவர் கொண்டு சரிபார்க்கவும்.",
            "சுவிட்சை இயக்கி குறைந்த வேகத்திலிருந்து அதிக வேகத்திற்கு சீராக சுழல்கிறதா என சோதிக்கவும்."
        ]
    },
    "light": {
        "title": "மின்விளக்கு / டியூப் லைட் மாற்றுதல் வழிகாட்டி",
        "estimatedMinutes": 8,
        "tools": ["புதிய LED பல்பு", "உலர் துணி", "ஏணி (உயரமாக இருந்தால்)"],
        "parts": ["பொருத்தமான வாட் LED பல்பு அல்லது டியூப்"],
        "precautions": [
            "சுவிட்சை அணைத்த பிறகும் பல்பு சூடாக இருக்கலாம்; துணியைப் பயன்படுத்தி கழற்றவும்.",
            "ஈரமான கைகளுடன் பல்பை தொடாதீர்கள்."
        ],
        "steps": [
            "சுவிட்சை அணைத்து 2 நிமிடங்கள் பல்பு ஆறும் வரை காத்திருக்கவும்.",
            "பழைய பல்பை கடிகார எதிர் திசையில் திருப்பி கவனமாக வெளியே எடுக்கவும்.",
            "ஹோல்டரில் உள்ள தூசியை உலர் துணியால் துடைத்து புதிய பல்பை ஹோல்டரில் பொருத்தவும்.",
            "பல்பை கடிகார திசையில் லேசாக அழுத்தி திருப்பி லாக் செய்யவும்.",
            "சுவிட்சை ஆன் செய்து வெளிச்சம் சீராக உள்ளதா என சரிபார்க்கவும்."
        ]
    },
    "switch": {
        "title": "சுவிட்ச் போர்டு மற்றும் பிளக் பாயிண்ட் சரிசெய்தல்",
        "estimatedMinutes": 10,
        "tools": ["இன்சுலேட்டட் ஸ்க்ரூடிரைவர்", "வோல்டேஜ் டெஸ்டர்", "ரப்பர் கையுறைகள்"],
        "parts": ["மாற்று சுவிட்ச் அல்லது போர்டு திருகுகள்"],
        "precautions": [
            "MCB மெயின் சுவிட்சை ஆஃப் செய்த பிறகே சுவிட்ச் போர்டை திறக்க வேண்டும்.",
            "மின்சாரம் இல்லை என்பதை டெஸ்டர் கொண்டு உறுதி செய்யவும்."
        ],
        "steps": [
            "மெயின் சுவிட்சை (MCB) ஆஃப் செய்துவிட்டு டெஸ்டர் மூலம் மின்சாரம் இல்லை என்பதை உறுதி செய்யவும்.",
            "சுவிட்ச் போர்டு வெளி மூடியை ஸ்க்ரூடிரைவர் கொண்டு மெதுவாக தளர்த்தவும்.",
            "தளர்வான ஒயர்களை ஸ்க்ரூடிரைவர் கொண்டு திருகுகளில் இறுக்கமாக பொருத்தவும்.",
            "சுவிட்ச் போர்டை சுவரில் சமமாக வைத்து திருகுகளை இறுக்கவும்.",
            "மெயின் சுவிட்சை ஆன் செய்து டெஸ்டர் மற்றும் மொபைல் சார்ஜர் மூலம் சோதனை செய்யவும்."
        ]
    },
    "ac": {
        "title": "ஏசி (AC) ஏர் ஃபில்டர் சுத்தம் மற்றும் மின் இணைப்பு சரிபார்த்தல்",
        "estimatedMinutes": 12,
        "tools": ["உலர் துணி", "வெதுவெதுப்பான நீர்", "மென்மையான பிரஷ்"],
        "parts": ["இல்லை"],
        "precautions": [
            "சுத்தம் செய்வதற்கு முன் ஏசி பவர் சுவிட்சை முற்றிலும் ஆஃப் செய்யவும்."
        ],
        "steps": [
            "ஏசியின் பிரதான பவர் சுவிட்சை அணைக்கவும்.",
            "ஏசியின் முன் பேனலை மெதுவாக மேலே உயர்த்தி இருபுறமும் உள்ள ஃபில்டர்களை வெளியே எடுக்கவும்.",
            "ஃபில்டரில் உள்ள தூசியை தண்ணீரில் கழுவி மென்மையான துணியால் துடைத்து காயவைக்கவும்.",
            "ஃபில்டரை மீண்டும் அதன் ஸ்லாட்டில் சரியாக செருகி முன் பேனலை மூடவும்.",
            "ஏசியை ஆன் செய்து ரிமோட் மூலம் கூலிங் மற்றும் ஃபேன் ஸ்பீடை சரிபார்க்கவும்."
        ]
    },
    "geyser": {
        "title": "கீசர் வாட்டர் ஹீட்டர் மின் இணைப்பு & இன்லெட் வால்வு சரிபார்த்தல்",
        "estimatedMinutes": 10,
        "tools": ["டெஸ்டர்", "உலர் துணி"],
        "parts": ["இல்லை"],
        "precautions": [
            "மின் இணைப்பு ஆன்-ல் இருக்கும்போது கீசரின் மெட்டல் பாகங்களை தொடாதீர்கள்."
        ],
        "steps": [
            "கீசர் சுவிட்சை ஆஃப் செய்து பிளக் பாயிண்ட்டில் தீய்ந்த வாசனை உள்ளதா எனப் பார்க்கவும்.",
            "கீசரின் கீழே உள்ள குளிர்ந்த நீர் இன்லெட் வால்வு முழுமையாக திறக்கப்பட்டுள்ளதா என உறுதி செய்யவும்.",
            "கீசர் தொட்டியில் தண்ணீர் முழுமையாக நிரம்பிய பிறகே மின்சாரத்தை இயக்கவும்.",
            "சுவிட்சை ஆன் செய்து சிவப்பு நிற ஹீட்டிங் இன்டிகேட்டர் எரிகிறதா எனப் பார்க்கவும்.",
            "10 நிமிடங்கள் காத்திருந்து குழாயைத் திறந்து சுடு தண்ணீர் வருகிறதா என சோதிக்கவும்."
        ]
    },
    "tap": {
        "title": "குழாய் நீர் கசிவு மற்றும் வாஷர் மாற்றுதல் வழிகாட்டி",
        "estimatedMinutes": 12,
        "tools": ["ஸ்பேனர் / ரெஞ்ச்", "டெஃப்ளான் டேப்", "பழைய பிரஷ்"],
        "parts": ["ரப்பர் வாஷர் (1/2 இன்ச்)"],
        "precautions": [
            "முதலில் சிங்க்கின் கீழ் உள்ள பிரதான நீர் வால்வை மூடவும்.",
            "ஸ்பேனரை துணியால் சுற்றி குழாயை திருப்புங்கள் (கீறல் விழாமல் இருக்க)."
        ],
        "steps": [
            "சிங்க்கின் கீழே உள்ள நீர் கட்டுப்பாட்டு வால்வை கடிகார திசையில் திருப்பி தண்ணீரை நிறுத்தவும்.",
            "குழாய் முகப்பு பகுதியை ஸ்பேனர் கொண்டு மெதுவாக கழற்றவும்.",
            "பழைய தேய்ந்த ரப்பர் வாஷரை அகற்றி புதிய வாஷரை பொருத்தவும்.",
            "குழாய் திரெட்டில் 3 முறை டெஃப்ளான் டேப்பை சுற்றவும்.",
            "குழாயை இறுக்கி பொருத்தி நீர் வால்வை திறந்து கசிவு நிற்கிறதா என சோதிக்கவும்."
        ]
    },
    "drain": {
        "title": "வாஷ்பேசின் மற்றும் வடிகால் அடைப்பு நீக்குதல்",
        "estimatedMinutes": 10,
        "tools": ["பிளஞ்சர் (Plunger)", "வெந்நீர்", "கையுறைகள்"],
        "parts": ["சமையல் சோடா / வினிகர்"],
        "precautions": [
            "கடுமையான கெமிக்கல் ஆசிட்களை குழாயில் ஊற்றாதீர்கள்."
        ],
        "steps": [
            "வாஷ்பேசினில் தேங்கியுள்ள முடி மற்றும் குப்பைகளை கையுறையுடன் அகற்றவும்.",
            "வடிகால் துளையின் மீது பிளஞ்சரை வைத்து 5 முதல் 6 முறை மேலும் கீழுமாக அழுத்தவும்.",
            "அடைப்பு தளர வெந்நீரை வடிகாலில் மெதுவாக ஊற்றவும்.",
            "தண்ணீர் தடையின்றி சீராக வெளியேறுகிறதா என குழாயைத் திறந்து சோதிக்கவும்."
        ]
    },
    "flush": {
        "title": "டாய்லெட் பிளஷ் டேங்க் மற்றும் வால்வு சரிசெய்தல்",
        "estimatedMinutes": 10,
        "tools": ["ஸ்பேனர்", "கையுறைகள்"],
        "parts": ["பிளஷ் ரப்பர் வாஷர் / ஃபிளாப்பர்"],
        "precautions": [
            "பிளஷ் டேங்க் அருகே உள்ள நீர் வால்வை மூடிவிட்டு செய்யவும்."
        ],
        "steps": [
            "பிளஷ் டேங்கிற்கு வரும் நீர் வால்வை மூடவும்.",
            "டேங்க் மூடியை அகற்றி உள்ளே உள்ள ஃப்ளோட் மற்றும் சங்கிலி சரியாக உள்ளதா எனப் பார்க்கவும்.",
            "தண்ணீர் நிற்காமல் வெளியேறினால் கீழே உள்ள ரப்பர் ஃபிளாப்பரை நேராக பொருத்தவும்.",
            "வால்வை திறந்து தண்ணீர் சரியான அளவிற்கு நிரம்பி நிற்கிறதா எனப் பார்க்கவும்.",
            "பிளஷ் பட்டனை அழுத்தி சீராக செயல்படுவதை உறுதி செய்யவும்."
        ]
    },
    "door": {
        "title": "கதவு விரிசல் சரிசெய்தல், கைப்பிடி & கீல் சீரமைப்பு",
        "estimatedMinutes": 10,
        "tools": ["ஸ்க்ரூடிரைவர்", "வுட் ஃபில்லர் / பிட்டி பசை", "தேய்ப்புத்தாள் (Sandpaper)", "லூப்ரிகண்ட் ஆயில்"],
        "parts": ["மர திருகுகள் / பிட்டி பேஸ்ட்"],
        "precautions": [
            "எண்ணெய் அல்லது பசை தரையில் சிந்தாமல் துணி வைத்துக்கொள்ளவும்."
        ],
        "steps": [
            "கதவின் விரிசல் உள்ள பகுதி மற்றும் கீல்களில் உள்ள தூசியை துடைக்கவும்.",
            "விரிசல் உள்ள இடுக்குகளில் வுட் ஃபில்லர் அல்லது எம்பாக்ஸி பசையை சீராக தடவி சமப்படுத்தவும்.",
            "10-15 நிமிடங்கள் உலரவிட்டு, தேய்ப்புத்தாள் கொண்டு கதவு பரப்பை மட்டப்படுத்தவும்.",
            "கீல்களின் இடுக்குகளில் சில துளிகள் எண்ணெய் விட்டு, தளர்வான திருகுகளை இறுக்கவும்.",
            "கதவு இலகுவாக மற்றும் தடங்கலின்றி மூடப்படுகிறதா என சரிபார்க்கவும்."
        ]
    },
    "hinge": {
        "title": "கதவு கீல் சத்தம் மற்றும் தளர்வான திருகுகள் சரிசெய்தல்",
        "estimatedMinutes": 8,
        "tools": ["ஸ்க்ரூடிரைவர்", "லூப்ரிகண்ட் ஆயில் / ஸ்பிரே", "துடைக்கும் துணி"],
        "parts": ["1.5 இன்ச் மர திருகுகள்"],
        "precautions": [
            "தரையிலோ துணியிலோ எண்ணெய் சிந்தாமல் பார்த்துக் கொள்ளுங்கள்."
        ],
        "steps": [
            "கதவு கீல்களில் படிந்துள்ள அழுக்கு மற்றும் துருவை துணியால் துடைக்கவும்.",
            "கீல்களின் இடுக்குகளில் சில துளிகள் லூப்ரிகண்ட் ஸ்பிரே அல்லது எண்ணெய் விடவும்.",
            "எண்ணெய் சீராக பரவ கதவை 8 முதல் 10 முறை திறந்து மூடவும்.",
            "தளர்வான திருகுகளை ஸ்க்ரூடிரைவர் கொண்டு இறுக்கமாக திருகவும்.",
            "கீல்களில் வழியும் அதிகப்படியான எண்ணெயை துணியால் துடைக்கவும்."
        ]
    },
    "window": {
        "title": "ஜன்னல் தாழ்ப்பாள் மற்றும் பிரேம் திருகுகள் சரிசெய்தல்",
        "estimatedMinutes": 7,
        "tools": ["ஸ்க்ரூடிரைவர்", "துடைக்கும் துணி"],
        "parts": ["தாழ்ப்பாள் திருகுகள்"],
        "precautions": [
            "கண்ணாடிப் பகுதியை பலமாக தட்டாதீர்கள்."
        ],
        "steps": [
            "ஜன்னல் தாழ்ப்பாளில் உள்ள தூசியைத் துடைக்கவும்.",
            "தளர்வான தாழ்ப்பாள் திருகுகளை ஸ்க்ரூடிரைவர் கொண்டு இறுக்கவும்.",
            "ஜன்னல் கதவு சட்டம் சரியாக பொருந்துகிறதா என திறந்து மூடி சோதிக்கவும்."
        ]
    },
    "chair": {
        "title": "நாற்காலி மற்றும் மேஜை திருகுகள் இறுக்குதல் வழிகாட்டி",
        "estimatedMinutes": 8,
        "tools": ["ஸ்க்ரூடிரைவர்", "ஆலன் கீ (Allen Key)", "ஸ்பேனர்"],
        "parts": ["வாஷர்கள் அல்லது மாற்று திருகுகள்"],
        "precautions": [
            "மரப் பலகைகளில் திருகுகளை அளவுக்கு அதிகமாக இறுக்கி மரத்தை உடைக்காதீர்கள்."
        ],
        "steps": [
            "நாற்காலி அல்லது மேஜையின் ஆடும் கால்களை பரிசோதிக்கவும்.",
            "அடியில் உள்ள அனைத்து இணைப்பு திருகுகளையும் ஸ்க்ரூடிரைவர் அல்லது ஆலன் கீ கொண்டு சமமாக இறுக்கவும்.",
            "தரையோடு சமமாக பொருந்த லெவலிங் புஷ்களை சரிசெய்யவும்.",
            "லேசான அழுத்தம் கொடுத்து ஆடாமல் உறுதியாக நிற்கிறதா என சோதிக்கவும்."
        ]
    },
    "wifi": {
        "title": "வைஃபை ரூட்டர் மற்றும் இணைய கேபிள் மறுதொடக்கம்",
        "estimatedMinutes": 5,
        "tools": ["கைவிரல்கள் போதுமானது"],
        "parts": ["Cat6 இணைய கேபிள் (தேவைப்பட்டால்)"],
        "precautions": [
            "IT தொழில்நுட்ப வல்லுநரின் அனுமதியின்றி ரீசெட் பின்னை அழுத்த வேண்டாம்."
        ],
        "steps": [
            "ரூட்டரின் பின்புறம் உள்ள பவர் கேபிளை கழற்றி அணைக்கவும்.",
            "இணைய கேபிள் (WAN/LAN) சரியாக க்ளிக் சத்தத்துடன் பொருந்தியுள்ளதா எனப் பார்க்கவும்.",
            "30 வினாடிகள் காத்திருந்து மீண்டும் பவர் கேபிளை செருகவும்.",
            "இணைய விளக்கு பச்சையாக எரியும் வரை 90 வினாடிகள் காத்திருக்கவும்.",
            "உங்கள் சாதனத்தை வைஃபை நெட்வொர்க்கில் இணைத்து சோதிக்கவும்."
        ]
    },
    "electrical": {
        "title": "தளர்வான சுவிட்ச் போர்டு அல்லது பல்பு மாற்றுதல் வழிகாட்டி",
        "estimatedMinutes": 10,
        "tools": ["இன்சுலேட்டட் ஸ்க்ரூடிரைவர்", "பாதுகாப்பு கையுறைகள்", "டெஸ்டர்"],
        "parts": ["மாற்று LED பல்பு அல்லது சுவிட்ச் ஃபேஸ்பிளேட்"],
        "precautions": [
            "சுவிட்சை தொடுவதற்கு முன் பிரதான MCB மின் இணைப்பை அணைக்கவும்.",
            "டெஸ்டர் மூலம் மின்சாரம் இல்லை என்பதை உறுதிப்படுத்தவும்.",
            "ஈரமான கைகளுடன் எதையும் தொடாதீர்கள்."
        ],
        "steps": [
            "சுவிட்ச் மற்றும் விநியோகப் பெட்டியில் உள்ள சர்க்யூட் பிரேக்கரை (MCB) ஆஃப் செய்யவும்.",
            "டெஸ்டர் கொண்டு மின்சாரம் இல்லை என்பதை உறுதி செய்யவும்.",
            "ஸ்க்ரூடிரைவர் கொண்டு திருகுகளை மெதுவாக தளர்த்தவும்.",
            "தூசியைத் துடைத்து ஒயர்கள் சரியாக பொருத்தப்பட்டுள்ளதா என சரிபார்க்கவும்.",
            "சுவிட்ச் போர்டை சுவரில் சமமாக வைத்து திருகுகளை இறுக்கவும்."
        ]
    },
    "plumbing": {
        "title": "குழாய் நீர் கசிவு & ஏரேட்டர் சுத்தம் செய்யும் முறை",
        "estimatedMinutes": 15,
        "tools": ["அட்ஜஸ்டபிள் ஸ்பேனர் / ரெஞ்ச்", "டெஃப்ளான் த்ரெட் சீல் டேப்", "பழைய டூத்பிரஷ்", "வினிகர் திரவம்"],
        "parts": ["ரப்பர் வாஷர் / O-ring (1/2 இன்ச் தர அளவு)"],
        "precautions": [
            "முதலில் சின்க் அடியில் உள்ள பிரதான தண்ணீர் வால்வை மூடவும்.",
            "குழாயில் கீறல் விழாமல் இருக்க ஸ்பேனர் தாடையில் துணியை சுற்றவும்."
        ],
        "steps": [
            "சின்க் அடியில் உள்ள ஆங்கிள் வால்வை கடிகார முள் திசையில் திருப்பி தண்ணீரை முழுமையாக நிறுத்தவும்.",
            "ஸ்பேனர் கொண்டு குழாய் முனையில் உள்ள ஏரேட்டரை கழற்றி, உள்ளே உள்ள மணல் மற்றும் துகள்களை நீரில் கழுவவும்.",
            "உப்புப் படிவங்களை கரைக்க ஃபில்டர் வலையை வினிகரில் 5 நிமிடங்கள் ஊற வைக்கவும்.",
            "குழாய் திரெட் பகுதியில் டெஃப்ளான் டேப்பை கடிகார முள் திசையில் 3 முறை இறுக்கமாக சுற்றவும்.",
            "தேய்ந்த ரப்பர் வாஷரை புதியதாக மாற்றி, ஏரேட்டரை மீண்டும் இறுக்கி மாட்டி தண்ணீர் வால்வை திறக்கவும்."
        ]
    },

    "infrastructure": {
        "title": "கதவு கீல் சத்தம் மற்றும் தளர்வான திருகுகள் சரிசெய்தல்",
        "estimatedMinutes": 8,
        "tools": ["ஸ்க்ரூடிரைவர்", "லூப்ரிகண்ட் ஆயில் / ஸ்பிரே", "துடைக்கும் துணி"],
        "parts": ["1.5 இன்ச் மர திருகுகள்"],
        "precautions": [
            "தரையிலோ துணியிலோ எண்ணெய் சிந்தாமல் பார்த்துக் கொள்ளுங்கள்."
        ],
        "steps": [
            "கதவு கீல்களில் படிந்துள்ள அழுக்கு மற்றும் துருவை துணியால் துடைக்கவும்.",
            "கீல்களின் இடுக்குகளில் சில துளிகள் லூப்ரிகண்ட் ஸ்பிரே அல்லது எண்ணெய் விடவும்.",
            "எண்ணெய் சீராக பரவ கதவை 8 முதல் 10 முறை திறந்து மூடவும்.",
            "தளர்வான திருகுகளை ஸ்க்ரூடிரைவர் கொண்டு இறுக்கமாக திருகவும்.",
            "கீல்களில் வழியும் அதிகப்படியான எண்ணெயை துணியால் துடைக்கவும்."
        ]
    },
    "cleaning": {
        "title": "மேற்பரப்பு துடைத்தல் மற்றும் துர்நாற்ற நீக்கம்",
        "estimatedMinutes": 12,
        "tools": ["மாப்", "ரப்பர் கையுறைகள்", "ஈரத்தரை எச்சரிக்கை பலகை"],
        "parts": ["கிருமிநாசினி திரவம்"],
        "precautions": [
            "துடைப்பதற்கு முன் ஈரத்தரை எச்சரிக்கை பலகையை வைக்கவும்."
        ],
        "steps": [
            "ரப்பர் கையுறைகளை அணிந்து 30 மிலி கிருமிநாசினியை ஒரு வாளி தண்ணீரில் கலக்கவும்.",
            "அறையின் நுழைவாயிலில் எச்சரிக்கை பலகையை வைக்கவும்.",
            "அழுக்கு பரவாமல் இருக்க மையப்பகுதியை நோக்கி மாப் கொண்டு துடைக்கவும்.",
            "சுத்தமான நீரால் மீண்டும் ஒருமுறை துடைத்து 5 நிமிடங்கள் உலர விடவும்."
        ]
    },
    "network": {
        "title": "வைஃபை ரூட்டர் மற்றும் இணைய கேபிள் மறுதொடக்கம்",
        "estimatedMinutes": 5,
        "tools": ["கைவிரல்கள் போதுமானது"],
        "parts": ["Cat6 இணைய கேபிள் (தேவைப்பட்டால்)"],
        "precautions": [
            "IT தொழில்நுட்ப வல்லுநரின் அனுமதியின்றி ரீசெட் பின்னை அழுத்த வேண்டாம்."
        ],
        "steps": [
            "ரூட்டரின் பின்புறம் உள்ள பவர் கேபிளை கழற்றி அணைக்கவும்.",
            "இணைய கேபிள் (WAN/LAN) சரியாக க்ளிக் சத்தத்துடன் பொருந்தியுள்ளதா எனப் பார்க்கவும்.",
            "30 வினாடிகள் காத்திருந்து மீண்டும் பவர் கேபிளை செருகவும்.",
            "இணைய விளக்கு பச்சையாக எரியும் வரை 90 வினாடிகள் காத்திருக்கவும்.",
            "உங்கள் சாதனத்தை வைஃபை நெட்வொர்க்கில் இணைத்து சோதிக்கவும்."
        ]
    },
    "security": {
        "title": "சிசிடிவி கேமரா லென்ஸ் துடைத்தல் மற்றும் கோணம் சரிசெய்தல்",
        "estimatedMinutes": 7,
        "tools": ["மென்மையான ஆப்டிகல் துணி", "ஏணி"],
        "parts": ["இல்லை"],
        "precautions": [
            "ஏணியில் ஏறும் முன் ஏணி சீராக உள்ளதா என உறுதி செய்யவும்."
        ],
        "steps": [
            "கேமராவின் நிலை காட்டி விளக்கு எரிகிறதா எனப் பார்க்கவும்.",
            "கவனமாக ஏணியில் ஏறி கண்ணாடி டோம் பகுதியை வட்ட வடிவில் துணியால் துடைக்கவும்.",
            "நேரடி விளக்கு ஒளி கேமராவில் விழாதவாறு சன்-வைசரை சரிசெய்யவும்.",
            "கண்காணிப்பு திரையில் காட்சி தெளிவாக உள்ளதா என சோதிக்கவும்."
        ]
    },
    "other": {
        "title": "பொதுவான இயந்திர பாகங்களை இறுக்குதல் மற்றும் பராமரிப்பு",
        "estimatedMinutes": 10,
        "tools": ["ஸ்க்ரூடிரைவர்", "பிளேயர்"],
        "parts": ["வாஷர்கள்"],
        "precautions": ["திருகுகளை அளவுக்கு அதிகமாக இறுக்கி பிளாஸ்டிக்கை உடைக்க வேண்டாம்."],
        "steps": [
            "தளர்வான பாகங்களை பரிசோதித்து திருகுகளை கண்டறியவும்.",
            "பாகங்களை சரியாக நேராக வைத்து திருகுகளை சமமாக இறுக்கவும்.",
            "லேசான அழுத்தத்தைக் கொடுத்து பாகம் உறுதியாக உள்ளதா என சோதிக்கவும்."
        ]
    }
}

SAFE_DIY_GUIDES_ML = {
    "keyboard": {
        "title": "കീബോർഡ് കേബിൾ, സ്വിച്ച് തകരാർ പരിഹരിക്കൽ",
        "estimatedMinutes": 5,
        "tools": ["ട്വീസർ / കീ പുള്ളർ", "സോഫ്റ്റ് ബ്രഷ്", "ഐസോപ്രൊപൈൽ ആൽക്കഹോൾ"],
        "parts": ["USB കേബിൾ അല്ലെങ്കിൽ ഡോംഗിൾ"],
        "precautions": [
            "കീബോർഡ് വൃത്തിയാക്കുന്നതിന് മുമ്പ് കമ്പ്യൂട്ടറിൽ നിന്ന് കേബിൾ ഊരുക.",
            "ലിക്വിഡ് നേരിട്ട് കീബോർഡിലേക്ക് ഒഴിക്കരുത്."
        ],
        "steps": [
            "കമ്പ്യൂട്ടറിൽ നിന്ന് കീബോർഡ് USB കേബിൾ വിച്ഛേദിക്കുക.",
            "പ്രവർത്തിക്കാത്ത കീ ശ്രദ്ധാപൂർവ്വം മുകളിലേക്ക് വലിച്ച് മാറ്റുക.",
            "കീബോർഡിനടിയിലെ പൊടിയും അഴുക്കും ബ്രഷ് ഉപയോഗിച്ച് നീക്കം ചെയ്യുക.",
            "കീ തിരികെ ഉറപ്പിച്ചു ഘടിപ്പിച്ച് അമർത്തുക.",
            "കമ്പ്യൂട്ടറിലെ മറ്റൊരു USB പോർട്ടിൽ കണക്ട് ചെയ്ത് പരിശോധിക്കുക."
        ]
    },
    "mouse": {
        "title": "മൗസ് സെൻസർ, ക്ലിക്ക് പ്രശ്നം പരിഹരിക്കൽ",
        "estimatedMinutes": 5,
        "tools": ["കോട്ടൺ ബഡ്സ്"],
        "parts": ["ബാറ്ററി (വയർലെസ് ആണെങ്കിൽ)"],
        "precautions": ["ഒപ്റ്റിക്കൽ സെൻസർ ലൈറ്റിലേക്ക് നേരിട്ട് നോക്കരുത്."],
        "steps": [
            "മൗസ് USB കേബിൾ ഊരുക അല്ലെങ്കിൽ ബാറ്ററി മാറ്റുക.",
            "അടിയിലെ ലെൻസ് കോട്ടൺ ബഡ്സ് ഉപയോഗിച്ച് വൃത്തിയാക്കുക.",
            "ബട്ടണുകൾ 10 തവണ അമർത്തി പൊടി നീക്കം ചെയ്യുക.",
            "മറ്റൊരു പോർട്ടിൽ കണക്ട് ചെയ്ത് പരിശോധിക്കുക."
        ]
    },
    "electrical": {
        "title": "ലൈറ്റ് ബൾബ് മാറ്റൽ, സ്വിച്ച് ബോർഡ് പരിശോധന",
        "estimatedMinutes": 10,
        "tools": ["സ്ക്രൂഡ്രൈവർ", "റബ്ബർ ഗ്ലൗസ്", "വോൾട്ടേജ് ടെസ്റ്റർ"],
        "parts": ["പുതിയ LED ബൾബ്"],
        "precautions": [
            "മെയിൻ സ്വിച്ച് ഓഫ് ചെയ്ത ശേഷം മാത്രം പ്രവർത്തിക്കുക.",
            "നനഞ്ഞ കൈകളോടെ തൊടരുത്."
        ],
        "steps": [
            "മെയിൻ സ്വിച്ച് ഓഫ് ചെയ്യുക.",
            "ടെസ്റ്റർ ഉപയോഗിച്ച് കറന്റില്ലെന്ന് ഉറപ്പാക്കുക.",
            "കേടായ ബൾബ് മാറ്റി പുതിയത് ഘടിപ്പിക്കുക.",
            "സ്ക്രൂകൾ ഉറപ്പിക്കുക.",
            "മെയിൻ സ്വിച്ച് ഓൺ ചെയ്ത് പരിശോധിക്കുക."
        ]
    },
    "plumbing": {
        "title": "ടാപ്പ് ലീക്ക് പരിഹരിക്കൽ & ഫിൽട്ടർ വൃത്തിയാക്കൽ",
        "estimatedMinutes": 15,
        "tools": ["റെഞ്ച് / സ്പാനർ", "ടെഫ്ലോൺ ടേപ്പ്"],
        "parts": ["റബ്ബർ വാഷർ"],
        "precautions": ["ആദ്യം പ്രധാന വാട്ടർ വാൽവ് അടയ്ക്കുക."],
        "steps": [
            "സിങ്കിനടിയിലെ വാട്ടർ വാൽവ് അടയ്ക്കുക.",
            "ടാപ്പ് അഴിച്ചു ഫിൽട്ടറിലെ അഴുക്ക് വൃത്തിയാക്കുക.",
            "തേഞ്ഞ വാഷർ മാറ്റി പുതിയത് വെയ്ക്കുക.",
            "ടെഫ്ലോൺ ടേപ്പ് ചുറ്റി ടാപ്പ് ഉറപ്പിക്കുക.",
            "വാട്ടർ വാൽവ് തുറന്ന് പരിശോധിക്കുക."
        ]
    },
    "infrastructure": {
        "title": "വാതിൽ കൊളുത്ത് / സ്ക്രൂ ശരിയാക്കൽ",
        "estimatedMinutes": 8,
        "tools": ["സ്ക്രൂഡ്രൈവർ", "ലൂബ്രിക്കന്റ് ഓയിൽ"],
        "parts": ["സ്ക്രൂകൾ"],
        "precautions": ["എണ്ണ തറയിൽ വീഴാതെ ശ്രദ്ധിക്കുക."],
        "steps": [
            "കീൽ ഭാഗത്തെ പൊടി തുടയ്ക്കുക.",
            "ലൂബ്രിക്കന്റ് സ്പ്രേ അല്ലെങ്കിൽ ഓയിൽ ഒഴിക്കുക.",
            "വാതിൽ പലതവണ തുറന്ന് അടച്ച് എണ്ണ പടർത്തുക.",
            "സ്ക്രൂകൾ മുറുക്കുക."
        ]
    },
    "network": {
        "title": "വൈഫൈ റൂട്ടർ റീസ്റ്റാർട്ട് & കേബിൾ പരിശോധന",
        "estimatedMinutes": 5,
        "tools": ["കൈകൾ മാത്രം"],
        "parts": ["ഇന്റർനെറ്റ് കേബിൾ"],
        "precautions": ["റീസെറ്റ് ബട്ടൺ അമർത്തരുത്."],
        "steps": [
            "റൂട്ടറിന്റെ പവർ കേബിൾ ഊരുക.",
            "നെറ്റ്‌വർക്ക് കേബിൾ ഉറപ്പിച്ചിട്ടുണ്ടോ എന്ന് പരിശോധിക്കുക.",
            "30 സെക്കൻഡ് കാത്തിരിക്കുക.",
            "വീണ്ടും കണക്ട് ചെയ്ത് ഗ്രീൻ ലൈറ്റ് തെളിയുന്നത് വരെ കാത്തിരിക്കുക."
        ]
    },
    "cleaning": {
        "title": "ഫ്ളോർ ക്ലീനിംഗ് & ദുർഗന്ധം ഒഴിവാക്കൽ",
        "estimatedMinutes": 10,
        "tools": ["മോപ്പ്", "കയ്യുറകൾ"],
        "parts": ["ക്ലീനിംഗ് ലോഷൻ"],
        "precautions": ["തറ നനഞ്ഞിരിക്കുമ്പോൾ നടക്കരുത്."],
        "steps": [
            "കയ്യുറകൾ ധരിച്ച് ലോഷൻ വെള്ളത്തിൽ കലക്കുക.",
            "മോപ്പ് ഉപയോഗിച്ച് തുടയ്ക്കുക.",
            "ഫാൻ ഇട്ടു തറ ഉണങ്ങാൻ അനുവദിക്കുക."
        ]
    },
    "security": {
        "title": "ക്യാമറ ലെൻസ് ക്ലീനിംഗ്",
        "estimatedMinutes": 5,
        "tools": ["സോഫ്റ്റ് തുണി", "ഏണി"],
        "parts": ["ഇല്ല"],
        "precautions": ["ഏണി സുരക്ഷിതമായി വെയ്ക്കുക."],
        "steps": [
            "ക്യാമറ ഗ്ലാസ് മൃദുവായി തുടയ്ക്കുക.",
            "ദൃശ്യം വ്യക്തമാണോ എന്ന് പരിശോധിക്കുക."
        ]
    },
    "other": {
        "title": "പൊതുവായ ലളിത അറ്റകുറ്റപ്പണി",
        "estimatedMinutes": 8,
        "tools": ["സ്ക്രൂഡ്രൈവർ"],
        "parts": ["വാഷറുകൾ"],
        "precautions": ["അമിത ബലം പ്രയോഗിക്കരുത്."],
        "steps": [
            "തளர்ന്ന ഭാഗങ്ങൾ കണ്ടെത്തുക.",
            "സ്ക്രൂകൾ കൃത്യമായി മുറുക്കുക.",
            "ഉറപ്പുണ്ടെന്ന് ഉറപ്പുവരുത്തുക."
        ]
    }
}

LOCALIZED_GUIDES = {
    "en": SAFE_DIY_GUIDES_EN,
    "ta": SAFE_DIY_GUIDES_TA,
    "ml": SAFE_DIY_GUIDES_ML
}

def evaluate_safety_and_repair(category: str, description: str, lang: str = "en", target_key: str = None) -> Dict[str, Any]:
    text_lower = description.lower()
    is_hazard = any(h in text_lower for h in HAZARD_KEYWORDS)

    # Specific object match for DIY guide using precise word boundary matching if not already supplied
    if not target_key:
        if match_words(["keyboard", "keyboaerd", "keybord", "kyboard", "key board", "விசைப்பலகை", "கீபோர்டு", "typing"], text_lower):
            target_key = "keyboard"
        elif match_words(["mouse", "மவுஸ்", "cursor"], text_lower):
            target_key = "mouse"
        elif match_words(["fan", "மின்விசிறி", "விசிறி", "ceiling fan", "suthala", "fan speed"], text_lower):
            target_key = "fan"
        elif match_words(["light", "bulb", "tube light", "விளக்கு", "பல்பு", "டியூப் லைட்", "flicker", "eriyala"], text_lower):
            target_key = "light"
        elif match_words(["switch", "socket", "plug", "சுவிட்ச்", "சாக்கெட்", "பிளக்", "mcb"], text_lower):
            target_key = "switch"
        elif match_words(["ac", "air conditioner", "cooler", "cooling", "ஏசி"], text_lower):
            target_key = "ac"
        elif match_words(["geyser", "heater", "water heater", "கீசர்", "சுடு தண்ணீர்"], text_lower):
            target_key = "geyser"
        elif match_words(["tap", "faucet", "குழாய்", "தண்ணீர் குழாய்", "water tap"], text_lower):
            target_key = "tap"
        elif match_words(["drain", "drainage", "sink", "washbasin", "வடிகால்", "வாஷ்பேசின்", "சிங்க்", "block"], text_lower):
            target_key = "drain"
        elif match_words(["flush", "toilet", "பிளஷ்", "கழிப்பறை"], text_lower):
            target_key = "flush"
        elif match_words(["hinge", "door hinge", "கீல்"], text_lower):
            target_key = "hinge"
        elif match_words(["door", "latch", "lock", "கதவு", "பூட்டு", "தாழ்ப்பாள்", "crack"], text_lower):
            target_key = "door"
        elif match_words(["window", "glass", "ஜன்னல்", "கண்ணாடி"], text_lower):
            target_key = "window"
        elif match_words(["chair", "table", "desk", "bench", "நாற்காலி", "மேஜை"], text_lower):
            target_key = "chair"
        elif match_words(["wifi", "router", "lan", "internet", "வைஃபை", "ரூட்டர்", "இணையம்"], text_lower):
            target_key = "wifi"
        elif match_words(["cctv", "camera", "சிசிடிவி", "கேமரா"], text_lower):
            target_key = "security"
        elif category == "cleaning" or match_words(["dustbin", "garbage", "trash", "sanitation", "floor dirty", "kuppai", "குப்பைத்தொட்டி", "துப்புரவு"], text_lower):
            target_key = "cleaning"

    # Any burning smell, shock, spark, or short circuit in electrical or IT components is hazardous
    if any(h in text_lower for h in ["smell", "burning", "spark", "shock", "smoke", "fire", "short circuit", "overheat"]):
        if category in ["electrical", "network", "security"] or target_key in ["keyboard", "mouse", "switch", "fan", "light", "ac", "geyser", "wifi"]:
            is_hazard = True

    is_safe = (not is_hazard) and (
        any(w in text_lower for w in ["loose", "minor", "clean", "dust", "tighten", "bulb", "hinge", "restart", "reboot", "re-seat", "broken", "work aagala", "suthala", "eriyala", "leak"]) or
        ("severe" not in text_lower and "burst" not in text_lower and "smoke" not in text_lower and "spark" not in text_lower and "shock" not in text_lower and "smell" not in text_lower)
    )

    guides_dict = LOCALIZED_GUIDES.get(lang, SAFE_DIY_GUIDES_EN)
    fallback_dict = SAFE_DIY_GUIDES_EN

    if is_safe:
        chosen_key = target_key or category
        raw_guide = (
            guides_dict.get(chosen_key) or
            guides_dict.get(category) or
            guides_dict.get("other") or
            fallback_dict.get(chosen_key) or
            fallback_dict.get(category, fallback_dict["other"])
        )
        guide = {**raw_guide, "key": chosen_key} if raw_guide else None

        if lang == "ta":
            assessment = "பாதுகாப்பானது: இந்த பிரச்சனைக்கு எளிய வழிகாட்டல் மூலம் நீங்களே சுயமாக தீர்வு காணலாம்."
            severity = "குறைந்த ஆபத்து (சுயமாக செய்யலாம்)"
        elif lang == "ml":
            assessment = "സുരക്ഷിതം: ഈ പ്രശ്നം ഞങ്ങളുടെ സ്വയം-സഹായ ഗൈഡ് വഴി ലളിതമായി പരിഹരിക്കാം."
            severity = "ലളിതമായ அറ്റകുറ്റപ്പണി (Safe DIY)"
        else:
            assessment = "SAFE: This problem can be safely resolved using our interactive guided self-repair walkthrough."
            severity = "Low (Safe DIY)"

        return {
            "isSafeForDIY": True,
            "severity": severity,
            "safetyAssessment": assessment,
            "diyGuide": guide
        }
    else:
        has_burn_smell = any(s in text_lower for s in ["smell", "burning", "burnt", "spark", "smoke", "fire", "கருகிய", "வாசனை", "புகை"])
        
        if lang == "ta":
            if has_burn_smell:
                assessment = "அபாயகரமானது: எரியும் வாசனை அல்லது மின்கசிவு/ஷார்ட் சர்க்யூட் அபாயம் உள்ளது. உடனடியாக மின் இணைப்பைத் துண்டிக்கவும். சான்றளிக்கப்பட்ட தொழில்நுட்ப வல்லுநர் நேரில் வந்து சரிசெய்வார்."
            else:
                assessment = "அபாயகரமானது: தீவிர தொழில்நுட்பக் கோளாறு அல்லது கட்டமைப்பு சேதம் உள்ளது. சான்றளிக்கப்பட்ட தொழில்நுட்ப வல்லுநர் நேரில் வந்து சரிசெய்வார்."
            severity = "அதி தீவிர ஆபத்து (டெக்னீஷியன் தேவை)"
        elif lang == "ml":
            assessment = "അപകടകരം: കൂടുതൽ സാങ്കേതിക തകരാറോ ഷോർട്ട് സർക്യൂട്ട് സാധ്യതയോ ഉണ്ട്. സാങ്കേതിക വിദഗ്ദ്ധന്റെ സേവനം ആവശ്യമാണ്."
            severity = "അപകടകരമായ തகராറ് (ടെക്നീഷ്യൻ ആവശ്യമാണ്)"
        else:
            if has_burn_smell:
                assessment = "UNSAFE: Burning odor / electrical short-circuit hazard detected. Please disconnect power immediately. A certified technician is required."
            else:
                assessment = "UNSAFE: Significant hazard / technical complexity detected. Self-repair is strongly discouraged. A qualified certified technician is required."
            severity = "High (Unsafe / Urgent)"

        return {
            "isSafeForDIY": False,
            "severity": severity,
            "safetyAssessment": assessment,
            "diyGuide": None
        }
