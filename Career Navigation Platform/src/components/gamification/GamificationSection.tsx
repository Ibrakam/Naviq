import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Flame, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { apiRoutes, buildApiUrl } from '../../utils/api';

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
          total_points: 60,
          current_level: 1,
          experience_points: 60,
          experience_to_next_level: 40,
          streak_days: 1,
          simulations_completed: 0,
          certificates_earned: 0,
          assessments_completed: 0,
          created_at: new Date().toISOString(),
        },
        achievements: [],
        recent_achievements: [],
        level_progress: 60,
        next_level_points: 40,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
          >
            <Card
              className="backdrop-blur-xl border border-white/20 p-6"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%)'
              }}
            >
              <div className="animate-pulse">
                <div className="h-4 rounded w-1/2 mb-4" style={{ background: 'rgba(255, 255, 255, 0.3)' }}></div>
                <div className="h-8 rounded w-1/3" style={{ background: 'rgba(255, 255, 255, 0.3)' }}></div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    );
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: 'easeOut',
      },
    }),
  };

  return (
    <>
      <div className="mb-8">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-bold mb-6 flex items-center gap-2 text-white"
        >
          <Trophy className="w-6 h-6 text-[#00E5A0]" />
          Your Statistics
        </motion.h2>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {/* Level Card */}
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <Card
              className="group relative overflow-hidden border-2 border-slate-200 shadow-2xl hover:shadow-[#7B61FF]/20 transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #faf9fb 100%)'
              }}
            >
              {/* Animated gradient overlay */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(123, 97, 255, 0.15) 0%, transparent 50%, rgba(91, 159, 255, 0.15) 100%)'
                }}
              />

              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-slate-600 text-sm mb-1 font-medium">Your Level</p>
                    <motion.h3
                      className="text-4xl font-extrabold bg-gradient-to-r from-[#7B61FF] to-[#5B9FFF] bg-clip-text text-transparent"
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    >
                      LVL {profile.stats.current_level}
                    </motion.h3>
                  </div>
                  <motion.div
                    className="w-16 h-16 bg-gradient-to-br from-[#7B61FF] to-[#5B9FFF] rounded-2xl flex items-center justify-center shadow-lg shadow-[#7B61FF]/30"
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Star className="h-8 w-8 text-white fill-white" />
                  </motion.div>
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600 font-medium">Progress</span>
                    <span className="font-bold text-slate-900">
                      {profile.level_progress.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-[#7B61FF] to-[#5B9FFF] h-3 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${profile.level_progress}%` }}
                      transition={{ delay: 0.3, duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2 font-medium">
                    {profile.next_level_points} XP remaining until level{' '}
                    {profile.stats.current_level + 1}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Points Card */}
          <motion.div
            custom={1}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <Card
              className="group relative overflow-hidden border-2 border-emerald-200 shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f0fdfa 100%)'
              }}
            >
              {/* Animated gradient overlay */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 229, 160, 0.15) 0%, transparent 50%, rgba(91, 159, 255, 0.15) 100%)'
                }}
              />

              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-slate-600 text-sm mb-1 font-medium">Points</p>
                    <motion.h3
                      className="text-4xl font-extrabold bg-gradient-to-r from-[#00E5A0] to-[#5B9FFF] bg-clip-text text-transparent"
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                    >
                      {profile.stats.total_points.toLocaleString()}
                    </motion.h3>
                  </div>
                  <motion.div
                    className="w-16 h-16 bg-gradient-to-br from-[#00E5A0] to-[#5B9FFF] rounded-2xl flex items-center justify-center shadow-lg shadow-[#00E5A0]/30"
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Trophy className="h-8 w-8 text-white fill-white" />
                  </motion.div>
                </div>
                <div className="space-y-3 pt-3 border-t border-slate-200">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center justify-between"
                  >
                    <span className="text-slate-600 text-sm font-medium">
                      Simulations Completed
                    </span>
                    <span className="font-bold text-slate-900">
                      {profile.stats.simulations_completed}
                    </span>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center justify-between"
                  >
                    <span className="text-slate-600 text-sm font-medium">Certificates</span>
                    <span className="font-bold text-slate-900">
                      {profile.stats.certificates_earned}
                    </span>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Streak Card */}
          <motion.div
            custom={2}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <Card
              className="group relative overflow-hidden border-2 border-orange-200 shadow-2xl hover:shadow-orange-500/20 transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #fff7ed 100%)'
              }}
            >
              {/* Animated gradient overlay */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, transparent 50%, rgba(234, 179, 8, 0.15) 100%)'
                }}
              />

              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-slate-600 text-sm mb-1 font-medium">Day Streak</p>
                    <motion.h3
                      className="text-4xl font-extrabold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent"
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                    >
                      {profile.stats.streak_days}
                    </motion.h3>
                  </div>
                  <motion.div
                    className="w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30"
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <Flame className="h-8 w-8 text-white fill-white" />
                  </motion.div>
                </div>
                <p className="text-slate-600 text-sm font-medium">
                  {profile.stats.streak_days === 0
                    ? 'Start your streak today!'
                    : profile.stats.streak_days === 1
                    ? 'Great start!'
                    : `${profile.stats.streak_days} days in a row - keep it up!`}
                </p>
                {profile.stats.streak_days >= 7 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-3 text-xs text-orange-600 font-semibold bg-orange-100 px-3 py-1 rounded-full inline-block"
                  >
                    🔥 On Fire!
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Achievements */}
        {profile.recent_achievements && profile.recent_achievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Card
              className="border-2 border-slate-200 shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #faf9fb 100%)'
              }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Award className="w-5 h-5 text-[#7B61FF]" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {profile.recent_achievements.map((userAch, index) => (
                    <motion.div
                      key={userAch.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="p-4 rounded-xl border border-slate-200 hover:border-[#7B61FF]/30 hover:shadow-lg transition-all duration-300"
                      style={{
                        background: 'linear-gradient(135deg, rgba(248, 250, 252, 1) 0%, rgba(255, 255, 255, 1) 100%)'
                      }}
                    >
                      <div className="text-center">
                        <motion.div
                          className="text-4xl mb-2"
                          whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.2 }}
                          transition={{ duration: 0.5 }}
                        >
                          {userAch.achievement.icon}
                        </motion.div>
                        <h4 className="font-semibold text-slate-900 text-sm mb-1">
                          {userAch.achievement.name}
                        </h4>
                        <p className="text-xs text-[#7B61FF] font-bold">
                          +{userAch.points_earned} points
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {profile.achievements.length > 3 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-4 text-center"
                  >
                    <Button
                      variant="outline"
                      onClick={() => setShowAllAchievements(true)}
                      className="bg-gradient-to-r from-[#7B61FF] to-[#5B9FFF] text-white border-0 hover:opacity-90 shadow-lg hover:shadow-xl transition-all"
                    >
                      View All Achievements
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* All Achievements Dialog */}
      <Dialog open={showAllAchievements} onOpenChange={setShowAllAchievements}>
        <DialogContent
          className="max-w-4xl max-h-[80vh] overflow-y-auto backdrop-blur-xl border border-white/20"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%)'
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900 text-2xl">
              <Award className="w-6 h-6 text-[#7B61FF]" />
              All Achievements
            </DialogTitle>
          </DialogHeader>
          <div className="grid md:grid-cols-3 gap-4 mt-4">
            {profile.achievements.map((userAch, index) => (
              <motion.div
                key={userAch.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                className="p-6 rounded-xl border border-slate-200 hover:border-[#7B61FF]/30 hover:shadow-lg transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(248, 250, 252, 1) 0%, rgba(255, 255, 255, 1) 100%)'
                }}
              >
                <div className="text-center">
                  <div className="text-5xl mb-3">{userAch.achievement.icon}</div>
                  <h4 className="font-bold text-slate-900 mb-2">
                    {userAch.achievement.name}
                  </h4>
                  {userAch.achievement.description && (
                    <p className="text-xs text-slate-600 mb-2">
                      {userAch.achievement.description}
                    </p>
                  )}
                  <p className="text-sm text-[#7B61FF] font-bold">
                    +{userAch.points_earned} points
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    Earned: {new Date(userAch.earned_at).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
