import re
from typing import Dict, Any
from backend.ai.language_detector import detect_language

def generate_chat_reply(message: str, user_lang: str = "en") -> Dict[str, Any]:
    """
    Intelligent conversational troubleshooting engine:
    Understands user problems in 6 languages and Tanglish/Hinglish/dialects,
    diagnoses appliances, vehicles (tyres/puncture), AC, plumbing, electrical, carpentry,
    provides safety precautions, step-by-step numbered DIY guidance, and escalation advice.
    """
    detected_lang = user_lang or detect_language(message)
    msg_lower = message.lower()

    def has_kw(words):
        for w in words:
            if w.isascii() and w.isalnum():
                if re.search(r'\b' + re.escape(w) + r'\b', msg_lower):
                    return True
            else:
                if w in msg_lower:
                    return True
        return False

    is_tamil = detected_lang == "ta" or has_kw(["la", "illa", "irukku", "aaguthu", "varuthu", "thanni", "kaathu", "kattum", "panrathu", "seiyyanum"])
    is_hindi = detected_lang == "hi" or has_kw(["nahi", "hoga", "pani", "hawa", "karein", "chahiye", "chal", "raha"])

    # 1. Bike / Vehicle Tyre Puncture
    if has_kw(["bike", "tyre", "tire", "punchar", "puncture", "flat", "cycle", "tube", "tubeless", "panchar", "பஞ்சர்", "டயர்"]):
        if is_tamil:
            reply = (
                "**⚠️ இருசக்கர வாகன டயர் பஞ்சர் சரிசெய்வதற்கான வழிகாட்டுதல்:**\n\n"
                "**முன்னெச்சரிக்கை:**\n"
                "- பைக்கை சமமான தரையில் டபுள் ஸ்டாண்டில் (Center Stand) பாதுகாப்பாக நிறுத்தவும்.\n\n"
                "**தேவையான பொருட்கள்:** டயர் பஞ்சர் கிட் (Tubeless Repair Strip & Needle), ஏர் பம்ப் / போர்ட்டபிள் இன்ஃப்ளேட்டர்.\n\n"
                "**படிநிலைகள் (Step-by-Step DIY Steps):**\n"
                "1. டயரை மெதுவாக சுழற்றி ஆணி, கம்பி அல்லது குத்தியுள்ள பொருளை கண்டறியவும்.\n"
                "2. பிளையர் (Pliers) கொண்டு ஆணியை மெதுவாக வெளியே இழுக்கவும்.\n"
                "3. பஞ்சர் துளையை Reamer டூல் மூலம் சுத்தம் செய்து விரிவுபடுத்தவும்.\n"
                "4. பஞ்சர் ஸ்ட்ரிப்பை (Rubber Strip) ஊசியில் கோர்த்து துளையில் பாதி வரை செலுத்தவும்.\n"
                "5. ஊசியை நேராக வெளியே இழுத்து, நீட்டிக்கொண்டிருக்கும் அதிகப்படியான ரப்பரை கட் செய்யவும்.\n"
                "6. போர்ட்டபிள் ஏர் பம்ப் மூலம் பரிந்துரைக்கப்பட்ட பிரஷர் (32-36 PSI) காற்று நிரப்பவும்.\n\n"
                "💡 **குறிப்பு:** டியூப் டயராக (Tube Tyre) இருந்தால் அருகிலுள்ள மெக்கானிக் அல்லது கேம்பஸ் டெக்னீஷியனை தொடர்பு கொள்ளவும். கீழே உள்ள **'File Official Ticket'** பட்டனை கிளிக் செய்யலாம்."
            )
        elif is_hindi:
            reply = (
                "**⚠️ बाइक/वाहन टायर पंचर रिपेयर गाइड:**\n\n"
                "**सुरक्षा सावधानी:** बाइक को समतल जमीन पर मेन स्टैंड (Center Stand) पर खड़ा करें।\n\n"
                "**आवश्यक उपकरण:** ट्यूबलेस पंचर किट (रबर स्ट्रिप, इंसर्शन टूल) और एयर पंप।\n\n"
                "**कदम (Step-by-Step):**\n"
                "1. टायर को घुमाकर कील या चुभी हुई वस्तु खोजें।\n"
                "2. प्लायर की मदद से कील को बाहर निकालें।\n"
                "3. टूल की मदद से छेद को साफ करें।\n"
                "4. रबर स्ट्रिप को टूल में डालकर छेद के अंदर डालें।\n"
                "5. टूल को तेजी से बाहर खींचें और बची हुई स्ट्रिप को काट लें।\n"
                "6. एयर पंप से हवा (32-36 PSI) भरें।\n\n"
                "यदि समस्या गंभीर है, तो **'File Official Ticket'** पर क्लिक करके मैकेनिक सहायता प्राप्त करें।"
            )
        else:
            reply = (
                "**⚠️ Vehicle / Bike Tyre Puncture Troubleshooting Guide:**\n\n"
                "**Safety Precautions:**\n"
                "- Park your vehicle on flat, solid ground using the center double stand.\n"
                "- Turn off the ignition key.\n\n"
                "**Required Tools:** Tubeless puncture repair kit (reamer, strip insertion needle, rubber strips), pliers, and a portable air inflator.\n\n"
                "**Step-by-Step Instructions:**\n"
                "1. Rotate the tyre slowly to locate the puncture nail, screw, or debris.\n"
                "2. Use pliers to firmly pull out the offending nail.\n"
                "3. Insert the rasp/reamer tool into the puncture hole to clear and texture the passage.\n"
                "4. Thread a rubber seal strip halfway into the eye of the needle tool with rubber cement.\n"
                "5. Push the tool and strip firmly into the hole until 2/3 of the strip is inside.\n"
                "6. Pull the insertion tool straight out smoothly without twisting.\n"
                "7. Trim excess protruding rubber strip flush with the tyre tread.\n"
                "8. Inflate tyre to manufacturer recommended pressure (32–36 PSI) and check with soapy water for bubble leaks.\n\n"
                "👨‍🔧 **Need help?** If this is a tube-type tyre or sidewall damage, professional replacement is required. Click **'File Official Ticket'** below to request assistance."
            )
        return {
            "reply": reply,
            "language": detected_lang,
            "detectedCategory": "vehicle",
            "suggestedAction": "diy"
        }

    # 2. AC Not Cooling
    if has_kw(["ac", "cooling", "air conditioner", "filter", "chilled", "remote", "gas", "ஏசி", "குளிர்ச்சி"]):
        if is_tamil:
            reply = (
                "**⚠️ ஏசி (AC) குளிர்ச்சி தராததற்கான காரணங்கள் & சரிசெய்யும் முறைகள்:**\n\n"
                "**பாதுகாப்பு எச்சரிக்கை:** ஏசி சர்வீஸ் செய்வதற்கு முன் மெயின் MCB பவர் சுவிட்சை ஆஃப் செய்யவும்.\n\n"
                "**படிநிலைகள் (Step-by-Step DIY Steps):**\n"
                "1. ஏசி ரிமோட்டில் மோட் (Mode) 'Cool' மோடில் உள்ளதா மற்றும் வெப்பநிலை 24°C என உள்ளதா என சரிபார்க்கவும்.\n"
                "2. முன்பக்க பேனலைத் திறந்து ஏர் ஃபில்டர்களை (Air Filters) வெளியே எடுக்கவும்.\n"
                "3. தூசிகள் படிந்த ஃபில்டர்களை சாதாரண தண்ணீரில் மென்மையாக கழுவி சுத்தம் செய்யவும்.\n"
                "4. ஃபில்டர்களை நிழலில் 30 நிமிடங்கள் முழுமையாக காய வைக்கவும் (ஹேர் டிரையர் பயன்படுத்த வேண்டாம்).\n"
                "5. ஃபில்டர்களை மீண்டும் பொருத்தி முன் பேனலை மூடவும்.\n"
                "6. வெளிப்புற யூனிட்டில் (Outdoor Compressor) ஃபேன் சுழல்கிறதா என கவனிக்கவும்.\n\n"
                "💡 **குறிப்பு:** ஃபில்டர் சுத்தம் செய்த பிறகும் கூலிங் வரவில்லை என்றால் கேஸ் கசிவு (Refrigerant Gas Leak) அல்லது கம்ப்ரசர் பழுதாக இருக்கலாம். கேம்பஸ் ஏசி டெக்னீஷியனை அழைக்க **'File Official Ticket'** பட்டனை அழுத்தவும்."
            )
        elif is_hindi:
            reply = (
                "**⚠️ एसी (AC) कूलिंग समस्या निवारण:**\n\n"
                "**सुरक्षा निर्देश:** काम शुरू करने से पहले एसी का मुख्य स्विच (MCB) बंद कर दें।\n\n"
                "**कदम (Steps):**\n"
                "1. रिमोट में मोड 'Cool' पर सेट करें और तापमान 24°C रखें।\n"
                "2. एसी का फ्रंट पैनल खोलकर एयर फिल्टर निकालें।\n"
                "3. फिल्टर को नल के पानी से धोकर धूल साफ करें।\n"
                "4. फिल्टर को सूखने के बाद वापस लगाएं।\n"
                "5. यदि आउटडोर कंप्रेसर नहीं चल रहा या गैस खत्म है, तो तुरंत **'File Official Ticket'** पर क्लिक करके इलेक्ट्रीशियन को बुलाएं।"
            )
        else:
            reply = (
                "**⚠️ Air Conditioner Not Cooling Troubleshooting:**\n\n"
                "**Safety Precaution:** Ensure AC isolator switch / MCB breaker is switched OFF before inspecting internal panels.\n\n"
                "**Required Tools:** Lukewarm water, soft microfiber cloth, and mild liquid detergent.\n\n"
                "**Step-by-Step Instructions:**\n"
                "1. Check the remote controller: ensure mode is explicitly set to **COOL** (❄️ snowflake icon) and temperature to 24°C.\n"
                "2. Open the indoor unit front panel and gently unclip the mesh air filters.\n"
                "3. Rinse air filters under lukewarm running water from the back to dislodge dust buildup.\n"
                "4. Allow filters to air-dry completely in shade for 30 minutes before reinserting.\n"
                "5. Reinstall dry filters and firmly click the panel closed.\n"
                "6. Check the outdoor condenser unit to verify the fan is spinning freely with no blockages.\n\n"
                "👨‍🔧 **When to call a Technician:** If indoor airflow is clean but compressor does not kick in, or there is ice forming on copper pipes, it indicates refrigerant leak. Click **'File Official Ticket'** to dispatch our HVAC specialist."
            )
        return {
            "reply": reply,
            "language": detected_lang,
            "detectedCategory": "electrical",
            "suggestedAction": "diy"
        }

    # 3. Water Tap / Plumbing Leak
    if has_kw(["water", "tap", "leak", "pipe", "sink", "drain", "தண்ணீர்", "குழாய்", "கசிவு", "தண்ணி", "नल", "पानी"]):
        if is_tamil:
            reply = (
                "**⚠️ குழாய் தண்ணீர் கசிவு (Tap Leakage) சரிசெய்யும் முறை:**\n\n"
                "**பாதுகாப்பு முதன்மை:** முதலில் வாஷ்பேசின் கீழே உள்ள ஆங்கிள் வால்வை (Angle Stop Valve) அல்லது மெயின் சப்ளை லைனை மூடவும்.\n\n"
                "**தேவையான கருவிகள்:** ஸ்பேனர் / அடஜஸ்டபிள் ரென்ச், டெஃப்லான் டேப் (Teflon Tape), ரப்பர் வாஷர் (O-ring).\n\n"
                "**படிநிலைகள் (Step-by-Step DIY Steps):**\n"
                "1. குழாயின் மெயின் வால்வை முழுமையாக மூடி தண்ணீர் வருகையை நிறுத்தவும்.\n"
                "2. குழாய் மேல் உள்ள அலங்கார மூடியை (Cap) கழற்றி திருகாணியை தளர்த்தவும்.\n"
                "3. ஸ்பேனர் கொண்டு குழாயின் உள் ஸ்பிண்டிலை (Cartridge/Spindle) கவனமாக கழற்றவும்.\n"
                "4. தேய்ந்துபோன ரப்பர் வாஷரை புதிய வாஷர் கொண்டு மாற்றவும்.\n"
                "5. திரிகளில் 4-5 சுற்றுகள் டெஃப்லான் டேப் (Teflon Tape) சுற்றவும்.\n"
                "6. ஸ்பிண்டிலை மீண்டும் பொருத்தி இறுக்கி வால்வை திறந்து கசிவு உள்ளதா என சோதிக்கவும்.\n\n"
                "👨‍🔧 **உதவி வேண்டுமா?** குழாயில் விரிசல் அல்லது சுவர் உள்ளே கசிவு இருந்தால், பிளம்பர் சுரேஷ் குமாரை அழைக்க கீழே உள்ள **'File Official Ticket'** பட்டனை அழுத்தவும்."
            )
        elif is_hindi:
            reply = (
                "**⚠️ नल से पानी लीकेज ठीक करने का तरीका:**\n\n"
                "**सुरक्षा सावधानी:** सबसे पहले सिंक के नीचे का मुख्य वाल्व बंद करें।\n\n"
                "**कदम (Steps):**\n"
                "1. मुख्य पानी की सप्लाई बंद करें।\n"
                "2. रिंच (Wrench) से नल का हेड खोलें।\n"
                "3. पुराना घिसा हुआ रबर वाशर बदलें और टेफ्लॉन टेप लगाएं।\n"
                "4. नल को कसकर बंद करें और पानी चालू करके जांचें।\n\n"
                "यदि पाइप में दरार है, तो **'File Official Ticket'** पर क्लिक करके प्लंबर बुलाएं।"
            )
        else:
            reply = (
                "**⚠️ Plumbing / Tap Water Leak Troubleshooting Guide:**\n\n"
                "**Safety Precaution:** Always shut off the water isolating valve beneath the sink or main supply stopcock first.\n\n"
                "**Required Tools:** Adjustable wrench, flathead screwdriver, Teflon thread sealing tape, replacement O-ring washer.\n\n"
                "**Step-by-Step Instructions:**\n"
                "1. Isolate the water supply by rotating the mini shut-off valve clockwise until tight.\n"
                "2. Pop off the decorative indicator cap on top of the tap handle with a small screwdriver.\n"
                "3. Loosen the retaining screw and lift off the tap head/handle.\n"
                "4. Use your wrench to unscrew the internal brass ceramic valve cartridge.\n"
                "5. Inspect the bottom rubber washer; replace if cracked, flattened or hardened.\n"
                "6. Wrap 4–5 tight turns of Teflon PTFE tape clockwise around the thread.\n"
                "7. Re-seat the cartridge, tighten securely, replace handle, and reopen water supply to verify leak-free seal.\n\n"
                "👨‍🔧 **Need a Plumber?** If wall concealed pipes are leaking, click **'File Official Ticket'** below for rapid campus plumbing dispatch."
            )
        return {
            "reply": reply,
            "language": detected_lang,
            "detectedCategory": "plumbing",
            "suggestedAction": "diy"
        }

    # 4. Electrical Issues (Fan, Light, Switch, Spark)
    if has_kw(["fan", "wire", "spark", "light", "shock", "switch", "power", "bulb", "மின்", "बिजली", "ஃபேன்", "கரண்ட்"]):
        if is_tamil:
            reply = (
                "**⚠️ மின்சார சாதனம் / சுவிட்ச் பழுது சரிசெய்தல்:**\n\n"
                "**முக்கிய பாதுகாப்பு எச்சரிக்கை:** ஈரமான கைகளால் எதையும் தொடாதீர்கள்! மெயின் MCB பவர் சுவிட்சை ஆஃப் செய்த பிறகே சோதிக்க வேண்டும்.\n\n"
                "**படிநிலைகள் (Step-by-Step DIY Steps):**\n"
                "1. ரூம் மெயின் MCB ட்ரிப் ஆகியுள்ளதா என மெயின் போர்டில் சரிபார்க்கவும்.\n"
                "2. சாதனம் பிளக் பாயிண்டில் சரியாக பொருத்தப்பட்டுள்ளதா அல்லது தளர்வாக உள்ளதா என கவனிக்கவும்.\n"
                "3. டெஸ்டர் (Voltage Tester Pen) கொண்டு மின்சாரம் பாய்கிறதா என சோதிக்கவும்.\n"
                "4. தீப்பொறி (Spark) அல்லது கருகிய வாசனை வந்தால் சாதனத்தை உடனடியாக அணைத்து விடவும்.\n\n"
                "👨‍🔧 **கட்டாயம் எலக்ட்ரீஷியன் தேவை:** மின் வயரிங் மற்றும் ஃபேன் கெபாசிட்டர் மாற்ற எலக்ட்ரீஷியன் கார்த்திக் ராமனை அழைக்க **'File Official Ticket'** பட்டனை அழுத்தவும்."
            )
        elif is_hindi:
            reply = (
                "**⚠️ बिजली / पंखा / स्विच समस्या निवारण:**\n\n"
                "**सुरक्षा निर्देश:** खुले तारों को न छुएं! मेन MCB बंद करने के बाद ही कोई जांच करें।\n\n"
                "1. MCB ट्रिप की स्थिति जांचें।\n"
                "2. टेस्टर से करंट चेक करें।\n"
                "3. यदि चिंगारी या जलने की गंध आ रही है, तो तुरंत उपकरण बंद करें।\n\n"
                "सुरक्षित समाधान के लिए **'File Official Ticket'** दबाकर इलेक्ट्रीशियन बुलाएं।"
            )
        else:
            reply = (
                "**⚠️ Electrical Appliance & Fixture Troubleshooting:**\n\n"
                "**Critical Safety Warning:** Never handle electrical wiring with wet hands or bare feet. Switch OFF the main MCB breaker before inspection.\n\n"
                "**Required Tools:** Non-contact voltage tester, insulated screwdriver, safety rubber gloves.\n\n"
                "**Step-by-Step Instructions:**\n"
                "1. Check distribution board to verify whether the miniature circuit breaker (MCB) has tripped.\n"
                "2. Unplug other high-draw appliances sharing the same circuit to check for circuit overload.\n"
                "3. Use a voltage tester pen to confirm zero current before touching terminal blocks.\n"
                "4. Inspect plug pins for burnt discoloration or loose terminal screws.\n"
                "5. If sparks or buzzing noises occur inside the wall junction, do NOT operate the switch.\n\n"
                "👨‍🔧 **Professional Help Recommended:** Live wire issues pose shock hazards. Click **'File Official Ticket'** to dispatch our licensed campus electrician Karthik Raman."
            )
        return {
            "reply": reply,
            "language": detected_lang,
            "detectedCategory": "electrical",
            "suggestedAction": "dispatch"
        }

    # 5. Network / WiFi Issues
    if has_kw(["wifi", "internet", "router", "network", "lan", "cable", "வைஃபை", "वाईफाई"]):
        reply = (
            "**⚠️ WiFi & Network Connectivity Troubleshooting:**\n\n"
            "**Step-by-Step Instructions:**\n"
            "1. Unplug the router's DC power barrel jack for 30 seconds to flush internal DNS and IP cache.\n"
            "2. Ensure the blue/yellow Ethernet WAN cable is firmly seated until you hear a mechanical click.\n"
            "3. Power the router back ON and wait 90 seconds for the Internet/WAN LED to turn solid green.\n"
            "4. Forget and reconnect to the WiFi SSID on your device.\n\n"
            "👨‍🔧 If fiber optical LOS light flashes red, click **'File Official Ticket'** for network engineer Arun Venkatesh."
        )
        return {
            "reply": reply,
            "language": detected_lang,
            "detectedCategory": "network",
            "suggestedAction": "diy"
        }

    # Default general reply with helpful structured troubleshooting guidance
    if is_tamil:
        reply = (
            f"வணக்கம்! உங்கள் பராமரிப்பு பிரச்சனை ('{message}') பதிவு செய்யப்பட்டுள்ளது.\n\n"
            "**உடனடி வழிகாட்டுதல்:**\n"
            "1. பாதுகாப்பை உறுதி செய்யவும் (மின்சாரம் அல்லது தண்ணீர் சம்பந்தப்பட்ட பழுதாக இருந்தால் பிரதான சுவிட்சை அணைக்கவும்).\n"
            "2. சாதனத்தின் மாதிரி பெயர் அல்லது பழுது ஏற்பட்ட இடத்தைக் கூறினால் விரிவான செய்முறை படிகளை வழங்க முடியும்.\n"
            "3. உடனடி பழுது நீக்கத்திற்கு கீழே உள்ள **'File Official Ticket'** பட்டனை கிளிக் செய்து கேம்பஸ் டெக்னீஷியனை புக் செய்யலாம்."
        )
    elif is_hindi:
        reply = (
            f"नमस्ते! आपकी समस्या ('{message}') दर्ज कर ली गई है।\n\n"
            "**सलाह:**\n"
            "1. सुरक्षा का ध्यान रखें (बिजली/पानी से जुड़ी समस्या में मेन स्विच बंद रखें)।\n"
            "2. समस्या का अधिक विवरण बताएं ताकि मैं चरणबद्ध समाधान बता सकूं।\n"
            "3. सहायता के लिए नीचे **'File Official Ticket'** दबाएं।"
        )
    else:
        reply = (
            f"Hello! I have noted your maintenance inquiry: \"{message}\".\n\n"
            "**Troubleshooting Recommendations:**\n"
            "1. **Safety First:** Ensure isolation from active electrical currents or pressurized water before inspection.\n"
            "2. **Details:** You can describe the appliance model or symptoms in detail (in English, Tamil, Hindi, Telugu, Malayalam, or Kannada) for custom DIY steps.\n"
            "3. **Professional Assistance:** Click **'File Official Ticket'** below anytime to auto-fill a service request for campus technicians."
        )

    return {
        "reply": reply,
        "language": detected_lang,
        "detectedCategory": "general",
        "suggestedAction": "diy"
    }
