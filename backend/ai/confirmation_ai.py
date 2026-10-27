from typing import Dict, Any

CONFIRMATION_TEMPLATES = {
    "en": {
        "intro": "I detected that your {category} system has a possible {issue} due to {cause}.",
        "question": "Is my understanding of your problem correct?",
        "refinement_prompt": "Thanks for clarifying! Please describe what looks or sounds different, or upload another photo/video clip so I can refine the diagnosis.",
        "reply_tamil_sample": "உங்களின் மின்விசிறியில் மோட்டார் குறைபாடு கண்டறியப்பட்டது. எனது புரிதல் சரியானதா?",
        "reply_hindi_sample": "मैंने पाया कि आपके पानी के पाइप में लीकेज की समस्या है। क्या मेरी समझ सही है?"
    },
    "ta": {
        "intro": "உங்கள் {category} சாதனத்தில் {cause} காரணமாக {issue} குறைபாடு ஏற்பட்டுள்ளது என நான் கண்டறிந்துள்ளேன்.",
        "question": "உங்களின் பிரச்சனை குறித்த எனது புரிதல் சரியானதா?",
        "refinement_prompt": "விளக்கமளித்தமைக்கு நன்றி! என்ன வித்தியாசம் தெரிகிறது என்பதை கூடுதல் விவரங்களுடன் தெரிவிக்கவும் அல்லது மற்றொரு புகைப்படத்தை பதிவேற்றவும்.",
    },
    "hi": {
        "intro": "मैंने पाया कि आपके {category} उपकरण में {cause} के कारण {issue} की समस्या है।",
        "question": "क्या आपकी समस्या के बारे में मेरी समझ सही है?",
        "refinement_prompt": "स्पष्टीकरण के लिए धन्यवाद! कृपया समस्या के बारे में और विवरण लिखें या एक और स्पष्ट फोटो/वीडियो अपलोड करें।",
    },
    "te": {
        "intro": "మీ {category} లో {cause} వలన {issue} సమస్య ఉన్నట్లు గుర్తించబడింది.",
        "question": "మీ సమస్యపై నా అవగాహన సరైనదేనా?",
        "refinement_prompt": "ధన్యవాదాలు! దయచేసి సమస్య గురించి మరిన్ని వివరాలు తెలపండి లేదా మరొక ఫోటోను అప్‌లోడ్ చేయండి.",
    },
    "ml": {
        "intro": "നിങ്ങളുടെ {category} സിസ്റ്റത്തിൽ {cause} കാരണം {issue} പ്രശ്നമുള്ളതായി കണ്ടെത്തി.",
        "question": "നിങ്ങളുടെ പ്രശ്നത്തെക്കുറിച്ചുള്ള എന്റെ ധാരണ ശരിയാണോ?",
        "refinement_prompt": "നന്ദി! കൂടുതൽ വിവരങ്ങൾ നൽകുക അല്ലെങ്കിൽ മറ്റൊരു ഫോട്ടോ/വീഡിയോ അപ്‌ലോഡ് ചെയ്യുക.",
    },
    "kn": {
        "intro": "ನಿಮ್ಮ {category} ವ್ಯವಸ್ಥೆಯಲ್ಲಿ {cause} ಕಾರಣದಿಂದ {issue} ಸಮಸ್ಯೆ ಇರುವುದನ್ನು ನಾನು ಗುರುತಿಸಿದ್ದೇನೆ.",
        "question": "ನಿಮ್ಮ ಸಮಸ್ಯೆಯ ಬಗ್ಗೆ ನನ್ನ ತಿಳುವಳಿಕೆ ಸರಿಯಾಗಿದೆಯೇ?",
        "refinement_prompt": "ಧನ್ಯವಾದಗಳು! ದಯವಿಟ್ಟು ಹೆಚ್ಚಿನ ವಿವರಗಳನ್ನು ನೀಡಿ ಅಥವಾ ಇನ್ನೊಂದು ಫೋಟೋ/ವೀಡಿಯೊ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.",
    }
}

CATEGORY_TERMS = {
    "electrical": {"en": "Electrical", "ta": "மின்சார", "hi": "बिजली", "te": "విద్యుత్", "ml": "വൈദ്യുതി", "kn": "ವಿದ್ಯುತ್"},
    "plumbing": {"en": "Plumbing", "ta": "குழாய் / நீர்", "hi": "प्लंबिंग", "te": "ప్లంబింగ్", "ml": "പ്ലംബിംഗ്", "kn": "ಪ್ಲಂಬಿಂಗ್"},
    "infrastructure": {"en": "Infrastructure", "ta": "உள்கட்டமைப்பு", "hi": "इन्फ्रास्ट्रक्चर", "te": "మౌలిక సదుపాయాలు", "ml": "ഇൻഫ്രാസ്ട്രക്ചർ", "kn": "ಮೂಲಸೌಕರ್ಯ"},
    "cleaning": {"en": "Sanitation", "ta": "சுத்தம்", "hi": "स्वच्छता", "te": "పరిశుభ్రత", "ml": "ശുചിത്വം", "kn": "ನೈರ್ಮಲ್ಯ"},
    "security": {"en": "Security", "ta": "பாதுகாப்பு", "hi": "सुरक्षा", "te": "భద్రత", "ml": "സുരക്ഷ", "kn": "ಭದ್ರತೆ"},
    "network": {"en": "Network IT", "ta": "இணைய தொழில்நுட்பம்", "hi": "नेटवर्क", "te": "నెట్‌వర్క్", "ml": "നെറ്റ്‌വർക്ക്", "kn": "ನೆಟ್‌ವರ್ಕ್"},
    "other": {"en": "Equipment", "ta": "சாதனம்", "hi": "उपकरण", "te": "పరికరాలు", "ml": "ഉപകരണം", "kn": "ಉಪಕರಣ"}
}

def generate_confirmation_dialog(category: str, lang: str = "en", description: str = "") -> Dict[str, str]:
    t = CONFIRMATION_TEMPLATES.get(lang, CONFIRMATION_TEMPLATES["en"])
    cat_name = CATEGORY_TERMS.get(category, CATEGORY_TERMS["other"]).get(lang, category)

    desc_lower = description.lower()
    if "fan" in desc_lower or "மின்விசிறி" in desc_lower or "पंखा" in desc_lower:
        issue = "motor vibration and bearing wear"
        cause = "mechanical friction"
    elif "leak" in desc_lower or "water" in desc_lower or "pipe" in desc_lower or "கசிவு" in desc_lower or "पानी" in desc_lower:
        issue = "water leakage"
        cause = "a loose or degraded pipe joint connection"
    elif "wire" in desc_lower or "spark" in desc_lower or "switch" in desc_lower:
        issue = "circuit discontinuity"
        cause = "loose terminal contacts"
    elif "wifi" in desc_lower or "router" in desc_lower or "internet" in desc_lower:
        issue = "network signal dropout"
        cause = "DHCP lease handshake failure"
    else:
        issue = "functional impairment"
        cause = "component wear"

    explanation = t["intro"].format(category=cat_name, issue=issue, cause=cause)
    question = t["question"]

    return {
        "explanation": explanation,
        "question": question,
        "fullText": f"{explanation} {question}",
        "possibleIssue": f"{issue.capitalize()} ({cause})"
    }

def generate_refinement_response(lang: str = "en") -> str:
    t = CONFIRMATION_TEMPLATES.get(lang, CONFIRMATION_TEMPLATES["en"])
    return t["refinement_prompt"]
