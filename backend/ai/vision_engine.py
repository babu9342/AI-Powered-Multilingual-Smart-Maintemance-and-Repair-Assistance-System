from typing import Dict, Any, Optional

def analyze_vision(category: str, description: str = "") -> Dict[str, Any]:
    """
    Computer Vision simulation engine:
    Performs defect classification, localization bounding box generation [x%, y%, w%, h%],
    and confidence assessment.
    """
    category_vision_specs = {
        "electrical": {
            "defect": "Faulty Wiring / High Heat Terminal Arc",
            "confidence": 0.94,
            "bbox": [25.0, 20.0, 50.0, 60.0]
        },
        "plumbing": {
            "defect": "Pressurized Pipe Joint Leakage",
            "confidence": 0.97,
            "bbox": [28.0, 24.0, 58.0, 52.0]
        },
        "infrastructure": {
            "defect": "Structural Fracture / Hinge Disalignment",
            "confidence": 0.92,
            "bbox": [18.0, 22.0, 64.0, 60.0]
        },
        "cleaning": {
            "defect": "Chemical Stain / Biological Contamination",
            "confidence": 0.89,
            "bbox": [22.0, 30.0, 55.0, 48.0]
        },
        "security": {
            "defect": "Camera Lens Obstruction / Gate Sensor Tamper",
            "confidence": 0.93,
            "bbox": [32.0, 25.0, 42.0, 45.0]
        },
        "network": {
            "defect": "Severed RJ45 Clip / Port Disconnection",
            "confidence": 0.91,
            "bbox": [20.0, 35.0, 60.0, 40.0]
        },
        "other": {
            "defect": "Mechanical Wear & Surface Fracture",
            "confidence": 0.88,
            "bbox": [25.0, 25.0, 50.0, 50.0]
        }
    }

    spec = category_vision_specs.get(category, category_vision_specs["other"])
    return {
        "detectedObject": spec["defect"],
        "visionConfidence": spec["confidence"],
        "boundingBox": spec["bbox"]
    }
