import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, Target, BookOpen, User, LogOut, LayoutDashboard, Shield, Trophy, ArrowRight, Clock, CheckCircle2, TrendingUp, Menu } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useIsMobile } from './ui/use-mobile';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

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
        label: 'Dashboard',
        icon: LayoutDashboard,
        description: 'Main overview',
        action: () => onNavigate('dashboard'),
      },
      {
        key: 'catalog',
        label: 'Simulations',
        icon: BookOpen,
        description: 'Simulation catalog',
        action: () => onNavigate('catalog'),
      },
      {
        key: 'profile',
        label: 'Profile',
        icon: User,
        description: 'Achievements and progress',
        action: () => onNavigate('profile'),
      },
    ];

    if (profile?.role === 'admin') {
      items.push({
        key: 'admin',
        label: 'Admin',
        icon: Shield,
        description: 'Admin dashboard',
        action: () => onNavigate('admin'),
      });
    }
    return items;
  }, [profile?.role, onNavigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sparkles className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-gray-600">Loading...</p>
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

            {/* Desktop Navigation - visible on desktop */}
            {!isMobile && (
              <nav className="flex items-center gap-6">
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="flex items-center gap-2 text-gray-700 hover:text-green-600 transition-colors"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Dashboard
                </button>
                <button
                  onClick={() => onNavigate('catalog')}
                  className="flex items-center gap-2 text-gray-700 hover:text-green-600 transition-colors"
                >
                  <BookOpen className="w-5 h-5" />
                  Simulations
                </button>
                <button
                  onClick={() => onNavigate('profile')}
                  className="flex items-center gap-2 text-gray-700 hover:text-green-600 transition-colors"
                >
                  <User className="w-5 h-5" />
                  Profile
                </button>
                {profile?.role === 'admin' && (
                  <button
                    onClick={() => onNavigate('admin')}
                    className="flex items-center gap-2 text-gray-700 hover:text-green-600 transition-colors"
                  >
                    <Shield className="w-5 h-5" />
                    Admin
                  </button>
                )}
                <Button variant="ghost" onClick={onLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
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
                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white font-bold">
                  NQ
                </div>
                <div>
                  <p className="text-sm text-gray-500">Signed in as</p>
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
                  className="w-full flex items-center gap-4 rounded-2xl border border-gray-100 bg-white px-4 py-4 text-left shadow-sm hover:border-green-200 hover:bg-green-50 hover:text-green-700 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
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
                  Logout
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
          <h1 className="text-3xl mb-2">
            Hello, {profile?.name || 'user'}! 👋
          </h1>
          <p className="text-gray-600">
        Welcome to your personal career navigator
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
                        Career Assessment Results Ready
                      </h2>
                      <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-green-600 flex-shrink-0" />
                    </div>
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                      View detailed recommendations and your personal action plan.
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
                    View Results
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
                  Take AI Career Assessment
                </h2>
                <p className="text-sm text-green-600 font-medium mt-1">
                  +30 points
                </p>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              Answer 20 questions and get personalized recommendations from artificial intelligence
            </p>
            <Button
              onClick={() => onNavigate('assessment')}
              className="bg-green-500 hover:bg-green-600 text-white shadow-sm hover:shadow-md transition-all"
            >
              <Target className="w-4 h-4 mr-2" />
              Start Test
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
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Recommended for You</h2>
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
                      Start
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
              <h3 className="text-xl font-semibold text-gray-900">Explore Simulations</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Browse the entire catalog of career simulations and choose your area of interest
            </p>
            <Button
              onClick={() => onNavigate('catalog')}
              variant="outline"
              className="border-gray-200 hover:bg-green-50 hover:border-green-200 hover:text-green-700"
            >
              Open Catalog
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Card>

          <Card className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Your Profile</h3>
            </div>
            <p className="text-gray-600 mb-4">
              View your achievements, completed simulations, and certificates
            </p>
            <Button
              onClick={() => onNavigate('profile')}
              variant="outline"
              className="border-gray-200 hover:bg-green-50 hover:border-green-200 hover:text-green-700"
            >
              Open Profile
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
}
