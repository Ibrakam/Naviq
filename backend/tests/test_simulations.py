from app.services.simulation_engine import resolve_next_step


class FakeStep:
    def __init__(self, order, next_step_rules=None):
        self.order = order
        self.next_step_rules = next_step_rules


def test_resolve_next_step_no_rules():
    steps = [FakeStep(1), FakeStep(2), FakeStep(3)]
    result = resolve_next_step(steps[0], "any answer", steps)
    assert result.order == 2


def test_resolve_next_step_with_condition():
    rules = {
        "conditions": [
            {"if_answer_contains": "delegate", "goto_step": 5},
            {"if_answer_contains": "myself", "goto_step": 6},
        ],
        "default": 4,
    }
    steps = [FakeStep(3, rules), FakeStep(4), FakeStep(5), FakeStep(6)]
    result = resolve_next_step(steps[0], "I would delegate the task", steps)
    assert result.order == 5


def test_resolve_next_step_default():
    rules = {
        "conditions": [{"if_answer_contains": "delegate", "goto_step": 5}],
        "default": 4,
    }
    steps = [FakeStep(3, rules), FakeStep(4), FakeStep(5)]
    result = resolve_next_step(steps[0], "I don't know", steps)
    assert result.order == 4


def test_resolve_next_step_end():
    steps = [FakeStep(3)]
    result = resolve_next_step(steps[0], "answer", steps)
    assert result is None
