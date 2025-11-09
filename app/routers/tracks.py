from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import CareerTrack, Simulation
from app.schemas import CareerTrack as CareerTrackSchema

router = APIRouter(prefix="/api/tracks", tags=["career-tracks"])


@router.get("/", response_model=List[CareerTrackSchema])
def get_career_tracks(db: Session = Depends(get_db)):
    """Get all career tracks"""
    tracks = db.query(CareerTrack).all()
    return tracks


@router.get("/{track_id}", response_model=CareerTrackSchema)
def get_career_track(track_id: int, db: Session = Depends(get_db)):
    """Get specific career track by ID"""
    track = db.query(CareerTrack).filter(CareerTrack.id == track_id).first()
    
    if not track:
        raise HTTPException(
            status_code=404,
            detail="Career track not found"
        )
    
    return track


@router.get("/{track_id}/simulations")
def get_track_simulations(track_id: int, db: Session = Depends(get_db)):
    """Get all simulations for a specific track"""
    simulations = db.query(Simulation).filter(
        Simulation.track_id == track_id,
        Simulation.is_active == True
    ).all()
    
    return simulations
