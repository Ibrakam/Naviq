import React, { useState, useEffect } from 'react';
import { Trophy, Star, Flame, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { apiRoutes, buildApiUrl } from '../utils/api';

interface UserStats {
  id: number;
  user_id: number;
  total_points: number;
  current_level: number;
  experience_points: number;
  experience_to_next_level: number;
  streak_days: number;
  last_active_date?: string;
  simulations_completed: number;
  certificates_earned: number;
  assessments_completed: number;
  created_at: string;
  updated_at?: string;
}

interface Achievement {
  id: number;
  code: string;
  name: string;
  description?: string;
  icon: string;
  points_reward: number;
  category?: string;
  requirement_type?: string;
  requirement_value?: number;
  is_hidden: boolean;
  created_at: string;
}

interface UserAchievement {
  id: number;
  user_id: number;
  achievement_id: number;
  earned_at: string;
  points_earned: number;
  achievement: Achievement;
}

interface GamificationProfile {
  stats: UserStats;
  achievements: UserAchievement[];
  recent_achievements: UserAchievement[];
  level_progress: number;
  next_level_points: number;
}

interface GamificationSectionProps {
  accessToken: string;
}

export function GamificationSection({ accessToken }: GamificationSectionProps) {
  const [profile, setProfile] = useState<GamificationProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllAchievements, setShowAllAchievements] = useState(false);

  useEffect(() => {
    loadGamificationData();
  }, []);

  const loadGamificationData = async () => {
    try {
      // First ensure stats exist
      await fetch(buildApiUrl(apiRoutes.gamificationStats), {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Then get full profile
      const response = await fetch(buildApiUrl(apiRoutes.gamificationProfile), {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load gamification data');
      }

      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error('Failed to load gamification:', error);
      // Set default values
      setProfile({
        stats: {
          id: 0,
          user_id: 0,
          total_points: 0,
          current_level: 1,
          experience_points: 0,
          experience_to_next_level: 100,
          streak_days: 0,
          simulations_completed: 0,
          certificates_earned: 0,
          assessments_completed: 0,
          created_at: new Date().toISOString(),
        },
        achievements: [],
        recent_achievements: [],
        level_progress: 0,
        next_level_points: 100,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  // Filter duplicate achievements
  const uniqueRecentAchievements: UserAchievement[] = Array.from(
    new Map(
      profile.recent_achievements.map((ach) => [ach.achievement.id, ach])
    ).values()
  ) as UserAchievement[];

  const uniqueAllAchievements: UserAchievement[] = Array.from(
    new Map(
      profile.achievements
        .sort(
          (a, b) =>
            new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime()
        )
        .map((ach) => [ach.achievement.id, ach])
    ).values()
  ) as UserAchievement[];

  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900">
          <Trophy className="w-6 h-6 text-green-600" />
          Твоя статистика
        </h2>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {/* Level Card */}
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Ваш уровень</p>
                  <h3 className="text-4xl font-bold text-gray-900">
                    LVL {profile.stats.current_level}
                  </h3>
                </div>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Star className="h-8 w-8 text-green-600 fill-green-600" />
                </div>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Прогресс</span>
                  <span className="font-semibold text-gray-900">
                    {profile.level_progress.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${profile.level_progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Осталось {profile.next_level_points} XP до уровня{' '}
                  {profile.stats.current_level + 1}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Points Card */}
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Очки</p>
                  <h3 className="text-4xl font-bold text-gray-900">
                    {profile.stats.total_points.toLocaleString()}
                  </h3>
                </div>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Trophy className="h-8 w-8 text-green-600 fill-green-600" />
                </div>
              </div>
              <div className="space-y-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">
                    Симуляции завершено
                  </span>
                  <span className="font-semibold text-gray-900">
                    {profile.stats.simulations_completed}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Сертификаты</span>
                  <span className="font-semibold text-gray-900">
                    {profile.stats.certificates_earned}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Streak Card */}
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Серия дней</p>
                  <h3 className="text-4xl font-bold text-gray-900">
                    {profile.stats.streak_days}
                  </h3>
                </div>
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                  <Flame className="h-8 w-8 text-orange-500 fill-orange-500" />
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                {profile.stats.streak_days === 0
                  ? 'Начните свою серию сегодня!'
                  : profile.stats.streak_days === 1
                  ? 'Отличное начало!'
                  : `${profile.stats.streak_days} дня подряд - так держать!`}
              </p>
              {profile.stats.streak_days >= 7 && (
                <div className="mt-3 text-xs bg-orange-50 text-orange-700 rounded-md px-3 py-1.5 inline-block border border-orange-200">
                  🔥 Серия в огне!
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Achievements */}
        {uniqueRecentAchievements.length > 0 && (
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Award className="w-5 h-5 text-green-600" />
                  Недавние достижения
                </CardTitle>
                {profile.achievements.length > uniqueRecentAchievements.length && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllAchievements(true)}
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    Показать все ({profile.achievements.length})
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {uniqueRecentAchievements.slice(0, 5).map((userAch: UserAchievement) => (
                  <div
                    key={userAch.id}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center hover:shadow-md hover:border-green-300 transition-all"
                  >
                    <div className="text-4xl mb-2">
                      {userAch.achievement.icon}
                    </div>
                    <div className="font-semibold text-sm text-gray-900">
                      {userAch.achievement.name}
                    </div>
                    <div className="text-xs text-green-600 mt-1 font-medium">
                      +{userAch.points_earned} очков
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* All Achievements Dialog */}
      <Dialog open={showAllAchievements} onOpenChange={setShowAllAchievements}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900">
              <Trophy className="w-6 h-6 text-green-600" />
              Все достижения ({uniqueAllAchievements.length})
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {uniqueAllAchievements.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {uniqueAllAchievements.map((userAch: UserAchievement) => (
                  <div
                    key={userAch.id}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-5 text-center hover:shadow-md hover:border-green-300 transition-all"
                  >
                    <div className="text-5xl mb-3">
                      {userAch.achievement.icon}
                    </div>
                    <div className="font-bold text-lg text-gray-900 mb-1">
                      {userAch.achievement.name}
                    </div>
                    {userAch.achievement.description && (
                      <div className="text-sm text-gray-600 mb-2">
                        {userAch.achievement.description}
                      </div>
                    )}
                    <div className="flex items-center justify-center space-x-4 mt-3 pt-3 border-t border-gray-200">
                      <div className="text-sm">
                        <span className="font-semibold text-green-600">
                          +{userAch.points_earned}
                        </span>
                        <span className="text-gray-600"> очков</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(userAch.earned_at).toLocaleDateString(
                          'ru-RU'
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">У вас пока нет достижений</p>
                <p className="text-sm text-gray-500 mt-2">
                  Начните проходить симуляции, чтобы заработать первые
                  достижения!
                </p>
              </div>
            )}
          </div>
          <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Всего заработано очков:{' '}
              <span className="font-semibold text-gray-900">
                {uniqueAllAchievements.reduce(
                  (sum: number, ach: UserAchievement) => sum + ach.points_earned,
                  0
                )}
              </span>
            </div>
            <Button 
              onClick={() => setShowAllAchievements(false)}
              className="bg-green-500 hover:bg-green-600"
            >
              Закрыть
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

