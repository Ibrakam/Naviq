import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import require_admin
from app.models.simulation import Simulation, SimulationStep
from app.models.user import User
from app.schemas.simulation import SimulationCreate, SimulationOut, SimulationUpdate

router = APIRouter(prefix="/simulations", tags=["admin-simulations"])


@router.get("/", response_model=list[SimulationOut])
async def list_simulations(
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Simulation))
    return result.scalars().all()


@router.post("/", response_model=SimulationOut, status_code=status.HTTP_201_CREATED)
async def create_simulation(
    body: SimulationCreate,
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    simulation = Simulation(
        title=body.title,
        description=body.description,
        profession_id=body.profession_id,
        is_active=body.is_active,
    )
    db.add(simulation)
    await db.flush()

    for step_data in body.steps:
        step = SimulationStep(
            simulation_id=simulation.id,
            order=step_data.order,
            type=step_data.type,
            content=step_data.content,
            next_step_rules=step_data.next_step_rules,
        )
        db.add(step)

    await db.flush()
    await db.refresh(simulation)
    return simulation


@router.get("/{simulation_id}", response_model=SimulationOut)
async def get_simulation(
    simulation_id: uuid.UUID,
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Simulation).where(Simulation.id == simulation_id))
    simulation = result.scalar_one_or_none()
    if not simulation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Simulation not found")
    return simulation


@router.patch("/{simulation_id}", response_model=SimulationOut)
async def update_simulation(
    simulation_id: uuid.UUID,
    body: SimulationUpdate,
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Simulation).where(Simulation.id == simulation_id))
    simulation = result.scalar_one_or_none()
    if not simulation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Simulation not found")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(simulation, field, value)

    await db.flush()
    return simulation


@router.delete("/{simulation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_simulation(
    simulation_id: uuid.UUID,
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Simulation).where(Simulation.id == simulation_id))
    simulation = result.scalar_one_or_none()
    if not simulation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Simulation not found")
    await db.delete(simulation)
