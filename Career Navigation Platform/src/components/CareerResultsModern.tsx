import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, Zap, ArrowRight, Target, Sparkles } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';
import { Button } from './ui/button';

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
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Нет данных</h2>
          <p className="text-gray-600 mb-6">Результаты не найдены</p>
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
      <div className="min-h-screen flex items-center justify-center px-4" style={{
        background: 'radial-gradient(circle at 20% 30%, rgba(123, 97, 255, 0.15), transparent 40%), radial-gradient(circle at 80% 60%, rgba(0, 229, 160, 0.12), transparent 40%), linear-gradient(135deg, #f0f4ff 0%, #f6f8ff 40%, #e6f7f1 100%)'
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-md"
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
            className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-[#edeaff] to-[#d2e9ff] rounded-3xl flex items-center justify-center shadow-lg"
          >
            <Sparkles className="w-12 h-12 text-[#6555ff]" />
          </motion.div>
          <motion.h2
            className="text-2xl md:text-3xl font-bold text-gray-900 mb-3"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            AI анализ навыков
          </motion.h2>
          <p className="text-lg text-gray-600">Обработка...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen px-4 py-8 md:py-12"
      style={{
        background: 'radial-gradient(circle at 20% 30%, rgba(123, 97, 255, 0.15), transparent 40%), radial-gradient(circle at 80% 60%, rgba(0, 229, 160, 0.12), transparent 40%), linear-gradient(135deg, #f0f4ff 0%, #f6f8ff 40%, #e6f7f1 100%)'
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Результаты профориентации
          </h1>
          <p className="text-gray-600 text-lg">
            Ваш персональный карьерный профиль готов
          </p>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column - Radar Chart */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 bg-white/90 backdrop-blur-lg rounded-3xl border-2 border-white/60 p-6 md:p-8 shadow-[0_20px_60px_rgba(73,92,175,0.15)] hover:shadow-[0_25px_70px_rgba(73,92,175,0.2)] transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                  AI анализ навыков
                </h2>
                <p className="text-sm text-gray-600">Ваш профиль компетенций</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-[#edeaff] to-[#d2e9ff] rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-[#6555ff]" />
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
                      stroke="#e0e4f5"
                      strokeWidth={1.5}
                    />
                    <PolarAngleAxis
                      dataKey="skill"
                      tick={{ fill: '#5b617a', fontSize: 13, fontWeight: 500 }}
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
              <div className="h-[320px] flex items-center justify-center text-gray-500">
                <p>Данные навыков загружаются...</p>
              </div>
            )}
          </motion.div>

          {/* Right Column - Potential Card */}
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-[#00e5a0]/10 via-white/95 to-[#4fb5ff]/10 backdrop-blur-lg rounded-3xl border-2 border-white/60 p-6 md:p-8 shadow-[0_20px_60px_rgba(73,92,175,0.15)] hover:shadow-[0_25px_70px_rgba(73,92,175,0.2)] transition-all duration-300 flex flex-col justify-center"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[#00e5a0] to-[#00c488] rounded-2xl flex items-center justify-center shadow-lg">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Потенциал</p>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-[#00e5a0] to-[#00c488] bg-clip-text text-transparent">
                  {potentialLevel}
                </h3>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">
              На основе анализа ваших ответов мы определили высокий потенциал для развития в выбранном направлении.
            </p>
          </motion.div>
        </div>

        {/* Career Matches Section */}
        <motion.div variants={itemVariants} className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            Подходящие направления
          </h2>
          <div className="space-y-4">
            {careerMatches.map((career, index) => (
              <motion.div
                key={career.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                className="bg-white/90 backdrop-blur-lg rounded-2xl border-2 border-white/60 p-5 md:p-6 shadow-[0_12px_40px_rgba(73,92,175,0.12)] hover:shadow-[0_16px_50px_rgba(73,92,175,0.18)] transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900">
                    {career.name}
                  </h3>
                  <span className="text-2xl font-bold" style={{ color: career.color }}>
                    {career.match}%
                  </span>
                </div>
                <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${career.match}%` }}
                    transition={{ duration: 1, delay: 0.3 + 0.1 * index, ease: 'easeOut' }}
                    className="absolute top-0 left-0 h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${career.color}, ${career.color}dd)`,
                    }}
                  />
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
            className="bg-gradient-to-br from-[#6555ff]/10 via-white/95 to-[#7b61ff]/10 backdrop-blur-lg rounded-3xl border-2 border-white/60 p-6 md:p-8 shadow-[0_20px_60px_rgba(73,92,175,0.15)] hover:shadow-[0_25px_70px_rgba(73,92,175,0.2)] transition-all duration-300"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-[#6555ff] to-[#7b61ff] rounded-2xl flex items-center justify-center shadow-lg">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Сильная сторона</p>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-[#6555ff] to-[#7b61ff] bg-clip-text text-transparent">
                  {topStrength}
                </h3>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Это ваша ключевая компетенция, которая выделяет вас среди других специалистов.
            </p>
          </motion.div>

          {/* Next Step Card */}
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-[#4fb5ff]/10 via-white/95 to-[#00e5a0]/10 backdrop-blur-lg rounded-3xl border-2 border-white/60 p-6 md:p-8 shadow-[0_20px_60px_rgba(73,92,175,0.15)] hover:shadow-[0_25px_70px_rgba(73,92,175,0.2)] transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                Готовы начать?
              </h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                Попробуйте симуляции для практики навыков в направлении{' '}
                <span className="font-semibold text-[#6555ff]">
                  {primaryTrack?.name || 'вашей специальности'}
                </span>
              </p>
            </div>
            <Button
              onClick={onComplete}
              className="w-full bg-gradient-to-r from-[#6555ff] to-[#4fb5ff] hover:from-[#5647f0] hover:to-[#3fa3e8] text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Перейти к симуляциям
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
