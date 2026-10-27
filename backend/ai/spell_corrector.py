import re
import difflib
from typing import Tuple, List, Dict

# Comprehensive lexicon of domain-specific maintenance terms, appliances, symptoms & Tanglish keywords
KNOWN_WORDS_MAP = {
    # IT & Computer
    "keyboard": ["keyboaerd", "keybord", "kyboard", "keybaord", "keybaord", "keboard", "keyborad", "keybored", "keyboad"],
    "mouse": ["mous", "mouce", "moouse", "muose"],
    "monitor": ["moniter", "monitr", "moniter", "montor"],
    "screen": ["scren", "scrren", "screan"],
    "display": ["disply", "diplay", "desplay"],
    "printer": ["prntr", "printr", "prinetr"],
    "projector": ["projectr", "projctor", "projecktor"],
    "router": ["routr", "roter", "ruter"],
    "internet": ["intenet", "intrnet", "internett"],
    "wifi": ["wi-fi", "wifii", "wify"],
    "cable": ["cabl", "cabel", "cables"],
    "ethernet": ["ethernt", "ethrnet"],
    "laptop": ["leptop", "laptp", "laptob"],
    "computer": ["computr", "compter", "computor"],

    # Electrical
    "fan": ["fann", "fannn", "fant"],
    "ceiling": ["cieling", "celing"],
    "light": ["lite", "ligh", "ligth", "lihgt"],
    "bulb": ["blub", "bubl", "bulbb"],
    "tube": ["tueb", "tubee"],
    "switch": ["swich", "swtch", "sitwch", "swicth"],
    "socket": ["scoket", "soket", "sockt", "scokt"],
    "plug": ["plugg", "plg", "pluge"],
    "wire": ["wir", "wier", "wyre"],
    "wiring": ["wirng", "wireing"],
    "geyser": ["geysr", "gyser", "gayser", "geaser"],
    "heater": ["heatr", "hetar", "heatar"],
    "cooler": ["coolr", "coler"],
    "spark": ["sprk", "sparc", "sparking"],
    "shock": ["shok", "shoc", "shokc"],

    # Plumbing
    "tap": ["tapp", "tappp"],
    "faucet": ["fouset", "facet", "foucet"],
    "leak": ["leek", "leakk", "leking", "leaking"],
    "leaking": ["leeking", "leking"],
    "pipe": ["pip", "pype", "pippe"],
    "drain": ["drin", "dran", "drayn"],
    "drainage": ["drinage", "drainge"],
    "sink": ["snk", "sinck", "sinc"],
    "washbasin": ["washbasn", "washbaisn", "washbaisin", "basin"],
    "flush": ["flsh", "flus", "flsuh"],
    "toilet": ["toilt", "toilte", "toilett"],
    "water": ["watr", "watter"],

    # Infrastructure & Carpentry
    "door": ["dor", "dore", "doore"],
    "window": ["windo", "windw", "windoe", "widnow"],
    "glass": ["glas", "glaas"],
    "lock": ["lok", "loc", "lokc"],
    "latch": ["lach", "latc"],
    "hinge": ["hign", "hing", "hings"],
    "chair": ["char", "chai", "chaire"],
    "table": ["tabel", "tabl"],
    "desk": ["dsk", "dek"],
    "bench": ["bnch", "benc"],
    "bed": ["bedd"],
    "cot": ["cott"],
    "cupboard": ["cupbord", "cuboard", "cubord"],
    "crack": ["crak", "crck", "craack"],
    "broken": ["brokn", "brokwn", "braked"],

    # Common faults & symptoms
    "smell": ["smel", "sml", "smelll", "smellin"],
    "burning": ["burnng", "burnin", "burnning"],
    "smoke": ["smok", "smook"],
    "sound": ["sund", "sond"],
    "noise": ["nois", "noice"],
    "loose": ["loos", "luse"],
    "stuck": ["stuk", "stkc"],
    "working": ["workng", "wrking", "workin"],
    "work": ["wrk", "wok", "wodk", "workk"],

    # Common Tanglish maintenance words (normalize spellings)
    "aagala": ["agala", "aagla", "aagalai", "aagallai", "aagale"],
    "poiduchu": ["poyiduchu", "poduchu", "pochu", "poidichi"],
    "suthala": ["suthla", "suthalla", "suthalai"],
    "eriyala": ["eryala", "eriyalla", "eriyal"],
    "varuthu": ["varthu", "varudhu", "varuthuu"],
    "odanji": ["odangi", "odangiduchu", "odanjiduchu"],
    "adikuthu": ["adikithu", "adikkuthu"],
    "romba": ["rombaa", "rompa"],
    "konjam": ["konjm", "konzham"]
}

# Reverse lookup dictionary for direct O(1) corrections
DIRECT_CORRECTION_MAP: Dict[str, str] = {}
for correct_word, typo_list in KNOWN_WORDS_MAP.items():
    for typo in typo_list:
        DIRECT_CORRECTION_MAP[typo.lower()] = correct_word
    DIRECT_CORRECTION_MAP[correct_word.lower()] = correct_word

VOCABULARY = list(KNOWN_WORDS_MAP.keys())


def correct_spelling(text: str) -> Tuple[str, List[Dict[str, str]]]:
    """
    Performs auto spell-checking and correction on user maintenance input.
    Returns:
        corrected_text: The normalized and typo-corrected text string.
        corrections: List of modifications made [{ 'original': 'keyboaerd', 'corrected': 'keyboard' }]
    """
    if not text or not text.strip():
        return text, []

    corrections = []
    tokens = re.split(r'(\s+|[^\w\u0B80-\u0BFF])', text)
    corrected_tokens = []

    for token in tokens:
        clean_tok = token.strip().lower()
        
        # Skip spaces, punctuation, or non-alphabetic tokens
        if not clean_tok or not clean_tok.isalnum() or len(clean_tok) < 3:
            corrected_tokens.append(token)
            continue

        # Check direct lookup map
        if clean_tok in DIRECT_CORRECTION_MAP:
            standard = DIRECT_CORRECTION_MAP[clean_tok]
            if standard != clean_tok:
                # Match original capitalization
                replacement = standard.upper() if token.isupper() else (standard.capitalize() if token.istitle() else standard)
                corrected_tokens.append(replacement)
                corrections.append({"original": token, "corrected": replacement})
            else:
                corrected_tokens.append(token)
            continue

        # Check for Tanglish attached suffix (e.g., keyboardla -> keyboard la, fanle -> fan le)
        suffix_match = re.match(r'^([a-zA-Z]{3,})(la|le|ku|ula|oda|odu)$', clean_tok)
        if suffix_match:
            stem, suf = suffix_match.group(1), suffix_match.group(2)
            if stem in DIRECT_CORRECTION_MAP:
                fixed_stem = DIRECT_CORRECTION_MAP[stem]
                corrected_tokens.append(f"{fixed_stem} {suf}")
                corrections.append({"original": token, "corrected": f"{fixed_stem} {suf}"})
                continue
            # Fuzzy check stem
            close = difflib.get_close_matches(stem, VOCABULARY, n=1, cutoff=0.75)
            if close:
                fixed_stem = close[0]
                corrected_tokens.append(f"{fixed_stem} {suf}")
                corrections.append({"original": token, "corrected": f"{fixed_stem} {suf}"})
                continue

        # Fuzzy distance matching against Vocabulary
        close_matches = difflib.get_close_matches(clean_tok, VOCABULARY, n=1, cutoff=0.75)
        if close_matches:
            match = close_matches[0]
            replacement = match.upper() if token.isupper() else (match.capitalize() if token.istitle() else match)
            corrected_tokens.append(replacement)
            corrections.append({"original": token, "corrected": replacement})
        else:
            corrected_tokens.append(token)

    corrected_text = "".join(corrected_tokens)
    return corrected_text, corrections
