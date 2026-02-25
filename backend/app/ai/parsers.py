import json

EXPECTED_SKILLS = [
    "communication",
    "leadership",
    "analytics",
    "creativity",
    "technical",
    "teamwork",
    "problem_solving",
    "time_management",
    "adaptability",
    "critical_thinking",
]


def parse_skill_vector(raw: str) -> dict[str, float]:
    data = json.loads(raw)
    result = {}
    for skill in EXPECTED_SKILLS:
        value = data.get(skill, 0.0)
        result[skill] = max(0.0, min(1.0, float(value)))
    return result


def parse_roadmap(raw: str) -> dict:
    return json.loads(raw)
