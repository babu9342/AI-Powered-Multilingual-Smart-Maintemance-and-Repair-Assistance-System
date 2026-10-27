import difflib
import re
from typing import Dict, Any, Tuple, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

# Multilingual Training Dataset (English, Tamil, Tanglish, Hindi)
TRAINING_DATA = [
    # --- ELECTRICAL ---
    ("ceiling fan making loud vibrating noise and not spinning properly", "electrical"),
    ("ceiling fan is not rotating Note: fan is not rotating", "electrical"),
    ("fan is not rotating and motor stalled", "electrical"),
    ("fan not spinning speed slow", "electrical"),
    ("tube light is flickering and blinking continuously", "electrical"),
    ("wall socket gives electric shock when plugging in charger", "electrical"),
    ("spark coming from main switch board and burning smell", "electrical"),
    ("air conditioner ac is not cooling the room and blowing warm air", "electrical"),
    ("water heater geyser not heating water at all", "electrical"),
    ("power cut in room no electricity but other rooms have power", "electrical"),
    ("mcb trip aagiduchu current varala", "electrical"),
    ("fan suthala romba slow aah poguthu", "electrical"),
    ("fan suthala motor odala", "electrical"),
    ("switch poiduchu switch pottu spark varuthu", "electrical"),
    ("light eriyala bulb fuse aayiduchu", "electrical"),
    ("ac cool aagala fan speed kammiya iruku", "electrical"),
    ("wire cut aagi iruku current shock adikuthu", "electrical"),
    ("geyser on aagala hot water varala", "electrical"),
    ("plug point la spark varuthu switch heat aaguthu", "electrical"),
    ("மின்விசிறி ஓடவில்லை பயங்கர சத்தம் வருகிறது", "electrical"),
    ("மின்விசிறி சுழலவில்லை மோட்டார் இயங்கவில்லை", "electrical"),
    ("விளக்கு எரியவில்லை டியூப் லைட் பிளிங்க் ஆகிறது", "electrical"),
    ("சுவிட்ச் போர்டில் மின்கசிவு உள்ளது தீப்பொறி வருகிறது", "electrical"),
    ("ஏசி கூலிங் வரவில்லை வெப்ப காற்று வீசுகிறது", "electrical"),
    ("கீசர் சுடு தண்ணீர் வரவில்லை மின்சாரம் பழுது", "electrical"),
    ("बिजली नहीं आ रही है पंखा नहीं चल रहा है", "electrical"),
    ("स्विच बोर्ड में से स्पार्क आ रहा है करंट का झटका लगा", "electrical"),
    ("लाइट खराब हो गई है एसी कूलिंग नहीं कर रहा", "electrical"),

    # --- PLUMBING ---
    ("bathroom washbasin tap is leaking water continuously", "plumbing"),
    ("toilet flush tank not working water overflowing continuously", "plumbing"),
    ("drain pipe in bathroom is clogged water stagnating on floor", "plumbing"),
    ("pipe joint burst water spraying everywhere in washroom", "plumbing"),
    ("shower water pressure is extremely low no water coming", "plumbing"),
    ("kitchen sink drain blocked water not draining", "plumbing"),
    ("hot water pipe leaking under the basin", "plumbing"),
    ("water tap thanni leak aagite iruku close panna mudila", "plumbing"),
    ("flush work pannala thanni thenguthu", "plumbing"),
    ("pipe odanju pochu thanni overflow aaguthu", "plumbing"),
    ("bathroom drainage block aayiduchu water poga maatenguthu", "plumbing"),
    ("tap broken water dripping non stop", "plumbing"),
    ("sink la water stagnate aaguthu drain slow aah iruku", "plumbing"),
    ("shower la thanni varala pipe connection loose", "plumbing"),
    ("குளியலறை குழாயில் தண்ணீர் தொடர்ந்து சொட்டுகிறது", "plumbing"),
    ("வாஷ்பேசின் பைப் உடைந்து தண்ணீர் வெளியேறுகிறது", "plumbing"),
    ("டாய்லெட் பிளஷ் டேங்க் வேலை செய்யவில்லை நீர் தேங்குகிறது", "plumbing"),
    ("ட்ரைனேஜ் அடைப்பு ஏற்பட்டுள்ளது தண்ணீர் போகவில்லை", "plumbing"),
    ("ஷவர் நீர் அழுத்தம் மிகவும் குறைவாக உள்ளது", "plumbing"),
    ("नल से पानी लगातार टपक रहा है पाइप टूट गया", "plumbing"),
    ("बाथरूम का ड्रेनेज जाम हो गया है पानी भर गया है", "plumbing"),
    ("फ्लश काम नहीं कर रहा पानी बह रहा है", "plumbing"),

    # --- INFRASTRUCTURE ---
    ("room wooden door not latching lock broken cannot close", "infrastructure"),
    ("window glass cracked and frame loose shaking in wind", "infrastructure"),
    ("study table chair leg broken and unstable cannot sit", "infrastructure"),
    ("door hinge squeaking and loose screws falling off", "infrastructure"),
    ("floor tiles cracked and loose dangerous to walk", "infrastructure"),
    ("cupboard shelf broken and collapsed inside room", "infrastructure"),
    ("ceiling plaster peeling off and wall crack visible", "infrastructure"),
    ("bed frame broken wooden plank cracked", "infrastructure"),
    ("door lock aagala key thirumba mudila", "infrastructure"),
    ("window glass odanchiduchu lock podala", "infrastructure"),
    ("chair leg odanju pochu table aadi kitte iruku", "infrastructure"),
    ("hinges loose aayiduchu door close panna kashtama iruku", "infrastructure"),
    ("suvar la crack vanthuruku roof la dampness", "infrastructure"),
    ("cupboard handle odanchiduchu lock panna mudila", "infrastructure"),
    ("அறை கதவு மூடவில்லை பூட்டு உடைந்துவிட்டது", "infrastructure"),
    ("ஜன்னல் கண்ணாடி உடைந்துவிட்டது தாழ்ப்பாள் வேலை செய்யவில்லை", "infrastructure"),
    ("நாற்காலி கால் உடைந்துவிட்டது மேஜை ஆடுகிறது", "infrastructure"),
    ("கதவு கீல் திருகுகள் கழன்றுவிட்டது சத்தம் போடுகிறது", "infrastructure"),
    ("சுவரில் விரிசல் விழுந்துள்ளது தரை டைல்ஸ் உடைந்துவிட்டது", "infrastructure"),
    ("दरवाजा बंद नहीं हो रहा ताला टूट गया है", "infrastructure"),
    ("खिड़की का शीशा टूट गया है कुर्सी का पाया टूट गया", "infrastructure"),
    ("दीवार में दरार आ गई है टाइल्स उखड़ गई हैं", "infrastructure"),

    # --- CLEANING / SANITATION ---
    ("room and corridor not cleaned dust and garbage piled up", "cleaning"),
    ("washroom is extremely dirty smells foul needs deep sanitization", "cleaning"),
    ("garbage dustbin overflowing in hostel floor needs trash removal", "cleaning"),
    ("cockroaches and pests seen in bathroom needs pest control", "cleaning"),
    ("muddy water and dirt on room floor needs mopping", "cleaning"),
    ("bathroom romba dirty aah iruku smell varuthu clean pannanum", "cleaning"),
    ("kuppai thotti overflow aaguthu dustbin clean pannala", "cleaning"),
    ("floor clean pannala dust romba iruku", "cleaning"),
    ("washroom cleaning pannanum bad odor iruku", "cleaning"),
    ("அறை மற்றும் கழிவறை மிகவும் அசுத்தமாக உள்ளது சுத்தம் செய்ய வேண்டும்", "cleaning"),
    ("குப்பைத் தொட்டி நிரம்பி வழிகிறது துர்நாற்றம் வீசுகிறது", "cleaning"),
    ("தரையை துடைக்க வேண்டும் பூச்சிகள் தென்படுகின்றன", "cleaning"),
    ("कमरे और बाथरूम की सफाई नहीं हुई है बहुत बदबू आ रही है", "cleaning"),
    ("कचरा पेटी भर गई है सफाई कर्मचारी की जरूरत है", "cleaning"),

    # --- NETWORK / COMPUTER & IT SYSTEMS ---
    ("keyboard broken keys not working in lab computer", "network"),
    ("keyboaerd la smell and work aagala", "network"),
    ("keyboard work aagala keys stuck typing problem", "network"),
    ("keyboard burning smell keys not working", "network"),
    ("keybord work aagala broken keys", "network"),
    ("mouse not working scroll wheel broken cursor not moving", "network"),
    ("computer monitor display blank no signal screen flickering", "network"),
    ("cpu not turning on power button broken computer dead", "network"),
    ("printer paper jam not printing document", "network"),
    ("projector display blurred lamp error in lab", "network"),
    ("ups battery dead beeping continuously", "network"),
    ("campus wifi not connecting authentication error or no internet", "network"),
    ("lan ethernet port in room not working internet disconnected", "network"),
    ("router blinking red light no internet access in room", "network"),
    ("internet speed is extremely slow pages not loading", "network"),
    ("wifi connect aaguthu but no internet access varuthu", "network"),
    ("lan cable plug panna detect aagala net speed slow", "network"),
    ("router red light blink aaguthu network down", "network"),
    ("கணினி விசைப்பலகை கீபோர்டு உடைந்துவிட்டது வேலை செய்யவில்லை", "network"),
    ("மவுஸ் வேலை செய்யவில்லை திரை ஒளிரவில்லை", "network"),
    ("வைஃபை இணையம் வேலை செய்யவில்லை சிக்னல் கிடைக்கவில்லை", "network"),
    ("லேன் போர்ட் வேலை செய்யவில்லை இணைய வேகம் மிகவும் குறைவு", "network"),
    ("कीबोर्ड खराब हो गया है काम नहीं कर रहा", "network"),
    ("माउस नहीं चल रहा स्क्रीन बंद हो गई", "network"),
    ("वाईफाई कनेक्ट नहीं हो रहा है इंटरनेट नहीं चल रहा", "network"),

    # --- SECURITY ---
    ("cctv camera in corridor not working power off", "security"),
    ("biometric access door scanner not accepting card", "security"),
    ("main gate lock broken unauthorized entry possible", "security"),
    ("cctv camera angle thirumbi iruku recording aagala", "security"),
    ("security door lock open aaga maatenguthu card reject", "security"),
    ("சிசிடிவி கேமரா வேலை செய்யவில்லை காட்சி தெரியவில்லை", "security"),
    ("சிசிடிவி கேமரா பழுது மற்றும் கதவு பயோமெட்ரிக் வேலை செய்யவில்லை", "security")
]

# Train the Classifier Pipeline
corpus_texts = [x[0] for x in TRAINING_DATA]
corpus_labels = [x[1] for x in TRAINING_DATA]

ml_pipeline = Pipeline([
    ('tfidf', TfidfVectorizer(ngram_range=(1, 2), min_df=1, sublinear_tf=True)),
    ('clf', LogisticRegression(C=5.0, max_iter=500, solver='lbfgs'))
])
ml_pipeline.fit(corpus_texts, corpus_labels)


# Comprehensive Subject / Fixture Lexicon with Multilingual Names
OBJECT_LEXICON = {
    # Electrical - Fans
    "ceiling fan": {"en": "Ceiling Fan", "ta": "மின்விசிறி (Ceiling Fan)", "category": "electrical", "key": "fan"},
    "table fan": {"en": "Table Fan", "ta": "டேபிள் ஃபேன்", "category": "electrical", "key": "fan"},
    "exhaust fan": {"en": "Exhaust Fan", "ta": "எக்சாஸ்ட் ஃபேன்", "category": "electrical", "key": "fan"},
    "fan": {"en": "Ceiling Fan", "ta": "மின்விசிறி (Ceiling Fan)", "category": "electrical", "key": "fan"},
    "fant": {"en": "Ceiling Fan", "ta": "மின்விசிறி (Ceiling Fan)", "category": "electrical", "key": "fan"},
    "fans": {"en": "Ceiling Fan", "ta": "மின்விசிறி (Ceiling Fan)", "category": "electrical", "key": "fan"},
    "மின்விசிறி": {"en": "Ceiling Fan", "ta": "மின்விசிறி (Ceiling Fan)", "category": "electrical", "key": "fan"},
    "விசிறி": {"en": "Ceiling Fan", "ta": "மின்விசிறி (Ceiling Fan)", "category": "electrical", "key": "fan"},
    "पंखा": {"en": "Ceiling Fan", "ta": "மின்விசிறி (Ceiling Fan)", "category": "electrical", "key": "fan"},

    # Electrical - Lights & Fixtures
    "ceiling light": {"en": "Ceiling Light", "ta": "சீலிங் விளக்கு", "category": "electrical", "key": "light"},
    "tube light": {"en": "Tube Light", "ta": "டியூப் லைட்", "category": "electrical", "key": "light"},
    "tubelight": {"en": "Tube Light", "ta": "டியூப் லைட்", "category": "electrical", "key": "light"},
    "led bulb": {"en": "LED Bulb", "ta": "எல்.இ.டி பல்பு", "category": "electrical", "key": "light"},
    "bulb": {"en": "Bulb", "ta": "மின் பல்பு", "category": "electrical", "key": "light"},
    "light": {"en": "Lighting Tube/Bulb", "ta": "மின் விளக்கு", "category": "electrical", "key": "light"},
    "விளக்கு": {"en": "Lighting Tube/Bulb", "ta": "மின் விளக்கு", "category": "electrical", "key": "light"},
    "டியூப் லைட்": {"en": "Tube Light", "ta": "டியூப் லைட்", "category": "electrical", "key": "light"},

    # Electrical - Switches, Sockets & Wiring
    "switch board": {"en": "Switch Board", "ta": "சுவிட்ச் போர்டு", "category": "electrical", "key": "switch"},
    "switchboard": {"en": "Switch Board", "ta": "சுவிட்ச் போர்டு", "category": "electrical", "key": "switch"},
    "plug point": {"en": "Plug Point / Socket", "ta": "பிளக் பாயிண்ட்", "category": "electrical", "key": "switch"},
    "power socket": {"en": "Power Socket", "ta": "சுவர் சாக்கெட்", "category": "electrical", "key": "switch"},
    "socket": {"en": "Wall Socket", "ta": "சுவர் சாக்கெட்", "category": "electrical", "key": "switch"},
    "switch": {"en": "Power Switch / Board", "ta": "சுவிட்ச் போர்டு", "category": "electrical", "key": "switch"},
    "plug": {"en": "Plug Point", "ta": "பிளக் பாயிண்ட்", "category": "electrical", "key": "switch"},
    "சுவிட்ச்": {"en": "Power Switch / Board", "ta": "சுவிட்ச் போர்டு", "category": "electrical", "key": "switch"},
    "mcb": {"en": "Circuit Breaker MCB", "ta": "சர்க்யூட் பிரேக்கர்", "category": "electrical", "key": "switch"},
    "wire": {"en": "Electrical Wiring", "ta": "மின்கம்பி வயரிங்", "category": "electrical", "key": "electrical"},
    "wiring": {"en": "Electrical Wiring", "ta": "மின் வயரிங்", "category": "electrical", "key": "electrical"},

    # Electrical - Heavy Appliances
    "water heater": {"en": "Water Heater (Geyser)", "ta": "வாட்டர் ஹீட்டர்", "category": "electrical", "key": "geyser"},
    "geyser": {"en": "Water Heater (Geyser)", "ta": "கீசர் வாட்டர் ஹீட்டர்", "category": "electrical", "key": "geyser"},
    "heater": {"en": "Water Heater", "ta": "வாட்டர் ஹீட்டர்", "category": "electrical", "key": "geyser"},
    "air conditioner": {"en": "Air Conditioner (AC)", "ta": "ஏசி (Air Conditioner)", "category": "electrical", "key": "ac"},
    "ac": {"en": "Air Conditioner", "ta": "ஏசி (Air Conditioner)", "category": "electrical", "key": "ac"},
    "cooler": {"en": "Air Cooler", "ta": "ஏர் கூலர்", "category": "electrical", "key": "ac"},
    "fridge": {"en": "Refrigerator", "ta": "குளிர்சாதனப் பெட்டி", "category": "electrical", "key": "electrical"},
    "iron box": {"en": "Iron Box", "ta": "இஸ்திரி பெட்டி", "category": "electrical", "key": "electrical"},

    # Computer & IT
    "keyboard": {"en": "Computer Keyboard", "ta": "விசைப்பலகை (Keyboard)", "category": "network", "key": "keyboard"},
    "keyboaerd": {"en": "Computer Keyboard", "ta": "விசைப்பலகை (Keyboard)", "category": "network", "key": "keyboard"},
    "keybord": {"en": "Computer Keyboard", "ta": "விசைப்பலகை (Keyboard)", "category": "network", "key": "keyboard"},
    "kyboard": {"en": "Computer Keyboard", "ta": "விசைப்பலகை (Keyboard)", "category": "network", "key": "keyboard"},
    "key board": {"en": "Computer Keyboard", "ta": "விசைப்பலகை (Keyboard)", "category": "network", "key": "keyboard"},
    "கீபோர்டு": {"en": "Computer Keyboard", "ta": "விசைப்பலகை (Keyboard)", "category": "network", "key": "keyboard"},
    "விசைப்பலகை": {"en": "Computer Keyboard", "ta": "விசைப்பலகை (Keyboard)", "category": "network", "key": "keyboard"},
    "mouse": {"en": "Computer Mouse", "ta": "மவுஸ் (Mouse)", "category": "network", "key": "mouse"},
    "மவுஸ்": {"en": "Computer Mouse", "ta": "மவுஸ் (Mouse)", "category": "network", "key": "mouse"},
    "monitor": {"en": "Computer Monitor", "ta": "கணினி திரை (Monitor)", "category": "network", "key": "network"},
    "display": {"en": "Display Screen", "ta": "திரை (Display)", "category": "network", "key": "network"},
    "screen": {"en": "Screen", "ta": "திரை (Screen)", "category": "network", "key": "network"},
    "cpu": {"en": "Computer CPU", "ta": "கணினி சிபியு (CPU)", "category": "network", "key": "network"},
    "printer": {"en": "Printer", "ta": "பிரிண்டர் (Printer)", "category": "network", "key": "network"},
    "projector": {"en": "Projector", "ta": "புரொஜெக்டர் (Projector)", "category": "network", "key": "network"},
    "ups": {"en": "Power Backup UPS", "ta": "யுபிஎஸ் பேட்டரி (UPS)", "category": "network", "key": "network"},
    "wifi": {"en": "Wi-Fi Network Router", "ta": "வைஃபை நெட்வொர்க் (Wi-Fi)", "category": "network", "key": "wifi"},
    "router": {"en": "Wi-Fi Router", "ta": "வைஃபை ரூட்டர் (Router)", "category": "network", "key": "wifi"},
    "lan": {"en": "Ethernet LAN Port", "ta": "லேன் போர்ட் (LAN)", "category": "network", "key": "wifi"},
    "internet": {"en": "Internet Connection", "ta": "இணைய இணைப்பு", "category": "network", "key": "wifi"},

    # Plumbing
    "water tap": {"en": "Water Tap", "ta": "தண்ணீர் குழாய் (Tap)", "category": "plumbing", "key": "tap"},
    "tap": {"en": "Water Tap", "ta": "தண்ணீர் குழாய் (Tap)", "category": "plumbing", "key": "tap"},
    "குழாய்": {"en": "Water Tap", "ta": "தண்ணீர் குழாய்", "category": "plumbing", "key": "tap"},
    "faucet": {"en": "Water Tap / Faucet", "ta": "தண்ணீர் குழாய்", "category": "plumbing", "key": "tap"},
    "water pipe": {"en": "Water Pipe", "ta": "தண்ணீர் பைப்", "category": "plumbing", "key": "tap"},
    "pipe": {"en": "Water Pipe", "ta": "தண்ணீர் பைப்", "category": "plumbing", "key": "tap"},
    "பைப்": {"en": "Water Pipe", "ta": "தண்ணீர் பைப்", "category": "plumbing", "key": "tap"},
    "washbasin": {"en": "Washbasin", "ta": "வாஷ்பேசின்", "category": "plumbing", "key": "drain"},
    "sink": {"en": "Kitchen Sink / Basin", "ta": "வாஷ்பேசின் / சிங்க்", "category": "plumbing", "key": "drain"},
    "flush tank": {"en": "Toilet Flush Tank", "ta": "பிளஷ் டேங்க்", "category": "plumbing", "key": "flush"},
    "flush": {"en": "Toilet Flush Tank", "ta": "பிளஷ் டேங்க்", "category": "plumbing", "key": "flush"},
    "drain pipe": {"en": "Floor Drainage Drain", "ta": "வடிகால் ட்ரைனேஜ்", "category": "plumbing", "key": "drain"},
    "drain": {"en": "Floor Drainage Drain", "ta": "வடிகால் ட்ரைனேஜ்", "category": "plumbing", "key": "drain"},
    "drainage": {"en": "Drainage System", "ta": "வடிகால் அமைப்பு", "category": "plumbing", "key": "drain"},
    "shower": {"en": "Bathroom Shower", "ta": "குளியலறை ஷவர்", "category": "plumbing", "key": "tap"},
    "toilet": {"en": "Toilet Fixture", "ta": "கழிப்பறை சாதனம்", "category": "plumbing", "key": "flush"},
    "valve": {"en": "Water Valve", "ta": "நீர் வால்வு", "category": "plumbing", "key": "tap"},

    # Infrastructure - Doors & Windows
    "door lock": {"en": "Door Lock", "ta": "கதவு பூட்டு", "category": "infrastructure", "key": "door"},
    "door handle": {"en": "Door Handle", "ta": "கதவு கைப்பிடி", "category": "infrastructure", "key": "door"},
    "door hinge": {"en": "Door Hinge", "ta": "கதவு கீல் (Hinge)", "category": "infrastructure", "key": "hinge"},
    "door latch": {"en": "Door Latch", "ta": "தாழ்ப்பாள்", "category": "infrastructure", "key": "door"},
    "door": {"en": "Room Door", "ta": "அறை கதவு", "category": "infrastructure", "key": "door"},
    "கதவு": {"en": "Room Door", "ta": "அறை கதவு", "category": "infrastructure", "key": "door"},
    "lock": {"en": "Door Lock", "ta": "கதவு பூட்டு", "category": "infrastructure", "key": "door"},
    "பூட்டு": {"en": "Door Lock", "ta": "கதவு பூட்டு", "category": "infrastructure", "key": "door"},
    "handle": {"en": "Door / Cabinet Handle", "ta": "கைப்பிடி (Handle)", "category": "infrastructure", "key": "door"},
    "latch": {"en": "Door Latch", "ta": "தாழ்ப்பாள்", "category": "infrastructure", "key": "door"},
    "hinge": {"en": "Door Hinge", "ta": "கதவு கீல் (Hinge)", "category": "infrastructure", "key": "hinge"},
    "window glass": {"en": "Window Glass", "ta": "ஜன்னல் கண்ணாடி", "category": "infrastructure", "key": "window"},
    "window frame": {"en": "Window Frame", "ta": "ஜன்னல்", "category": "infrastructure", "key": "window"},
    "window": {"en": "Window Frame", "ta": "ஜன்னல்", "category": "infrastructure", "key": "window"},
    "ஜன்னல்": {"en": "Window Frame", "ta": "ஜன்னல்", "category": "infrastructure", "key": "window"},
    "glass": {"en": "Window Glass", "ta": "ஜன்னல் கண்ணாடி", "category": "infrastructure", "key": "window"},

    # Infrastructure - Furniture & Civil
    "study table": {"en": "Study Table / Desk", "ta": "மேஜை (Table)", "category": "infrastructure", "key": "chair"},
    "table": {"en": "Study Table / Desk", "ta": "மேஜை (Table)", "category": "infrastructure", "key": "chair"},
    "desk": {"en": "Study Desk", "ta": "மேஜை (Desk)", "category": "infrastructure", "key": "chair"},
    "chair": {"en": "Chair", "ta": "நாற்காலி (Chair)", "category": "infrastructure", "key": "chair"},
    "bench": {"en": "Bench", "ta": "பெஞ்ச்", "category": "infrastructure", "key": "chair"},
    "bed": {"en": "Bed Frame / Cot", "ta": "கட்டில்", "category": "infrastructure", "key": "chair"},
    "cot": {"en": "Hostel Cot", "ta": "கட்டில்", "category": "infrastructure", "key": "chair"},
    "cupboard": {"en": "Wardrobe / Cupboard", "ta": "அலமாரி", "category": "infrastructure", "key": "door"},
    "shelf": {"en": "Shelf / Rack", "ta": "ரேக் / ஷெல்ப்", "category": "infrastructure", "key": "chair"},
    "tile": {"en": "Floor Tiles", "ta": "தரை டைல்ஸ்", "category": "infrastructure", "key": "infrastructure"},
    "tiles": {"en": "Floor Tiles", "ta": "தரை டைல்ஸ்", "category": "infrastructure", "key": "infrastructure"},
    "wall": {"en": "Wall Plaster / Paint", "ta": "சுவர்", "category": "infrastructure", "key": "infrastructure"},
    "ceiling crack": {"en": "Ceiling Plaster / Crack", "ta": "மேற்கூரை விரிசல்", "category": "infrastructure", "key": "infrastructure"},
    "ceiling": {"en": "Room Ceiling Structure", "ta": "மேற்கூரை அமைப்பு", "category": "infrastructure", "key": "infrastructure"},

    # Cleaning
    "dustbin": {"en": "Garbage Dustbin", "ta": "குப்பைத் தொட்டி", "category": "cleaning", "key": "cleaning"},
    "garbage": {"en": "Waste Garbage", "ta": "குப்பை கழிவு", "category": "cleaning", "key": "cleaning"},
    "washroom": {"en": "Washroom Sanitation", "ta": "கழிப்பறை சுத்தம்", "category": "cleaning", "key": "cleaning"},
    "bathroom": {"en": "Washroom", "ta": "குளியலறை", "category": "cleaning", "key": "cleaning"},
    "corridor": {"en": "Floor Corridor", "ta": "தாழ்வாரம்", "category": "cleaning", "key": "cleaning"},

    # Security
    "cctv": {"en": "CCTV Security Camera", "ta": "சிசிடிவி கேமரா", "category": "security", "key": "security"},
    "camera": {"en": "Security Camera", "ta": "பாதுகாப்பு கேமரா", "category": "security", "key": "security"},
    "biometric": {"en": "Biometric Access Reader", "ta": "பயோமெட்ரிக் ஸ்கேனர்", "category": "security", "key": "security"},
    "gate": {"en": "Main Gate", "ta": "மெயின் கேட்", "category": "security", "key": "security"}
}


# Known Faults & Symptoms with Specific Root Causes
FAULT_LEXICON = {
    "fan is not rotating": {
        "en": "motor stalled and fan not rotating",
        "ta": "மின்விசிறி சுழலவில்லை (சுழற்சி தடை)",
        "cause_en": "capacitor open, speed regulator defect, or motor bearing resistance",
        "cause_ta": "கெபாசிட்டர் பலவீனம், ரெகுலேட்டர் கோளாறு அல்லது பேரிங் உராய்வு"
    },
    "not rotating": {
        "en": "motor stalled and not rotating",
        "ta": "சுழலவில்லை (சுழற்சி தடை)",
        "cause_en": "capacitor failure, speed regulator issue, or bearing lock",
        "cause_ta": "கெபாசிட்டர் பலவீனம், ரெகுலேட்டர் கோளாறு அல்லது மோட்டார் லாக்"
    },
    "not spinning": {
        "en": "blades stalled and not spinning",
        "ta": "சுழலாமல் நின்றுள்ளது",
        "cause_en": "capacitor degradation or lack of lubrication",
        "cause_ta": "கெபாசிட்டர் பழுது அல்லது உராய்வு"
    },
    "slow speed": {
        "en": "rotation speed drop",
        "ta": "குறைந்த வேகத்தில் சுழல்கிறது",
        "cause_en": "weak run capacitor or regulator fault",
        "cause_ta": "கெபாசிட்டர் பலவீனம் அல்லது ரெகுலேட்டர் பழுது"
    },
    "suthala": {
        "en": "motor stalled and not rotating",
        "ta": "சுழலவில்லை / இயங்கவில்லை",
        "cause_en": "capacitor open or bearing lock",
        "cause_ta": "கெபாசிட்டர் பழுது அல்லது மோட்டார் லாக்"
    },
    "crack vilunthuruchi": {
        "en": "surface crack and structural seam fracture",
        "ta": "மேற்பரப்பு விரிசல் மற்றும் பிளவு",
        "cause_en": "physical impact, wood drying, or structural stress",
        "cause_ta": "கட்டமைப்பு அழுத்தம் அல்லது மரப்பலகை விரிசல்"
    },
    "crack": {
        "en": "surface fissure or crack along the structure",
        "ta": "மேற்பரப்பு விரிசல் மற்றும் பிளவு",
        "cause_en": "structural stress, wood expansion, or impact load",
        "cause_ta": "கட்டமைப்பு அழுத்தம் அல்லது மோதல் தாக்கம்"
    },
    "cracked": {
        "en": "cracked and fractured surface",
        "ta": "விரிசல் விழுந்த நிலை",
        "cause_en": "physical load or structural stress",
        "cause_ta": "அழுத்தம் அல்லது விரிசல்"
    },
    "விரிசல்": {
        "en": "visible crack on surface",
        "ta": "மேற்பரப்பு விரிசல்",
        "cause_en": "structural tension or aging material",
        "cause_ta": "கட்டமைப்பு அழுத்தம்"
    },
    "vilunthuruchi": {
        "en": "fractured / detached / loosened component",
        "ta": "விரிசல் அல்லது விடுபட்ட நிலை",
        "cause_en": "anchoring loosening or impact strain",
        "cause_ta": "மோதல் அழுத்தம் அல்லது தளர்ந்த பொருத்துதல்"
    },
    "vilunthuduchu": {
        "en": "displaced / cracked component",
        "ta": "விழுந்த அல்லது விரிசல் விழுந்த நிலை",
        "cause_en": "impact damage",
        "cause_ta": "மோதல் சேதம்"
    },
    "broken": {
        "en": "structural physical damage and broken parts",
        "ta": "உடைந்து சேதமடைந்த நிலை",
        "cause_en": "mechanical stress or physical impact",
        "cause_ta": "இயந்திர அழுத்தம் அல்லது விபத்து மோதல்"
    },
    "odanji": {
        "en": "fractured / broken component",
        "ta": "உடைந்த நிலை",
        "cause_en": "physical impact fracture",
        "cause_ta": "அழுத்த சேதம்"
    },
    "odanchuruchi": {
        "en": "broken / fractured component",
        "ta": "உடைந்த நிலை",
        "cause_en": "physical impact",
        "cause_ta": "மோதல் சேதம்"
    },
    "work aagala": {
        "en": "complete operational failure (stopped working)",
        "ta": "வேலை செய்யவில்லை (செயலிழப்பு)",
        "cause_en": "internal component failure or circuit disconnection",
        "cause_ta": "உள் இணைப்பு துண்டிப்பு அல்லது சாதனம் பழுது"
    },
    "not working": {
        "en": "non-functional state (not working)",
        "ta": "செயல்படாத நிலை",
        "cause_en": "internal mechanism or electrical fault",
        "cause_ta": "உள் பொறிமுறை கோளாறு"
    },
    "leak": {
        "en": "continuous fluid leakage",
        "ta": "தொடர்ச்சியான தண்ணீர் கசிவு",
        "cause_en": "a worn gasket or loose thread joint",
        "cause_ta": "தேய்ந்த ரப்பர் கேஸ்கெட் அல்லது தளர்வான இணைப்பு"
    },
    "spark": {
        "en": "arcing and sparks",
        "ta": "மின் தீப்பொறி மற்றும் மின்கசிவு",
        "cause_en": "loose terminal wiring or short circuit",
        "cause_ta": "தளர்வான வயரிங் அல்லது ஷார்ட் சர்க்யூட்"
    },
    "shock": {
        "en": "electric leakage shock",
        "ta": "மின்கசிவு அதிர்ச்சி",
        "cause_en": "insulation breakdown or earthing fault",
        "cause_ta": "எர்த்திங் இல்லாமை அல்லது இன்சுலேஷன் சேதம்"
    },
    "flicker": {
        "en": "flickering and buzzing",
        "ta": "மின்மினுத்தல் மற்றும் சத்தம்",
        "cause_en": "ballast degradation or unstable voltage",
        "cause_ta": "மின்னழுத்த மாற்றம்"
    },
    "eriyala": {
        "en": "light not illuminating",
        "ta": "விளக்கு எரியவில்லை",
        "cause_en": "filament burn or circuit trip",
        "cause_ta": "மின்சுற்று துண்டிப்பு"
    },
    "stuck": {
        "en": "jammed and stuck mechanism",
        "ta": "சிக்கிக்கொண்ட நிலை",
        "cause_en": "misalignment or lack of lubrication",
        "cause_ta": "உராய்வு அல்லது விலகிய நிலை"
    },
    "jam": {
        "en": "jammed motion",
        "ta": "நகர முடியாமல் அடைத்த நிலை",
        "cause_en": "foreign obstruction or dry friction",
        "cause_ta": "தூசு அடைப்பு"
    },
    "noise": {
        "en": "abnormal rattling noise and vibration",
        "ta": "அதிகப்படியான சத்தம் மற்றும் நடுக்கம்",
        "cause_en": "worn ball bearings or loose fitting",
        "cause_ta": "பேரிங் தேய்மானம்"
    },
    "loose": {
        "en": "loosened fitting, screws, or hinge mounting",
        "ta": "தளர்வான திருகுகள் அல்லது ஆடும் நிலை",
        "cause_en": "vibration or fastener thread loosening",
        "cause_ta": "தளர்ந்த திருகு அல்லது ஆட்டம்"
    },
    "aaduthu": {
        "en": "wobbling / loose fitting",
        "ta": "ஆடும் அல்லது தளர்வான நிலை",
        "cause_en": "loose fastener screws",
        "cause_ta": "தளர்ந்த திருகுகள்"
    },
    "burning smell": {
        "en": "burning odor and severe component overheating",
        "ta": "எரிந்த வாசனை மற்றும் அதிக வெப்பம்",
        "cause_en": "internal component short-circuit or electrical burning",
        "cause_ta": "மின்னணு பாகம் சேதம் அல்லது அதிக வெப்பம்"
    },
    "smell and work aagala": {
        "en": "burning odor and complete operational failure",
        "ta": "எரிந்த வாசனை மற்றும் முழுமையான செயலிழப்பு",
        "cause_en": "internal circuit failure or electrical short-circuit",
        "cause_ta": "உள் மின்சுற்று எரிதல் அல்லது செயலிழப்பு"
    },
    "smell varuthu": {
        "en": "burning odor or overheating smoke",
        "ta": "எரிந்த வாசனை மற்றும் சூடாதல்",
        "cause_en": "short-circuit or wire overheating",
        "cause_ta": "மின் கம்பி சூடாதல் அல்லது மின்கசிவு"
    },
    "smell": {
        "en": "burning odor or unusual smell",
        "ta": "எரிந்த வாசனை அல்லது துர்நாற்றம்",
        "cause_en": "electrical overheating or component failure",
        "cause_ta": "மின்சுற்று சூடாதல் அல்லது பாகம் பழுது"
    }
}


def extract_specific_object(text: str, user_category: str = None) -> Dict[str, str]:
    """Intelligently extracts the EXACT object/device mentioned by the user with fuzzy typo tolerance."""
    text_lower = text.lower()

    # Special Disambiguation: If "fan", "light", "bulb", "wire", "switch" is present, DO NOT treat "ceiling" as infrastructure
    has_fan = any(w in text_lower for w in ["fan", "fant", "fans", "விசிறி", "மின்விசிறி", "rotating", "spinning", "suthala"])
    has_light = any(w in text_lower for w in ["light", "bulb", "tube", "விளக்கு", "பல்பு", "eriyala", "flicker"])
    has_electrical = has_fan or has_light or any(w in text_lower for w in ["switch", "socket", "plug", "wire", "mcb", "ac", "geyser", "heater"])

    if has_fan:
        return OBJECT_LEXICON["ceiling fan"]
    if has_light:
        return OBJECT_LEXICON["tube light"]

    # 1. Match from our comprehensive lexicon using word boundaries (longest terms first)
    sorted_objects = sorted(OBJECT_LEXICON.items(), key=lambda x: len(x[0]), reverse=True)
    for key, data in sorted_objects:
        # If text has electrical context, don't pick generic ceiling infrastructure
        if key == "ceiling" and (has_electrical or user_category == "electrical"):
            continue

        if key.isascii() and key.isalnum():
            if re.search(r'\b' + re.escape(key) + r'\b', text_lower):
                return data
        else:
            if key in text_lower:
                return data

    # 1b. Clean Tanglish tokens & Fuzzy matching against lexicon
    tokens = re.findall(r'[a-zA-Z\u0B80-\u0BFF0-9]+', text_lower)
    lexicon_keys = [k for k in OBJECT_LEXICON.keys() if k != "ceiling" or not has_electrical]
    for raw_tok in tokens:
        # Strip common Tanglish postpositions (e.g. keyboardla -> keyboard, fanle -> fan, switchula -> switch)
        tok = re.sub(r'(la|le|ku|ula|oda|odu)$', '', raw_tok)
        if len(tok) >= 3:
            if tok in OBJECT_LEXICON:
                return OBJECT_LEXICON[tok]
            # Fuzzy match
            close_matches = difflib.get_close_matches(tok, lexicon_keys, n=1, cutoff=0.75)
            if close_matches:
                return OBJECT_LEXICON[close_matches[0]]

    # 2. Category default fallbacks
    cat_fallbacks = {
        "electrical": {"key": "electrical system", "en": "Electrical Device / Wiring", "ta": "மின் சாதனம் / ஒயரிங்"},
        "plumbing": {"key": "tap", "en": "Tap / Faucet", "ta": "குழாய்"},
        "infrastructure": {"key": "door", "en": "Door / Wall Fitting", "ta": "கதவு / சுவர் கட்டமைப்பு"},
        "cleaning": {"key": "floor", "en": "Floor Area", "ta": "தரைப்பகுதி"},
        "network": {"key": "wifi router", "en": "Router / Network Device", "ta": "இணைய சாதனம் / ரூட்டர்"},
        "security": {"key": "cctv camera", "en": "CCTV Camera / Lock", "ta": "சிசிடிவி கேமரா / பூட்டு"}
    }
    return cat_fallbacks.get(user_category, {"key": "general equipment", "en": "Equipment", "ta": "சாதனம்"})


def extract_specific_fault(
    text: str,
    category: str = "other",
    negative_conditions: Optional[Dict[str, bool]] = None,
    cleaned_text: Optional[str] = None
) -> Dict[str, str]:
    """
    Intelligently extracts the EXACT fault/defect mentioned, respecting negative constraints (e.g. 'Leakage illai').
    If a condition is negated, any fault matching that condition is strictly ignored.
    """
    neg_conds = negative_conditions or {}
    text_to_scan = (cleaned_text or text).lower()

    # 1. Special case: If user complaint is about tap/water and mentions low flow / no leakage
    if "tap" in text_to_scan or "pipe" in text_to_scan or "faucet" in text_to_scan or "water" in text_to_scan or "தண்ணீர்" in text_to_scan:
        if neg_conds.get("leakage") is False or any(w in text_to_scan for w in ["low", "slow", "kammi", "pressure", "flow", "அடைப்பு", "வேகம்"]):
            if neg_conds.get("leakage") is False:
                return {
                    "en": "faucet aerator blockage and low water flow",
                    "ta": "குழாய் அடைப்பு மற்றும் குறைந்த நீர் ஓட்டம்",
                    "cause_en": "mineral limescale sediment in aerator mesh or restricted angle stopcock valve",
                    "cause_ta": "குழாய் ஏரேட்டரில் தாது படிவு அல்லது ஆங்கிள் வால்வு அடைப்பு"
                }

    # 2. Match against fault lexicon, skipping negated faults
    sorted_faults = sorted(FAULT_LEXICON.items(), key=lambda x: len(x[0]), reverse=True)
    for key, data in sorted_faults:
        # If this key is negated (e.g. 'leak' when leakage is false), skip it
        if neg_conds.get("leakage") is False and key in ["leak", "leaking", "தண்ணீர் கசிவு", "கசிவு"]:
            continue
        if neg_conds.get("noise") is False and key in ["noise", "rattling", "சத்தம்"]:
            continue
        if neg_conds.get("spark") is False and key in ["spark", "தீப்பொறி"]:
            continue
        if neg_conds.get("smoke") is False and key in ["smoke", "burning smell", "கருகிய வாசனை"]:
            continue
        if neg_conds.get("heat") is False and key in ["hot", "overheating", "சூடாதல்"]:
            continue

        if key.isascii() and key.isalnum():
            if re.search(r'\b' + re.escape(key) + r'\b', text_to_scan):
                return data
        else:
            if key in text_to_scan:
                return data

    # 3. Fallbacks based on category (strictly avoiding prohibited negated terms)
    if category == "plumbing":
        if neg_conds.get("leakage") is False:
            return {
                "en": "low water flow pressure and aerator obstruction",
                "ta": "குறைந்த நீர் அழுத்தம் மற்றும் ஏரேட்டர் அடைப்பு",
                "cause_en": "mineral scale sediment in nozzle or partially closed angle valve",
                "cause_ta": "குழாய் ஏரேட்டரில் தாது படிவு அல்லது ஆங்கிள் வால்வு கட்டுப்பாடு"
            }
        return {
            "en": "water flow obstruction or plumbing pipe leakage",
            "ta": "தண்ணீர் கசிவு அல்லது நீர் அடைப்பு",
            "cause_en": "pipe pressure or washer degradation",
            "cause_ta": "குழாய் அழுத்தம் அல்லது வாஷர் சேதம்"
        }

    cat_faults = {
        "electrical": {
            "en": "electrical discontinuity or power disruption",
            "ta": "மின் இணைப்பு அல்லது சுற்றுகோளாறு",
            "cause_en": "loose wiring or component capacitor failure",
            "cause_ta": "தளர்வான மின்கம்பி அல்லது கெபாசிட்டர் பலவீனம்"
        },
        "infrastructure": {
            "en": "physical defect or mechanical damage",
            "ta": "அமைப்பு சேதம் அல்லது உடைவு",
            "cause_en": "loosened fitting or wear",
            "cause_ta": "தளர்வான திருகுகள் அல்லது பயன்பாட்டுத் தேய்மானம்"
        },
        "cleaning": {
            "en": "sanitation and waste buildup",
            "ta": "சுகாதார குறைபாடு மற்றும் அசுத்தம்",
            "cause_en": "delayed cleaning maintenance",
            "cause_ta": "துப்புரவு தாமதம்"
        },
        "network": {
            "en": "hardware malfunction or signal dropout",
            "ta": "சாதன செயலிழப்பு அல்லது சிக்னல் துண்டிப்பு",
            "cause_en": "internal circuit failure or connection reset",
            "cause_ta": "உள் இணைப்பு துண்டிப்பு"
        },
        "security": {
            "en": "surveillance or access failure",
            "ta": "கண்காணிப்பு அல்லது பூட்டு செயலிழப்பு",
            "cause_en": "sensor or power fault",
            "cause_ta": "சென்சார் அல்லது பவர் கோளாறு"
        },
        "other": {
            "en": "functional impairment",
            "ta": "செயல்பாட்டுக் குறைபாடு",
            "cause_en": "physical wear and tear",
            "cause_ta": "இயந்திர பயன்பாட்டுத் தேய்மானம்"
        }
    }
    return cat_faults.get(category, cat_faults["other"])


def classify_complaint_ml(text: str, user_selected_category: str = None) -> Tuple[str, float]:
    """Classifies text into categories using trained Scikit-Learn TF-IDF model."""
    if not text.strip():
        cat = user_selected_category if user_selected_category and user_selected_category != "other" else "infrastructure"
        return cat, 0.95

    # Run ML prediction probabilities
    probas = ml_pipeline.predict_proba([text])[0]
    classes = ml_pipeline.classes_
    best_idx = probas.argmax()
    predicted_cat = classes[best_idx]
    confidence = float(probas[best_idx])

    # Check if a specific object clearly dictates the category (e.g. keyboard -> network, tap -> plumbing, fan -> electrical)
    specific_obj = extract_specific_object(text, user_selected_category)
    if specific_obj and specific_obj.get("category"):
        obj_cat = specific_obj["category"]
        if obj_cat in classes:
            predicted_cat = obj_cat
            confidence = max(confidence, 0.94)

    # If user explicitly selected a category that is not 'other', respect user intent if reasonable
    if user_selected_category and user_selected_category != "other":
        if user_selected_category in classes:
            user_idx = list(classes).index(user_selected_category)
            if probas[user_idx] > 0.15 or confidence < 0.60:
                predicted_cat = user_selected_category
                confidence = max(confidence, 0.92)

    return predicted_cat, round(min(confidence, 0.98), 2)


def generate_accurate_diagnosis(
    text: str,
    user_selected_category: str = None,
    lang: str = "en",
    title: Optional[str] = None,
    description: Optional[str] = None,
    constraints: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Generates an exact, personalized diagnosis respecting user negative constraints & mixed signals.
    """
    from backend.ai.complaint_understanding import extract_complaint_constraints
    c_dict = constraints or extract_complaint_constraints(text, lang, title=title, description=description)
    cleaned_text = c_dict.get("cleanedText") or text
    negative_conditions = c_dict.get("negativeConditions", {})

    category, confidence = classify_complaint_ml(cleaned_text or text, user_selected_category)
    fixture_data = extract_specific_object(cleaned_text or text, user_selected_category or category)
    fault_data = extract_specific_fault(
        text=text,
        category=category,
        negative_conditions=negative_conditions,
        cleaned_text=cleaned_text
    )

    fixture_name = fixture_data.get(lang, fixture_data.get("en", "Equipment"))
    issue_name = fault_data.get(lang, fault_data.get("en", "issue"))
    cause_name = fault_data.get(f"cause_{lang}", fault_data.get("cause_en", "physical wear"))

    # Include original key phrase if user entered Tanglish (like "work aagala", "suthala")
    desc_lower = (description or text).lower()
    tanglish_detail = ""
    if "work aagala" in desc_lower:
        tanglish_detail = " (work aagala)"
    elif "suthala" in desc_lower:
        tanglish_detail = " (suthala)"
    elif "eriyala" in desc_lower:
        tanglish_detail = " (eriyala)"

    # Formulate Natural, Specific Explanation
    if lang == "ta":
        explanation = f"உங்கள் {fixture_name}-ல் {cause_name} காரணமாக {issue_name}{tanglish_detail} ஏற்பட்டுள்ளது என AI துல்லியமாகக் கண்டறிந்துள்ளது."
        confirmation_question = "உங்களின் பிரச்சனை குறித்த எனது புரிதல் சரியானதா?"
    elif lang == "ml":
        explanation = f"നിങ്ങളുടെ {fixture_data['en']} ഉപകരണത്തിൽ {issue_name}{tanglish_detail} സംഭவிച്ചதாக AI കണ്ടെത്തി."
        confirmation_question = "നിങ്ങളുടെ പ്രശ്നത്തെക്കുറിച്ചുള്ള എന്റെ ധാരണ ശരിയാണோ?"
    elif lang == "hi":
        explanation = f"आपके {fixture_data['en']} में {cause_name} के कारण {issue_name} की समस्या पाई गई है।"
        confirmation_question = "क्या आपकी समस्या के बारे में मेरी समझ सही है?"
    elif lang == "te":
        explanation = f"మీ {fixture_data['en']} లో {issue_name} ఏర్పడిందని AI గుర్తించింది."
        confirmation_question = "మీ సమస్యపై నా అవగాஹన సరైనదేనా?"
    elif lang == "kn":
        explanation = f"ನಿಮ್ಮ {fixture_data['en']} ನಲ್ಲಿ {issue_name} ಸಂಭವಿಸಿದೆ என்று AI ಗುರುತಿಸಿದೆ."
        confirmation_question = "ನಿಮ್ಮ ಸಮಸ್ಯೆಯ ಬಗ್ಗೆ ನನ್ನ ತಿಳುವಳಿಕೆ ಸರಿಯಾಗಿದೆಯೇ?"
    else:
        explanation = f"AI detected that your {fixture_data['en']} has {issue_name}{tanglish_detail} caused by {cause_name}."
        confirmation_question = "Is my understanding of your problem correct?"

    if lang == "ta":
        fixture_label = fixture_data.get("ta", fixture_data.get("en", "சாதனம்"))
        fault_label = fault_data.get("ta", fault_data.get("en", "கோளாறு"))
        possible_issue = f"{fixture_label}: {fault_label}"
    elif lang == "ml":
        fixture_label = fixture_data.get("ml", fixture_data.get("en", "உபகரணம்"))
        fault_label = fault_data.get("ml", fault_data.get("en", "തகராറ്"))
        possible_issue = f"{fixture_label}: {fault_label}"
    else:
        possible_issue = f"{fixture_data.get('en', 'Item')}: {fault_data.get('en', 'Defect').capitalize()}"

    return {
        "category": category,
        "confidence": confidence,
        "possibleIssue": possible_issue,
        "explanation": explanation,
        "confirmationQuestion": confirmation_question,
        "fixture": fixture_name,
        "fixture_key": fixture_data.get("key"),
        "issue": issue_name,
        "cause": cause_name,
        "extractedConstraints": c_dict
    }
