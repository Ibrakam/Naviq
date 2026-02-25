from fastapi import APIRouter

from app.api import auth, courses, gamification, professions, simulations, skills, users, ws
from app.api.admin import analytics as admin_analytics
from app.api.admin import courses as admin_courses
from app.api.admin import gamification as admin_gamification
from app.api.admin import prompts as admin_prompts
from app.api.admin import simulations as admin_simulations
from app.api.admin import universities as admin_universities
from app.api.admin import users as admin_users

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(skills.router)
api_router.include_router(professions.router)
api_router.include_router(simulations.router)
api_router.include_router(courses.router)
api_router.include_router(gamification.router)
api_router.include_router(ws.router)

admin_router = APIRouter(prefix="/admin")
admin_router.include_router(admin_users.router)
admin_router.include_router(admin_simulations.router)
admin_router.include_router(admin_courses.router)
admin_router.include_router(admin_prompts.router)
admin_router.include_router(admin_analytics.router)
admin_router.include_router(admin_universities.router)
admin_router.include_router(admin_gamification.router)

api_router.include_router(admin_router)
