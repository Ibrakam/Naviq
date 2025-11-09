import json
from pathlib import Path
from typing import Dict, List, Optional

from sqlalchemy.orm import Session

from app.models import CareerTrack, Simulation

TRACK_SLUG_TO_NAME = {
    "frontend": "Frontend Developer",
    "backend": "Backend Developer",
    "data": "Data Analyst",
    "design": "UI/UX Designer",
    "marketing": "Digital Marketing Specialist",
    "product": "Product Manager",
}


def load_realistic_simulations(db: Session, data_path: Path) -> None:
    """
    Idempotently load the Supabase realistic simulations dataset into the database.
    """
    if not data_path.exists():
        return

    with data_path.open("r", encoding="utf-8") as file:
        simulations_data: List[Dict] = json.load(file)

    for entry in simulations_data:
        title = entry.get("title")
        if not title:
            continue

        existing = db.query(Simulation).filter(Simulation.title == title).first()
        if existing:
            continue

        track_slug = entry.get("track")
        track = _ensure_track(db, track_slug)
        if not track:
            continue

        steps = entry.get("steps") or []
        enriched_steps = []
        for index, step in enumerate(steps, start=1):
            step_copy = dict(step)
            step_copy.setdefault("id", index)
            enriched_steps.append(step_copy)

        simulation = Simulation(
            title=title,
            description=entry.get("description"),
            company=entry.get("company"),
            track_id=track.id,
            steps=enriched_steps,
            duration=entry.get("duration"),
            level=entry.get("difficulty") or "Intermediate",
            is_active=True,
        )
        db.add(simulation)

    db.commit()


def _ensure_track(db: Session, track_slug: str) -> Optional[CareerTrack]:
    if not track_slug:
        return None

    track_name = TRACK_SLUG_TO_NAME.get(track_slug)
    if not track_name:
        return None

    track = db.query(CareerTrack).filter(CareerTrack.name == track_name).first()
    return track
