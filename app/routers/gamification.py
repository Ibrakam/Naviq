from datetime import datetime, date, timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from app.database import get_db
from app.models import User, UserStats, Achievement, UserAchievement, Submission, Certificate, AssessmentSession
from app.schemas import (
    UserStats as UserStatsSchema,
    Achievement as AchievementSchema,
    UserAchievement as UserAchievementSchema,
    LeaderboardEntry,
    GamificationProfile
)
from app.auth import get_current_active_user

router = APIRouter(prefix="/api/gamification", tags=["gamification"])


def calculate_level_from_xp(xp: int) -> tuple[int, int, int]:
    """Вычисляет уровень на основе XP. Возвращает (уровень, XP до следующего уровня, XP для текущего уровня)"""
    level = 1
    xp_needed = 0
    xp_for_current = 0
    
    while xp_needed <= xp:
        xp_for_level = int(100 * (level ** 1.5))  # Экспоненциальный рост, округляем до целого
        if xp_needed + xp_for_level <= xp:
            xp_needed += xp_for_level
            level += 1
        else:
            break
    
    xp_for_current = xp - xp_needed
    xp_to_next = int(100 * (level ** 1.5)) - xp_for_current
    
    # Убеждаемся, что все значения целые
    xp_for_current = int(xp_for_current)
    xp_to_next = int(xp_to_next)
    
    return level, xp_to_next, xp_for_current


def get_or_create_user_stats(user_id: int, db: Session) -> UserStats:
    """Получить или создать статистику пользователя"""
    stats = db.query(UserStats).filter(UserStats.user_id == user_id).first()
    if not stats:
        stats = UserStats(
            user_id=user_id,
            total_points=0,
            current_level=1,
            experience_points=0,
            experience_to_next_level=100,
            streak_days=0,
            simulations_completed=0,
            certificates_earned=0,
            assessments_completed=0
        )
        db.add(stats)
        db.commit()
        db.refresh(stats)
    return stats


def update_streak(user_id: int, db: Session):
    """Обновить streak пользователя (серия дней подряд)"""
    stats = get_or_create_user_stats(user_id, db)
    today = date.today()
    
    if stats.last_active_date:
        last_active = stats.last_active_date.date()
        if last_active == today:
            # Уже активен сегодня
            return
        elif last_active == today - timedelta(days=1):
            # Продолжаем streak
            stats.streak_days += 1
        else:
            # Streak прерван
            stats.streak_days = 1
    else:
        # Первый раз
        stats.streak_days = 1
    
    stats.last_active_date = datetime.now()
    db.commit()


def add_points(user_id: int, points: int, db: Session, update_streak_flag: bool = True):
    """Добавить очки пользователю"""
    if update_streak_flag:
        update_streak(user_id, db)
    
    stats = get_or_create_user_stats(user_id, db)
    stats.total_points += points
    stats.experience_points += points
    
    # Пересчитать уровень
    level, xp_to_next, xp_for_current = calculate_level_from_xp(stats.experience_points)
    stats.current_level = level
    stats.experience_to_next_level = xp_to_next
    stats.experience_points = xp_for_current
    
    db.commit()
    check_achievements(user_id, db)


def check_achievements(user_id: int, db: Session):
    """Проверить и выдать достижения пользователю"""
    stats = get_or_create_user_stats(user_id, db)
    
    # Получить все достижения
    all_achievements = db.query(Achievement).all()
    
    # Получить уже полученные достижения
    earned_achievement_ids = [
        ua.achievement_id 
        for ua in db.query(UserAchievement).filter(UserAchievement.user_id == user_id).all()
    ]
    
    for achievement in all_achievements:
        if achievement.id in earned_achievement_ids:
            continue
        
        # Проверка условий достижения
        should_earn = False
        
        if achievement.requirement_type == "simulations_completed":
            if stats.simulations_completed >= (achievement.requirement_value or 0):
                should_earn = True
        elif achievement.requirement_type == "certificates_earned":
            if stats.certificates_earned >= (achievement.requirement_value or 0):
                should_earn = True
        elif achievement.requirement_type == "assessments_completed":
            if stats.assessments_completed >= (achievement.requirement_value or 0):
                should_earn = True
        elif achievement.requirement_type == "streak_days":
            if stats.streak_days >= (achievement.requirement_value or 0):
                should_earn = True
        elif achievement.requirement_type == "total_points":
            if stats.total_points >= (achievement.requirement_value or 0):
                should_earn = True
        elif achievement.requirement_type == "level":
            if stats.current_level >= (achievement.requirement_value or 0):
                should_earn = True
        
        if should_earn:
            # Выдать достижение
            user_achievement = UserAchievement(
                user_id=user_id,
                achievement_id=achievement.id,
                points_earned=achievement.points_reward
            )
            db.add(user_achievement)
            
            # Добавить очки за достижение
            if achievement.points_reward > 0:
                add_points(user_id, achievement.points_reward, db, update_streak_flag=False)
            
            db.commit()


@router.get("/profile", response_model=GamificationProfile)
def get_gamification_profile(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Получить полный профиль геймификации текущего пользователя"""
    stats = get_or_create_user_stats(current_user.id, db)
    
    # Получить все достижения пользователя
    user_achievements = (
        db.query(UserAchievement)
        .filter(UserAchievement.user_id == current_user.id)
        .order_by(desc(UserAchievement.earned_at))
        .all()
    )
    
    # Последние 5 достижений
    recent_achievements = user_achievements[:5]
    
    # Прогресс уровня
    level_progress = (stats.experience_points / (stats.experience_to_next_level + stats.experience_points)) * 100 if (stats.experience_to_next_level + stats.experience_points) > 0 else 0
    
    # Убеждаемся, что все значения в stats целые числа
    stats.experience_points = int(stats.experience_points) if stats.experience_points else 0
    stats.experience_to_next_level = int(stats.experience_to_next_level) if stats.experience_to_next_level else 100
    
    return GamificationProfile(
        stats=stats,
        achievements=user_achievements,
        recent_achievements=recent_achievements,
        level_progress=round(level_progress, 2),
        next_level_points=int(stats.experience_to_next_level)
    )


@router.get("/stats", response_model=UserStatsSchema)
def get_user_stats(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Получить статистику текущего пользователя"""
    stats = get_or_create_user_stats(current_user.id, db)
    # Убеждаемся, что все значения целые числа
    stats.experience_points = int(stats.experience_points) if stats.experience_points else 0
    stats.experience_to_next_level = int(stats.experience_to_next_level) if stats.experience_to_next_level else 100
    return stats


@router.get("/achievements", response_model=List[UserAchievementSchema])
def get_user_achievements(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Получить все достижения текущего пользователя"""
    user_achievements = (
        db.query(UserAchievement)
        .filter(UserAchievement.user_id == current_user.id)
        .order_by(desc(UserAchievement.earned_at))
        .all()
    )
    return user_achievements


@router.get("/achievements/all", response_model=List[AchievementSchema])
def get_all_achievements(db: Session = Depends(get_db)):
    """Получить все доступные достижения"""
    achievements = db.query(Achievement).order_by(Achievement.category, Achievement.points_reward).all()
    return achievements


@router.get("/leaderboard", response_model=List[LeaderboardEntry])
def get_leaderboard(
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Получить таблицу лидеров"""
    # Получить топ пользователей по очкам
    top_stats = (
        db.query(UserStats, User.name)
        .join(User, UserStats.user_id == User.id)
        .order_by(desc(UserStats.total_points), desc(UserStats.current_level))
        .limit(limit)
        .all()
    )
    
    leaderboard = []
    for rank, (stats, user_name) in enumerate(top_stats, start=1):
        leaderboard.append(LeaderboardEntry(
            user_id=stats.user_id,
            user_name=user_name,
            total_points=stats.total_points,
            current_level=stats.current_level,
            simulations_completed=stats.simulations_completed,
            certificates_earned=stats.certificates_earned,
            streak_days=stats.streak_days,
            rank=rank
        ))
    
    return leaderboard


def update_stats_on_simulation_complete(
    simulation_id: int,
    score: int,
    current_user: User,
    db: Session
):
    """Обновить статистику после завершения симуляции (вызывается автоматически)"""
    stats = get_or_create_user_stats(current_user.id, db)
    
    # Добавить завершенную симуляцию
    stats.simulations_completed += 1
    
    # Начислить очки (базовые + бонус за счет)
    base_points = 50
    score_bonus = max(0, score - 50)  # Бонус за счет выше 50
    points = base_points + score_bonus
    
    add_points(current_user.id, points, db, update_streak_flag=False)
    update_streak(current_user.id, db)
    
    return {"message": "Stats updated", "points_earned": points}


def update_stats_on_certificate_earned(
    current_user: User,
    db: Session
):
    """Обновить статистику после получения сертификата"""
    stats = get_or_create_user_stats(current_user.id, db)
    stats.certificates_earned += 1
    
    # Начислить очки за сертификат
    points = 100
    add_points(current_user.id, points, db, update_streak_flag=False)
    update_streak(current_user.id, db)
    
    return {"message": "Stats updated", "points_earned": points}


def update_stats_on_assessment_complete(
    current_user: User,
    db: Session
):
    """Обновить статистику после завершения оценки"""
    stats = get_or_create_user_stats(current_user.id, db)
    stats.assessments_completed += 1
    
    # Начислить очки за прохождение оценки
    points = 30
    add_points(current_user.id, points, db, update_streak_flag=False)
    update_streak(current_user.id, db)
    
    return {"message": "Stats updated", "points_earned": points}

