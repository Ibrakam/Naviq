import json
import uuid

import redis.asyncio as redis

from app.config import get_settings
from app.models.simulation import Simulation, SimulationStep
from app.schemas.simulation import SimulationSessionState

settings = get_settings()

SESSION_TTL = 3600  # 1 hour

_redis: redis.Redis | None = None


async def _get_redis() -> redis.Redis:
    global _redis
    if _redis is None:
        _redis = redis.from_url(settings.REDIS_URL, decode_responses=True)
    return _redis


def _session_key(user_id: uuid.UUID, simulation_id: uuid.UUID) -> str:
    return f"simulation:{user_id}:{simulation_id}"


async def get_session(user_id: uuid.UUID, simulation_id: uuid.UUID) -> SimulationSessionState | None:
    r = await _get_redis()
    data = await r.get(_session_key(user_id, simulation_id))
    if data is None:
        return None
    return SimulationSessionState(**json.loads(data))


async def save_session(user_id: uuid.UUID, state: SimulationSessionState) -> None:
    r = await _get_redis()
    await r.set(
        _session_key(user_id, state.simulation_id),
        state.model_dump_json(),
        ex=SESSION_TTL,
    )


async def delete_session(user_id: uuid.UUID, simulation_id: uuid.UUID) -> None:
    r = await _get_redis()
    await r.delete(_session_key(user_id, simulation_id))


async def start_simulation(user_id: uuid.UUID, simulation: Simulation) -> tuple[SimulationSessionState, SimulationStep | None]:
    state = SimulationSessionState(
        simulation_id=simulation.id,
        current_step_order=1,
        answers=[],
        completed=False,
    )

    first_step = next((s for s in simulation.steps if s.order == 1), None)
    await save_session(user_id, state)
    return state, first_step


def resolve_next_step(current_step: SimulationStep, answer: str, all_steps: list[SimulationStep]) -> SimulationStep | None:
    rules = current_step.next_step_rules
    if not rules:
        next_order = current_step.order + 1
        return next((s for s in all_steps if s.order == next_order), None)

    conditions = rules.get("conditions", [])
    for cond in conditions:
        keyword = cond.get("if_answer_contains", "")
        if keyword and keyword.lower() in answer.lower():
            target = cond.get("goto_step")
            return next((s for s in all_steps if s.order == target), None)

    default_order = rules.get("default", current_step.order + 1)
    return next((s for s in all_steps if s.order == default_order), None)


async def process_step(
    user_id: uuid.UUID,
    simulation: Simulation,
    answer: str,
) -> tuple[SimulationSessionState, SimulationStep | None]:
    state = await get_session(user_id, simulation.id)
    if state is None:
        raise ValueError("No active session found")

    current_step = next((s for s in simulation.steps if s.order == state.current_step_order), None)
    if current_step is None:
        state.completed = True
        await save_session(user_id, state)
        return state, None

    state.answers.append({"step_order": current_step.order, "answer": answer})
    next_step = resolve_next_step(current_step, answer, list(simulation.steps))

    if next_step is None:
        state.completed = True
    else:
        state.current_step_order = next_step.order

    await save_session(user_id, state)
    return state, next_step
