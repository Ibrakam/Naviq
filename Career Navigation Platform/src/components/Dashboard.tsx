import React, { useState, useEffect } from 'react';
import { Sparkles, Target, BookOpen, User, LogOut, LayoutDashboard, Shield, Trophy, ArrowRight, Clock, CheckCircle2, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { apiRoutes, buildApiUrl } from '../utils/api';
import { GamificationSection } from './GamificationSection';

interface DashboardProps {
  accessToken: string;
  user: any;
  onNavigate: (page: 'dashboard' | 'assessment' | 'assessment-results' | 'catalog' | 'profile' | 'admin' | 'login') => void;
  onLogout: () => void;
}

export function Dashboard({ accessToken, user, onNavigate, onLogout }: DashboardProps) {
  const [profile, setProfile] = useState<any>(null);
  const [simulations, setSimulations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const token = accessToken || localStorage.getItem('naviq_access_token');
    if (!token) {
      // Redirect to login if not authenticated
      onNavigate('login');
      return;
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const loadData = async () => {
    const token = accessToken || localStorage.getItem('naviq_access_token');
    if (!token) {
      onNavigate('login');
      return;
    }

    try {
      // Load profile
      const profileRes = await fetch(
        buildApiUrl(apiRoutes.profile),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (profileRes.status === 401) {
        // Token is invalid, redirect to login
        localStorage.removeItem('naviq_access_token');
        localStorage.removeItem('naviq_user');
        onNavigate('login');
        return;
      }

      const profileData = await profileRes.json();
      setProfile(profileData.profile);

      // Load simulations
      const simsRes = await fetch(
        buildApiUrl(apiRoutes.simulations)
      );
      const simsData = await simsRes.json();
      const items = simsData.items || simsData.simulations || [];
      setSimulations(items);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sparkles className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  const completedCount = profile?.completedSimulations?.length || 0;
  const recommendedSimulations = simulations.filter(sim => 
    profile?.recommendedTracks?.includes(sim.track)
  ).slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl">NAVIQ</span>
            </div>

            <nav className="flex items-center gap-6">
              <button
                onClick={() => onNavigate('dashboard')}
                className="flex items-center gap-2 text-gray-700 hover:text-green-600"
              >
                <LayoutDashboard className="w-5 h-5" />
                Дашборд
              </button>
              <button
                onClick={() => onNavigate('catalog')}
                className="flex items-center gap-2 text-gray-700 hover:text-green-600"
              >
                <BookOpen className="w-5 h-5" />
                Симуляции
              </button>
              <button
                onClick={() => onNavigate('profile')}
                className="flex items-center gap-2 text-gray-700 hover:text-green-600"
              >
                <User className="w-5 h-5" />
                Профиль
              </button>
              {profile?.role === 'admin' && (
                <button
                  onClick={() => onNavigate('admin')}
                  className="flex items-center gap-2 text-gray-700 hover:text-green-600"
                >
                  <Shield className="w-5 h-5" />
                  Админ
                </button>
              )}
              <Button variant="ghost" onClick={onLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Выйти
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl mb-2">
            Привет, {profile?.name || 'пользователь'}! 👋
          </h1>
          <p className="text-gray-600">
        Добро пожаловать в твой персональный навигатор карьеры
      </p>
    </div>

    {/* Gamification Section */}
    <GamificationSection accessToken={accessToken} />

    {/* Assessment Results Shortcut */}
    {profile?.assessmentCompleted && (
            <Card className="p-0 mb-8 bg-gradient-to-br from-green-50 via-white to-green-50/30 border border-green-200 rounded-xl shadow-lg hover:shadow-xl transition-all overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                {/* Left side - Icon and text */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                        Результаты профориентации готовы
                      </h2>
                      <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-green-600 flex-shrink-0" />
                    </div>
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                      Посмотри подробные рекомендации и персональный план действий.
                    </p>
                  </div>
                </div>
                
                {/* Right side - Button */}
                <div className="flex-shrink-0">
                  <Button 
                    onClick={() => onNavigate('assessment-results')} 
                    size="lg"
                    className="w-full md:w-auto bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg transition-all px-6 py-6 md:py-3 text-base font-semibold rounded-lg"
                  >
                    Открыть результаты
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Decorative bottom border */}
            <div className="h-1 bg-gradient-to-r from-green-500 via-green-400 to-green-500"></div>
      </Card>
    )}



    {/* Assessment CTA */}
    {!profile?.assessmentCompleted && (
      <Card className="p-6 mb-8 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Пройди AI-профориентацию
                </h2>
                <p className="text-sm text-green-600 font-medium mt-1">
                  +30 очков
                </p>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              Ответь на 20 вопросов и получи персональные рекомендации от искусственного интеллекта
            </p>
            <Button
              onClick={() => onNavigate('assessment')}
              className="bg-green-500 hover:bg-green-600 text-white shadow-sm hover:shadow-md transition-all"
            >
              <Target className="w-4 h-4 mr-2" />
              Начать тест
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-green-500" />
            </div>
          </div>
        </div>
      </Card>
    )}

        {/* Recommended Simulations */}
        {profile?.assessmentCompleted && recommendedSimulations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Рекомендовано для тебя</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {recommendedSimulations.map((sim) => (
                <Card key={sim.id} className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="px-2 py-1 bg-gray-100 rounded-md text-xs font-medium text-gray-700">
                      {sim.difficulty}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{sim.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{sim.description}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-sm text-gray-500 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {sim.duration}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onNavigate('catalog')}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    >
                      Начать
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Исследуй симуляции</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Просмотри весь каталог карьерных симуляций и выбери интересующее направление
            </p>
            <Button
              onClick={() => onNavigate('catalog')}
              variant="outline"
              className="border-gray-200 hover:bg-green-50 hover:border-green-200 hover:text-green-700"
            >
              Открыть каталог
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Card>

          <Card className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Твой профиль</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Посмотри свои достижения, пройденные симуляции и сертификаты
            </p>
            <Button
              onClick={() => onNavigate('profile')}
              variant="outline"
              className="border-gray-200 hover:bg-green-50 hover:border-green-200 hover:text-green-700"
            >
              Открыть профиль
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
}
