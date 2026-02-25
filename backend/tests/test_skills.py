from app.ai.parsers import parse_skill_vector


def test_parse_skill_vector_valid():
    raw = '{"communication": 0.7, "leadership": 0.3, "analytics": 0.5, "creativity": 0.8, "technical": 0.9, "teamwork": 0.6, "problem_solving": 0.7, "time_management": 0.5, "adaptability": 0.6, "critical_thinking": 0.4}'
    result = parse_skill_vector(raw)
    assert result["communication"] == 0.7
    assert result["technical"] == 0.9
    assert len(result) == 10


def test_parse_skill_vector_clamp():
    raw = '{"communication": 1.5, "leadership": -0.3}'
    result = parse_skill_vector(raw)
    assert result["communication"] == 1.0
    assert result["leadership"] == 0.0


def test_parse_skill_vector_missing():
    raw = '{"communication": 0.5}'
    result = parse_skill_vector(raw)
    assert result["communication"] == 0.5
    assert result["leadership"] == 0.0
