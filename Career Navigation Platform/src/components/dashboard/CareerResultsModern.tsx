import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, Zap, ArrowRight, Target, Sparkles } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';
import { Button } from '../ui/button';

interface SkillData {
  skill: string;
  value: number;
  fullMark: number;
}

interface CareerMatch {
  name: string;
  match: number;
  color: string;
}

interface CareerResultsModernProps {
  results: any;
  onComplete: () => void;
}

export function CareerResultsModern({ results, onComplete }: CareerResultsModernProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debug: log results
  useEffect(() => {
    console.log('CareerResultsModern results:', results);
  }, [results]);

  // Simulate AI analysis
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnalyzing(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Safety check
  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-[#0f1529] via-[#1a2238] to-[#0f1529] text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-3">Нет данных</h2>
          <p className="text-white/70 mb-6">Результаты не найдены</p>
          <Button onClick={onComplete}>Вернуться</Button>
        </div>
      </div>
    );
  }

  // Prepare radar chart data from results
  const radarData: SkillData[] = React.useMemo(() => {
    try {
      if (results?.skills_radar) {
        return results.skills_radar.map((s: any) => ({
          skill: s.skill || s.name,
          value: s.value || s.score,
          fullMark: 100,
        }));
      }

      // Generate synthetic data from tracks if no skills_radar
      const tracks = results?.tracks || [];
      if (tracks.length >= 2) {
        return [
          { skill: 'Аналитика', value: 85, fullMark: 100 },
          { skill: 'Коммуникация', value: 75, fullMark: 100 },
          { skill: 'Креативность', value: 65, fullMark: 100 },
          { skill: 'Технические навыки', value: 80, fullMark: 100 },
          { skill: 'Лидерство', value: 70, fullMark: 100 },
        ];
      }

      return [];
    } catch (err) {
      console.error('Error preparing radar data:', err);
      return [];
    }
  }, [results]);

  // Career matches with progress bars
  const careerMatches: CareerMatch[] = React.useMemo(() => {
    try {
      if (results?.career_matches) {
        return results.career_matches.slice(0, 3);
      }

      const tracks = results?.tracks || [];
      return tracks.slice(0, 3).map((track: any, idx: number) => ({
        name: track.name || 'Направление ' + (idx + 1),
        match: track.match || track.match_percentage || 85 - idx * 5,
        color: idx === 0 ? '#7b61ff' : idx === 1 ? '#4fb5ff' : '#00e5a0',
      }));
    } catch (err) {
      console.error('Error preparing career matches:', err);
      return [];
    }
  }, [results]);

  const potentialLevel = results.potential_level || 'Высокий';
  const topStrength = results.top_strength || radarData[0]?.skill || 'Аналитика';
  const primaryTrack = results.tracks?.[0];

  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  if (isAnalyzing) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-[#0f1529] via-[#1a2238] to-[#0f1529] relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#7B61FF]/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#5B9FFF]/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00E5A0]/10 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-md relative z-10"
        >
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-[#7B61FF] to-[#5B9FFF] rounded-3xl flex items-center justify-center shadow-lg shadow-[#7B61FF]/50"
          >
            <Sparkles className="w-12 h-12 text-white" />
          </motion.div>
          <motion.h2
            className="text-2xl md:text-3xl font-bold text-white mb-3"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            AI анализ навыков
          </motion.h2>
          <p className="text-lg text-white/70">Обработка...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen px-4 py-8 md:py-12 bg-gradient-to-br from-[#0f1529] via-[#1a2238] to-[#0f1529] text-white relative overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#7B61FF]/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#5B9FFF]/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00E5A0]/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Результаты профориентации
          </h1>
          <p className="text-white/70 text-lg">
            Ваш персональный карьерный профиль готов
          </p>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column - Radar Chart */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 group relative overflow-hidden bg-gradient-to-br from-white to-[#faf9fb] backdrop-blur-xl rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xl hover:shadow-2xl hover:shadow-[#7B61FF]/20 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#7B61FF]/10 via-transparent to-[#5B9FFF]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-1">
                    AI анализ навыков
                  </h2>
                  <p className="text-sm text-slate-600">Ваш профиль компетенций</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-[#7B61FF] to-[#5B9FFF] rounded-2xl flex items-center justify-center shadow-lg shadow-[#7B61FF]/30">
                  <Target className="w-6 h-6 text-white" />
                </div>
              </div>

              {radarData.length > 0 ? (
                <div className="w-full h-[320px] md:h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <defs>
                        <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#7b61ff" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#4fb5ff" stopOpacity={0.3} />
                        </linearGradient>
                      </defs>
                      <PolarGrid
                        stroke="#cbd5e1"
                        strokeWidth={1.5}
                      />
                      <PolarAngleAxis
                        dataKey="skill"
                        tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }}
                      />
                      <Radar
                        name="Навыки"
                        dataKey="value"
                        stroke="#6555ff"
                        strokeWidth={2.5}
                        fill="url(#radarGradient)"
                        fillOpacity={0.6}
                        animationDuration={1000}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[320px] flex items-center justify-center text-slate-500">
                  <p>Данные навыков загружаются...</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Right Column - Potential Card */}
          <motion.div
            variants={itemVariants}
            className="group relative overflow-hidden bg-gradient-to-br from-white to-[#faf9fb] backdrop-blur-xl rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300 flex flex-col justify-center"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <motion.div
                  className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Trophy className="w-8 h-8 text-white" />
                </motion.div>
                <div>
                  <p className="text-sm text-slate-600 font-medium mb-1">Потенциал</p>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                    {potentialLevel}
                  </h3>
                </div>
              </div>
              <p className="text-slate-700 leading-relaxed">
                На основе анализа ваших ответов мы определили высокий потенциал для развития в выбранном направлении.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Career Matches Section */}
        <motion.div variants={itemVariants} className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
            Подходящие направления
          </h2>
          <div className="space-y-4">
            {careerMatches.map((career, index) => (
              <motion.div
                key={career.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                whileHover={{ scale: 1.01, x: 5 }}
                className="group relative overflow-hidden bg-gradient-to-br from-white to-[#faf9fb] backdrop-blur-xl rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#7B61FF]/10 to-[#5B9FFF]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg md:text-xl font-bold text-slate-800">
                      {career.name}
                    </h3>
                    <span className="text-2xl font-bold" style={{ color: career.color }}>
                      {career.match}%
                    </span>
                  </div>
                  <div className="relative w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${career.match}%` }}
                      transition={{ duration: 1, delay: 0.3 + 0.1 * index, ease: 'easeOut' }}
                      className="absolute top-0 left-0 h-full rounded-full shadow-lg"
                      style={{
                        background: `linear-gradient(90deg, ${career.color}, ${career.color}dd)`,
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strength Card */}
          <motion.div
            variants={itemVariants}
            className="group relative overflow-hidden bg-gradient-to-br from-white to-[#faf9fb] backdrop-blur-xl rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xl hover:shadow-2xl hover:shadow-[#7B61FF]/20 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#7B61FF]/10 to-[#5B9FFF]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <motion.div
                  className="w-14 h-14 bg-gradient-to-br from-[#7B61FF] to-[#5B9FFF] rounded-2xl flex items-center justify-center shadow-lg shadow-[#7B61FF]/30"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Zap className="w-7 h-7 text-white" />
                </motion.div>
                <div>
                  <p className="text-sm text-slate-600 font-medium mb-1">Сильная сторона</p>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-[#7B61FF] to-[#5B9FFF] bg-clip-text text-transparent">
                    {topStrength}
                  </h3>
                </div>
              </div>
              <p className="text-slate-700 leading-relaxed">
                Это ваша ключевая компетенция, которая выделяет вас среди других специалистов.
              </p>
            </div>
          </motion.div>

          {/* Next Step Card */}
          <motion.div
            variants={itemVariants}
            className="group relative overflow-hidden bg-gradient-to-br from-white to-[#faf9fb] backdrop-blur-xl rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#00E5A0]/10 to-[#00B8D4]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative z-10">
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-3">
                  Готовы начать?
                </h3>
                <p className="text-slate-700 leading-relaxed mb-6">
                  Попробуйте симуляции для практики навыков в направлении{' '}
                  <span className="font-semibold text-[#7B61FF]">
                    {primaryTrack?.name || 'вашей специальности'}
                  </span>
                </p>
              </div>
              <Button
                onClick={onComplete}
                className="w-full bg-gradient-to-r from-[#7B61FF] to-[#5B9FFF] hover:from-[#6B51EF] hover:to-[#4B8FEF] text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Перейти к симуляциям
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
