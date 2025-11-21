import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import { Sparkles, Target, BookOpen, User, LogOut, LayoutDashboard, Shield, Trophy, ArrowRight, Clock, CheckCircle2, TrendingUp, Menu } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useIsMobile } from './ui/use-mobile';
import { apiRoutes, buildApiUrl } from '../utils/api';
import { GamificationSection } from './GamificationSection';
import { ConstellationIcon } from './constellation-icon';
import { translations, Language } from '../i18n/translations';

interface DashboardProps {
  accessToken: string;
  user: any;
  onNavigate: (page: 'dashboard' | 'assessment' | 'assessment-results' | 'catalog' | 'profile' | 'admin' | 'login') => void;
  onLogout: () => void;
}

const LanguageContext = createContext<{
  lang: Language;
  setLang: (lang: Language) => void;
  t: typeof translations['ru'];
}>({
  lang: 'ru',
  setLang: () => {},
  t: translations.ru,
});

const useTranslation = () => useContext(LanguageContext);

export function Dashboard({ accessToken, user, onNavigate, onLogout }: DashboardProps) {
  const [profile, setProfile] = useState<any>(null);
  const [simulations, setSimulations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lang, setLang] = useState<Language>('ru');
  const isMobile = useIsMobile();
  const t = translations[lang];

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

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

  const navItems = useMemo(() => {
    const items = [
      {
        key: 'dashboard',
        label: t.dashboard.dashboard,
        icon: LayoutDashboard,
        description: t.dashboard.dashboardDesc,
        action: () => onNavigate('dashboard'),
      },
      {
        key: 'catalog',
        label: t.dashboard.simulations,
        icon: BookOpen,
        description: t.dashboard.simulationsDesc,
        action: () => onNavigate('catalog'),
      },
      {
        key: 'profile',
        label: t.dashboard.profile,
        icon: User,
        description: t.dashboard.profileDesc,
        action: () => onNavigate('profile'),
      },
    ];

    if (profile?.role === 'admin') {
      items.push({
        key: 'admin',
        label: t.dashboard.admin,
        icon: Shield,
        description: t.dashboard.adminDesc,
        action: () => onNavigate('admin'),
      });
    }
    return items;
  }, [profile?.role, onNavigate, t]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB]">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#7B61FF]/10 to-[#5B9FFF]/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sparkles className="w-8 h-8 text-[#7B61FF]" />
          </div>
          <p className="text-gray-600">{t.dashboard.loading}</p>
        </div>
      </div>
    );
  }

  const completedCount = profile?.completedSimulations?.length || 0;
  const recommendedSimulations = simulations.filter(sim => 
    profile?.recommendedTracks?.includes(sim.track)
  ).slice(0, 3);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      <div className="min-h-screen text-[#1A2238] bg-[#F8F9FB]">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-[#7B61FF] to-[#5B9FFF] rounded-2xl flex items-center justify-center">
                  <ConstellationIcon type="brain" className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl text-[#1A2238]" style={{ fontWeight: 700, letterSpacing: '-0.01em' }}>Naviq</span>
              </div>

            {/* Desktop Navigation - visible on desktop */}
            {!isMobile && (
              <nav className="flex items-center gap-4">
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="flex items-center gap-2 text-[#1A2238]/70 hover:text-[#7B61FF] transition-colors font-medium"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  {t.dashboard.dashboard}
                </button>
                <button
                  onClick={() => onNavigate('catalog')}
                  className="flex items-center gap-2 text-[#1A2238]/70 hover:text-[#7B61FF] transition-colors font-medium"
                >
                  <BookOpen className="w-5 h-5" />
                  {t.dashboard.simulations}
                </button>
                <button
                  onClick={() => onNavigate('profile')}
                  className="flex items-center gap-2 text-[#1A2238]/70 hover:text-[#7B61FF] transition-colors font-medium"
                >
                  <User className="w-5 h-5" />
                  {t.dashboard.profile}
                </button>
                {profile?.role === 'admin' && (
                  <button
                    onClick={() => onNavigate('admin')}
                    className="flex items-center gap-2 text-[#1A2238]/70 hover:text-[#7B61FF] transition-colors font-medium"
                  >
                    <Shield className="w-5 h-5" />
                    {t.dashboard.admin}
                  </button>
                )}

                {/* Language Switcher */}
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 ml-2">
                  {[
                    { code: 'ru' as Language, label: 'РУ' },
                    { code: 'uz' as Language, label: 'UZ' },
                    { code: 'en' as Language, label: 'EN' },
                  ].map((language) => (
                    <button
                      key={language.code}
                      onClick={() => setLang(language.code)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                        lang === language.code
                          ? 'bg-[#7B61FF] text-white'
                          : 'text-gray-600 hover:text-[#7B61FF]'
                      }`}
                    >
                      {language.label}
                    </button>
                  ))}
                </div>

                <Button
                  variant="ghost"
                  onClick={onLogout}
                  className="text-[#1A2238]/70 hover:text-[#7B61FF] hover:bg-[#7B61FF]/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {t.dashboard.logout}
                </Button>
              </nav>
            )}

            {/* Mobile Burger Menu - visible only on mobile */}
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-900 hover:bg-gray-100"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                aria-label="Toggle menu"
              >
                <Menu className="w-6 h-6 text-gray-900" />
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute top-0 bottom-0 right-0 w-[78vw] max-w-sm bg-white shadow-2xl rounded-l-3xl border-l border-gray-100 transition-all duration-300 ease-out flex flex-col" style={{ right: "0" }}>
            <div className="px-6 py-6 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-[#7B61FF] to-[#5B9FFF] rounded-xl flex items-center justify-center">
                  <ConstellationIcon type="brain" className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t.dashboard.signedInAs}</p>
                  <p className="text-base font-semibold text-gray-900 truncate max-w-[150px]">
                    {profile?.name || 'Student'}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
                <Menu className="w-5 h-5 rotate-90 text-gray-500" />
              </Button>
            </div>
            <nav className="px-4 py-6 space-y-3 flex-1 overflow-y-auto">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    item.action();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-4 rounded-2xl border border-gray-100 bg-white px-4 py-4 text-left shadow-sm hover:border-[#7B61FF]/30 hover:bg-[#7B61FF]/5 hover:text-[#7B61FF] transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7B61FF]/10 to-[#5B9FFF]/10 text-[#7B61FF] flex items-center justify-center">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                  <ArrowRight className="ml-auto w-4 h-4 text-gray-400" />
                </button>
              ))}
              <div className="pt-4 mt-6 border-t border-gray-100">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-500 hover:bg-red-50"
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {t.dashboard.logout}
                </Button>
              </div>
            </nav>
          </div>
        </div>
      )}

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl mb-2 text-[#1A2238]" style={{ fontWeight: 700 }}>
              {t.dashboard.hello}, {profile?.name || 'user'}! 👋
            </h1>
            <p className="text-[#1A2238]/70">
              {t.dashboard.welcome}
            </p>
          </div>

    {/* Gamification Section */}
    <GamificationSection accessToken={accessToken} />

          {/* Assessment Results Shortcut */}
          {profile?.assessmentCompleted && (
            <Card className="p-0 mb-8 bg-gradient-to-br from-[#7B61FF]/10 via-white to-[#5B9FFF]/10 border border-[#7B61FF]/20 rounded-xl shadow-lg hover:shadow-xl transition-all overflow-hidden">
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  {/* Left side - Icon and text */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#7B61FF] to-[#5B9FFF] rounded-2xl flex items-center justify-center shadow-lg shadow-[#7B61FF]/30">
                        <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-xl md:text-2xl font-bold text-[#1A2238]">
                          {t.dashboard.assessmentReady}
                        </h2>
                        <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-[#7B61FF] flex-shrink-0" />
                      </div>
                      <p className="text-[#1A2238]/70 text-sm md:text-base leading-relaxed">
                        {t.dashboard.assessmentReadyDesc}
                      </p>
                    </div>
                  </div>

                  {/* Right side - Button */}
                  <div className="flex-shrink-0">
                    <Button
                      onClick={() => onNavigate('assessment-results')}
                      size="lg"
                      className="w-full md:w-auto bg-gradient-to-r from-[#7B61FF] to-[#5B9FFF] hover:opacity-90 text-white shadow-md hover:shadow-lg transition-all px-6 py-6 md:py-3 text-base font-semibold rounded-lg"
                    >
                      {t.dashboard.viewResults}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Decorative bottom border */}
              <div className="h-1 bg-gradient-to-r from-[#7B61FF] via-[#5B9FFF] to-[#00E5A0]"></div>
            </Card>
          )}



          {/* Assessment CTA */}
          {!profile?.assessmentCompleted && (
            <Card className="p-6 mb-8 bg-white border-2 border-[#7B61FF]/20 rounded-xl shadow-lg hover:shadow-xl hover:border-[#7B61FF]/40 transition-all">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#7B61FF]/10 to-[#5B9FFF]/10 rounded-xl flex items-center justify-center">
                      <Target className="w-6 h-6 text-[#7B61FF]" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-[#1A2238]">
                        {t.dashboard.takeAssessment}
                      </h2>
                      <p className="text-sm text-[#7B61FF] font-medium mt-1">
                        {t.dashboard.assessmentPoints}
                      </p>
                    </div>
                  </div>
                  <p className="text-[#1A2238]/70 mb-4">
                    {t.dashboard.assessmentDesc}
                  </p>
                  <Button
                    onClick={() => onNavigate('assessment')}
                    className="bg-gradient-to-r from-[#7B61FF] to-[#5B9FFF] hover:opacity-90 text-white shadow-md hover:shadow-lg transition-all"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    {t.dashboard.startTest}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
                <div className="hidden md:block">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#7B61FF]/10 to-[#5B9FFF]/10 rounded-full flex items-center justify-center">
                    <Sparkles className="w-12 h-12 text-[#7B61FF]" />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Recommended Simulations */}
          {profile?.assessmentCompleted && recommendedSimulations.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-[#1A2238] mb-4">{t.dashboard.recommendedForYou}</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {recommendedSimulations.map((sim) => (
                  <Card key={sim.id} className="p-6 bg-white border-2 border-gray-100 rounded-xl shadow-sm hover:shadow-lg hover:border-[#7B61FF]/30 transition-all">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#7B61FF]/10 to-[#5B9FFF]/10 rounded-xl flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-[#7B61FF]" />
                      </div>
                      <span className="px-2 py-1 bg-gray-100 rounded-md text-xs font-medium text-gray-700">
                        {sim.difficulty}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-[#1A2238] mb-2">{sim.title}</h3>
                    <p className="text-[#1A2238]/70 text-sm mb-4 line-clamp-2">{sim.description}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-sm text-[#1A2238]/60 flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {sim.duration}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onNavigate('catalog')}
                        className="text-[#7B61FF] hover:text-[#5B9FFF] hover:bg-[#7B61FF]/10"
                      >
                        {t.dashboard.start}
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
            <Card className="p-6 bg-white border-2 border-gray-100 rounded-xl shadow-sm hover:shadow-lg hover:border-[#7B61FF]/30 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#7B61FF]/10 to-[#5B9FFF]/10 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-[#7B61FF]" />
                </div>
                <h3 className="text-xl font-semibold text-[#1A2238]">{t.dashboard.exploreSimulations}</h3>
              </div>
              <p className="text-[#1A2238]/70 mb-4">
                {t.dashboard.exploreSimulationsDesc}
              </p>
              <Button
                onClick={() => onNavigate('catalog')}
                variant="outline"
                className="border-2 border-gray-200 hover:bg-[#7B61FF]/5 hover:border-[#7B61FF]/40 hover:text-[#7B61FF]"
              >
                {t.dashboard.openCatalog}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Card>

            <Card className="p-6 bg-white border-2 border-gray-100 rounded-xl shadow-sm hover:shadow-lg hover:border-[#7B61FF]/30 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#7B61FF]/10 to-[#5B9FFF]/10 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-[#7B61FF]" />
                </div>
                <h3 className="text-xl font-semibold text-[#1A2238]">{t.dashboard.yourProfile}</h3>
              </div>
              <p className="text-[#1A2238]/70 mb-4">
                {t.dashboard.yourProfileDesc}
              </p>
              <Button
                onClick={() => onNavigate('profile')}
                variant="outline"
                className="border-2 border-gray-200 hover:bg-[#7B61FF]/5 hover:border-[#7B61FF]/40 hover:text-[#7B61FF]"
              >
                {t.dashboard.openProfile}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Card>
          </div>
        </main>
      </div>
    </LanguageContext.Provider>
  );
}
