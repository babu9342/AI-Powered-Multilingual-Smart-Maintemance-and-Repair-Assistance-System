from typing import List, Dict, Any, Optional

def select_best_technician(category: str, technicians: List[Dict[str, Any]], preferred_zone: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """
    Selects the optimal registered technician based on:
    1. Category specialty match
    2. Availability ('Available' > other)
    3. Rating and completed jobs
    4. Proximity to location zone
    """
    if not technicians:
        return None

    # Filter by category
    matching = [t for t in technicians if t.get("category", "").lower() == category.lower()]
    if not matching:
        matching = technicians # Fallback if cross-skilled

    # Prioritize available technicians
    available = [t for t in matching if t.get("status") == "Available"]
    candidates = available if available else matching

    # Proximity bonus if zone matches
    def score_technician(tech):
        score = tech.get("rating", 4.0) * 10
        score += min(20, tech.get("experienceYears", 1) * 2)
        score += min(10, tech.get("completedJobs", 0) * 0.1)
        if preferred_zone and preferred_zone.lower() in tech.get("location", "").lower():
            score += 15
        if tech.get("status") == "Available":
            score += 25
        return score

    sorted_techs = sorted(candidates, key=score_technician, reverse=True)
    return sorted_techs[0] if sorted_techs else None
