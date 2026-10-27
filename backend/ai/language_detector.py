import re

def detect_language(text: str) -> str:
    """
    Detects Indian regional languages and English via Unicode block patterns and keywords.
    Supported: English (en), Tamil (ta), Hindi (hi), Telugu (te), Malayalam (ml), Kannada (kn)
    """
    if not text:
        return "en"

    # Tamil (\u0B80 - \u0BFF)
    if re.search(r'[\u0B80-\u0BFF]', text):
        return "ta"

    # Telugu (\u0C00 - \u0C7F)
    if re.search(r'[\u0C00-\u0C7F]', text):
        return "te"

    # Kannada (\u0C80 - \u0CFF)
    if re.search(r'[\u0C80-\u0CFF]', text):
        return "kn"

    # Malayalam (\u0D00 - \u0D7F)
    if re.search(r'[\u0D00-\u0D7F]', text):
        return "ml"

    # Hindi / Devanagari (\u0900 - \u097F)
    if re.search(r'[\u0900-\u097F]', text):
        return "hi"

    # Check for transliterated keywords if in Latin script using word boundaries
    lower = text.lower()
    
    def match_lang_words(word_list):
        return any(re.search(r'\b' + re.escape(w) + r'\b', lower) for w in word_list)

    if match_lang_words([
        "velai", "seiyavillai", "seiyala", "thanni", "thanneer", "kuzhai", "panam",
        "suthala", "eriyala", "vilunthuruchi", "vilunthuduchu", "odanchiruchu", "odanji",
        "work aagala", "poiduchu", "konjam", "mudiyala", "iruku", "irukku", "irukuthu",
        "keeral", "kadhavu", "pootu", "thaalpaal"
    ]):
        return "ta"
        
    if match_lang_words(["nahi", "raha", "pani", "bijli", "kharab", "karein", "chal", "kaam", "tuta"]):
        return "hi"
        
    if match_lang_words(["cheyadam", "ledu", "kaledu", "panicheyadam", "neellu"]):
        return "te"
        
    if match_lang_words(["kelasa", "maduttilla", "neeru", "agalla"]):
        return "kn"
        
    if match_lang_words(["cheyyunnilla", "vellam", "poyi", "valiyilla"]):
        return "ml"

    return "en"

LANG_NAMES = {
    "en": "English",
    "ta": "தமிழ் (Tamil)",
    "hi": "हिन्दी (Hindi)",
    "te": "తెలుగు (Telugu)",
    "ml": "മലയാളം (Malayalam)",
    "kn": "ಕನ್ನಡ (Kannada)"
}
