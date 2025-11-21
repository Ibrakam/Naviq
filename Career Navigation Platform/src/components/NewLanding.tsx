import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowRight, ChevronRight, Check, Sparkles, Star, TrendingUp, Users, Award, Zap, Target, Rocket, Brain, Play, Trophy, Code, Palette, TrendingUp as Marketing, DollarSign, UserCheck, Briefcase, Globe } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { ConstellationIcon } from './constellation-icon';
import { AnimatedBackground } from './animated-background';
import { CounterAnimation } from './counter-animation';
import { translations, Language } from '../i18n/translations';

interface NewLandingProps {
  onLogin: () => void;
  onSignup: () => void;
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

export function NewLanding({ onLogin, onSignup }: NewLandingProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [lang, setLang] = useState<Language>('ru');
  const { scrollYProgress } = useScroll();

  const t = translations[lang];

  useEffect(() => {
    return scrollYProgress.onChange((latest) => {
      setScrollProgress(latest);
    });
  }, [scrollYProgress]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      <div className="min-h-screen bg-[#F8F9FB] overflow-x-hidden">
        {/* Navigation */}
        <Navigation scrollProgress={scrollProgress} onLogin={onLogin} onSignup={onSignup} />

        {/* Hero Section */}
        <HeroSection onSignup={onSignup} />

        {/* Value Proposition */}
        <ValueProposition />

        {/* How It Works */}
        <HowItWorks />

        {/* Career Tracks */}
        <CareerTracks />

        {/* Job Simulations */}
        <JobSimulations />

        {/* Social Proof */}
        <SocialProof />

        {/* Final CTA */}
        <FinalCTA onSignup={onSignup} />

        {/* Footer */}
        <Footer />
      </div>
    </LanguageContext.Provider>
  );
}

function Navigation({ scrollProgress, onLogin, onSignup }: { scrollProgress: number; onLogin: () => void; onSignup: () => void }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const { lang, setLang, t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const languages: { code: Language; label: string }[] = [
    { code: 'ru', label: 'РУ' },
    { code: 'uz', label: 'UZ' },
    { code: 'en', label: 'EN' },
  ];

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/80 backdrop-blur-xl shadow-lg shadow-black/5' : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#7B61FF] to-[#5B9FFF] rounded-2xl flex items-center justify-center">
              <ConstellationIcon type="brain" className="w-5 h-5 text-white" />
            </div>
            <span className="text-[#1A2238] tracking-tight" style={{ fontSize: '20px', fontWeight: 700 }}>Naviq</span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#platform" className="text-[#1A2238] hover:text-[#7B61FF] transition-colors">{t.nav.platform}</a>
            <a href="#careers" className="text-[#1A2238] hover:text-[#7B61FF] transition-colors">{t.nav.careers}</a>
            <a href="#simulations" className="text-[#1A2238] hover:text-[#7B61FF] transition-colors">{t.nav.simulations}</a>
            <a href="#about" className="text-[#1A2238] hover:text-[#7B61FF] transition-colors">{t.nav.about}</a>
          </nav>

          {/* CTA Buttons + Language Switcher */}
          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              {languages.map((language) => (
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

            <Button variant="ghost" className="hidden md:inline-flex" onClick={onLogin}>{t.nav.login}</Button>
            <Button className="bg-gradient-to-r from-[#7B61FF] to-[#5B9FFF] text-white hover:opacity-90 transition-opacity shadow-lg shadow-[#7B61FF]/30" onClick={onSignup}>
              {t.nav.startTest}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-200">
        <div
          className="h-full bg-gradient-to-r from-[#7B61FF] to-[#5B9FFF]"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>
    </motion.header>
  );
}

function HeroSection({ onSignup }: { onSignup: () => void }) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const { t } = useTranslation();

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-96 h-96 bg-[#7B61FF]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#00E5A0]/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-16 items-center">
          {/* Left Side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Badge className="bg-[#7B61FF]/10 text-[#7B61FF] border-[#7B61FF]/20 px-4 py-2 rounded-full">
                <Sparkles className="w-4 h-4 mr-2" />
                {t.hero.badge}
              </Badge>
            </motion.div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-[#1A2238] leading-tight" style={{ fontSize: '72px', fontWeight: 800, letterSpacing: '-0.02em' }}>
                {t.hero.headline}
              </h1>
              <p className="text-[#1A2238]/70 max-w-xl" style={{ fontSize: '20px', lineHeight: '1.6' }}>
                {t.hero.description}
              </p>
            </div>

            {/* CTA Row */}
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-gradient-to-r from-[#7B61FF] to-[#5B9FFF] text-white hover:opacity-90 transition-all shadow-xl shadow-[#7B61FF]/30 hover:shadow-2xl hover:shadow-[#7B61FF]/40 hover:scale-105" onClick={onSignup}>
                {t.hero.startCareerTest}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-[#1A2238]/20 hover:border-[#7B61FF] hover:text-[#7B61FF] transition-all">
                {t.hero.howItWorks}
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            {/* Trust Row */}
            <div className="pt-8 space-y-4">
              <p className="text-[#1A2238]/60">{t.hero.usedIn}</p>
              <div className="flex flex-wrap gap-8 items-center opacity-60">
                {['TUIT', 'WIUT', 'Inha', 'Westminster', 'MDIS'].map((uni) => (
                  <div key={uni} className="px-4 py-2 bg-[#1A2238]/5 rounded-2xl">
                    {uni}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Side - 3D Dashboard Mockup */}
          <motion.div
            style={{ y }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <DashboardMockup t={t} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function DashboardMockup({ t }: { t: typeof translations['ru'] }) {
  return (
    <div className="relative">
      {/* Main Dashboard Card */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[#1A2238]" style={{ fontSize: '18px', fontWeight: 600 }}>{t.hero.aiAnalysis}</h3>
            <p className="text-[#1A2238]/60" style={{ fontSize: '14px' }}>{t.hero.processing}</p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-[#7B61FF] to-[#5B9FFF] rounded-full flex items-center justify-center animate-pulse">
            <Brain className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Radar Chart Placeholder */}
        <div className="relative h-48 flex items-center justify-center">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {/* Pentagon background */}
            <polygon
              points="100,20 190,76 162,164 38,164 10,76"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="1"
            />
            <polygon
              points="100,50 160,86 144,144 56,144 40,86"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="1"
            />

            {/* Data polygon with animation */}
            <motion.polygon
              points="100,30 175,80 155,150 45,150 25,80"
              fill="url(#radarGradient)"
              stroke="#7B61FF"
              strokeWidth="2"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.6 }}
              transition={{ duration: 1, delay: 0.5 }}
            />

            {/* Points */}
            {[
              { x: 100, y: 30, label: 'Аналитика' },
              { x: 175, y: 80, label: 'Креативность' },
              { x: 155, y: 150, label: 'Коммуникация' },
              { x: 45, y: 150, label: 'Лидерство' },
              { x: 25, y: 80, label: 'Технические' },
            ].map((point, i) => (
              <motion.g key={i}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill="#7B61FF"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                />
              </motion.g>
            ))}

            <defs>
              <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7B61FF" />
                <stop offset="100%" stopColor="#5B9FFF" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Career Matches */}
        <div className="space-y-3">
          {[
            { title: 'Data Science', match: 92, color: '#7B61FF' },
            { title: 'Product Management', match: 87, color: '#5B9FFF' },
            { title: 'UX Design', match: 84, color: '#00E5A0' },
          ].map((career, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 + i * 0.15 }}
              className="flex items-center justify-between p-3 bg-gradient-to-r from-white to-gray-50 rounded-lg border border-gray-100"
            >
              <span className="text-[#1A2238]" style={{ fontSize: '14px', fontWeight: 500 }}>{career.title}</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: career.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${career.match}%` }}
                    transition={{ delay: 1.2 + i * 0.15, duration: 0.8 }}
                  />
                </div>
                <span className="text-[#1A2238]" style={{ fontSize: '14px', fontWeight: 600 }}>{career.match}%</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Floating Cards */}
      <motion.div
        className="absolute -top-4 -right-4 bg-white rounded-xl shadow-xl p-4 border border-gray-100"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#00E5A0] to-[#00B880] rounded-lg flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <p style={{ fontSize: '12px' }} className="text-[#1A2238]/60">{t.hero.potential}</p>
            <p style={{ fontSize: '16px', fontWeight: 600 }} className="text-[#1A2238]">{t.hero.high}</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-xl p-4 border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.7 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#7B61FF] to-[#5B9FFF] rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p style={{ fontSize: '12px' }} className="text-[#1A2238]/60">{t.hero.strength}</p>
            <p style={{ fontSize: '14px', fontWeight: 600 }} className="text-[#1A2238]">{t.hero.analytics}</p>
          </div>
        </div>
      </motion.div>

      {/* Background glow */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#7B61FF]/20 to-[#5B9FFF]/20 rounded-2xl blur-3xl scale-110" />
    </div>
  );
}

function ValueProposition() {
  const { t } = useTranslation();

  const cards = [
    {
      number: '01',
      icon: 'brain' as const,
      title: t.value.card1Title,
      description: t.value.card1Desc,
    },
    {
      number: '02',
      icon: 'play' as const,
      title: t.value.card2Title,
      description: t.value.card2Desc,
    },
    {
      number: '03',
      icon: 'trophy' as const,
      title: t.value.card3Title,
      description: t.value.card3Desc,
    },
  ];

  return (
    <section className="py-24 relative" id="platform">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-[#1A2238] mb-4" style={{ fontSize: '48px', fontWeight: 800, letterSpacing: '-0.015em' }}>
            {t.value.title}
          </h2>
          <p className="text-[#1A2238]/70 max-w-2xl mx-auto" style={{ fontSize: '18px', lineHeight: '1.6' }}>
            {t.value.subtitle}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {cards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
            >
              <Card className="p-8 h-full bg-white border-2 border-transparent hover:border-[#7B61FF]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#7B61FF]/10 hover:-translate-y-2 relative overflow-hidden group">
                {/* Gradient Border Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#7B61FF]/20 to-[#5B9FFF]/20 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />

                <div className="space-y-6">
                  {/* Icon & Number */}
                  <div className="flex items-start justify-between">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#7B61FF]/10 to-[#5B9FFF]/10 rounded-xl flex items-center justify-center">
                      <ConstellationIcon type={card.icon} className="w-8 h-8 text-[#7B61FF]" />
                    </div>
                    <span className="text-[#7B61FF]/20 group-hover:text-[#7B61FF]/40 transition-colors" style={{ fontSize: '48px', fontWeight: 800 }}>
                      {card.number}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <h3 className="text-[#1A2238]" style={{ fontSize: '24px', fontWeight: 700 }}>
                      {card.title}
                    </h3>
                    <p className="text-[#1A2238]/70" style={{ fontSize: '16px', lineHeight: '1.6' }}>
                      {card.description}
                    </p>
                  </div>

                  {/* Micro Visual */}
                  <div className="pt-4 opacity-50 group-hover:opacity-100 transition-opacity">
                    {i === 0 && <div className="flex gap-1">{[60, 80, 90, 70, 85].map((h, j) => (
                      <div key={j} className="flex-1 bg-gradient-to-t from-[#7B61FF] to-[#5B9FFF] rounded" style={{ height: `${h}px` }} />
                    ))}</div>}
                    {i === 1 && <div className="flex gap-2">{[1, 2, 3].map((_, j) => (
                      <div key={j} className="flex-1 h-16 bg-gradient-to-br from-[#7B61FF]/20 to-[#5B9FFF]/20 rounded-lg border border-[#7B61FF]/30" />
                    ))}</div>}
                    {i === 2 && <div className="space-y-2">{[1, 2, 3].map((_, j) => (
                      <div key={j} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${j === 0 ? 'bg-[#00E5A0]' : 'bg-gray-200'}`} />
                        <div className="flex-1 h-2 bg-gray-100 rounded-full" />
                      </div>
                    ))}</div>}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const { t } = useTranslation();

  const steps = [
    {
      number: 1,
      icon: Target,
      title: t.howItWorks.step1Title,
      description: t.howItWorks.step1Desc,
    },
    {
      number: 2,
      icon: TrendingUp,
      title: t.howItWorks.step2Title,
      description: t.howItWorks.step2Desc,
    },
    {
      number: 3,
      icon: Play,
      title: t.howItWorks.step3Title,
      description: t.howItWorks.step3Desc,
    },
    {
      number: 4,
      icon: Award,
      title: t.howItWorks.step4Title,
      description: t.howItWorks.step4Desc,
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-white to-[#F8F9FB]">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-[#1A2238] mb-4" style={{ fontSize: '48px', fontWeight: 800, letterSpacing: '-0.015em' }}>
            {t.howItWorks.title}
          </h2>
          <p className="text-[#1A2238]/70 max-w-2xl mx-auto" style={{ fontSize: '18px', lineHeight: '1.6' }}>
            {t.howItWorks.subtitle}
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-[#7B61FF] via-[#5B9FFF] to-[#00E5A0] opacity-30 -translate-y-1/2" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative"
              >
                <Card className="p-6 bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-[#7B61FF]/20">
                  {/* Number Badge */}
                  <div className="w-16 h-16 bg-gradient-to-br from-[#7B61FF] to-[#5B9FFF] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#7B61FF]/30">
                    <span className="text-white" style={{ fontSize: '24px', fontWeight: 700 }}>{step.number}</span>
                  </div>

                  {/* Icon */}
                  <div className="w-12 h-12 bg-[#7B61FF]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-6 h-6 text-[#7B61FF]" />
                  </div>

                  {/* Content */}
                  <div className="text-center space-y-2">
                    <h3 className="text-[#1A2238]" style={{ fontSize: '20px', fontWeight: 700 }}>
                      {step.title}
                    </h3>
                    <p className="text-[#1A2238]/70" style={{ fontSize: '14px', lineHeight: '1.6' }}>
                      {step.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CareerTracks() {
  const { t } = useTranslation();

  const careers = [
    { icon: 'data' as const, title: t.careers.dataScience, simulations: 250, duration: '8', large: true },
    { icon: 'consulting' as const, title: t.careers.productManagement, simulations: 180, duration: '6' },
    { icon: 'design' as const, title: t.careers.uxDesign, simulations: 220, duration: '7' },
    { icon: 'marketing' as const, title: t.careers.digitalMarketing, simulations: 190, duration: '5' },
    { icon: 'code' as const, title: t.careers.frontendDev, simulations: 300, duration: '9', large: true },
    { icon: 'finance' as const, title: t.careers.financialAnalysis, simulations: 150, duration: '6' },
    { icon: 'hr' as const, title: t.careers.hrRecruitment, simulations: 120, duration: '4' },
    { icon: 'consulting' as const, title: t.careers.consulting, simulations: 140, duration: '5' },
  ];

  return (
    <section id="careers" className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-[#1A2238] mb-4" style={{ fontSize: '48px', fontWeight: 800, letterSpacing: '-0.015em' }}>
            {t.careers.title}
          </h2>
          <p className="text-[#1A2238]/70 max-w-2xl mx-auto" style={{ fontSize: '18px', lineHeight: '1.6' }}>
            {t.careers.subtitle}
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {careers.map((career, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className={career.large ? 'md:col-span-2' : ''}
            >
              <Card className="p-6 h-full bg-gradient-to-br from-white to-gray-50 border-2 border-transparent hover:border-[#7B61FF]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#7B61FF]/10 hover:-translate-y-1 group cursor-pointer">
                <div className="flex flex-col h-full justify-between space-y-4">
                  <div className="space-y-4">
                    {/* Icon */}
                    <div className="w-14 h-14 bg-gradient-to-br from-[#7B61FF]/10 to-[#5B9FFF]/10 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ConstellationIcon type={career.icon} className="w-7 h-7 text-[#7B61FF]" />
                    </div>

                    {/* Title */}
                    <h3 className="text-[#1A2238]" style={{ fontSize: '20px', fontWeight: 700 }}>
                      {career.title}
                    </h3>
                  </div>

                  {/* Stats */}
                  <div className="space-y-2 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-[#1A2238]/70" style={{ fontSize: '14px' }}>
                      <span>{career.simulations}+ {t.careers.simulations}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[#1A2238]/70" style={{ fontSize: '14px' }}>
                      <span>⏱</span>
                      <span>{t.careers.averageTime}: {career.duration} {t.careers.months}</span>
                    </div>
                  </div>

                  {/* Hover State Indicator */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="text-[#7B61FF] flex items-center gap-2" style={{ fontSize: '14px', fontWeight: 600 }}>
                      {t.careers.startLearning}
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function JobSimulations() {
  const { t } = useTranslation();

  const simulations = [
    {
      titleKey: 'sim1Title',
      difficultyKey: 'intermediate',
      duration: '45',
      category: 'Product Design',
      xp: 50,
      color: '#7B61FF',
    },
    {
      titleKey: 'sim2Title',
      difficultyKey: 'advanced',
      duration: '60',
      category: 'Data Science',
      xp: 75,
      color: '#5B9FFF',
    },
    {
      titleKey: 'sim3Title',
      difficultyKey: 'beginner',
      duration: '30',
      category: 'Frontend Development',
      xp: 35,
      color: '#00E5A0',
    },
  ];

  return (
    <section id="simulations" className="py-24 bg-gradient-to-b from-[#F8F9FB] to-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-[#1A2238] mb-4" style={{ fontSize: '48px', fontWeight: 800, letterSpacing: '-0.015em' }}>
            {t.simulations.title}
          </h2>
          <p className="text-[#1A2238]/70 max-w-2xl mx-auto" style={{ fontSize: '18px', lineHeight: '1.6' }}>
            {t.simulations.subtitle}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {simulations.map((sim, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              <Card className="overflow-hidden bg-white/60 backdrop-blur-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group">
                {/* Preview Image */}
                <div className="h-48 bg-gradient-to-br from-[#7B61FF]/20 to-[#5B9FFF]/20 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-white/80 backdrop-blur rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-10 h-10 text-[#7B61FF]" />
                    </div>
                  </div>
                  <Badge className="absolute top-4 right-4 bg-white/90 backdrop-blur text-[#1A2238]">
                    {t.simulations.difficulty[sim.difficultyKey as keyof typeof t.simulations.difficulty]}
                  </Badge>
                </div>

                <div className="p-6 space-y-4">
                  {/* Title */}
                  <h3 className="text-[#1A2238]" style={{ fontSize: '18px', fontWeight: 700 }}>
                    {t.simulations[sim.titleKey as keyof typeof t.simulations]}
                  </h3>

                  {/* Meta */}
                  <div className="flex flex-wrap gap-4 text-[#1A2238]/70" style={{ fontSize: '14px' }}>
                    <span>{sim.duration} {t.simulations.minutes}</span>
                    <span>•</span>
                    <span>{sim.category}</span>
                    <span>•</span>
                    <span className="text-[#00E5A0]">🏆 +{sim.xp} XP</span>
                  </div>

                  {/* CTA */}
                  <Button className="w-full bg-gradient-to-r from-[#7B61FF] to-[#5B9FFF] text-white hover:opacity-90">
                    {t.simulations.startSimulation}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SocialProof() {
  const { t } = useTranslation();

  const testimonials = [
    {
      author: 'Азиза Рахимова',
      university: 'TUIT',
      role: 'Junior Product Manager',
      photo: 'https://images.unsplash.com/photo-1613483661929-03d7dd71b693?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB5b3VuZyUyMHBlcnNvbnxlbnwxfHx8fDE3NjM1NjQxMjZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      author: 'Даврон Каримов',
      university: 'WIUT',
      role: 'Data Analyst',
      photo: 'https://images.unsplash.com/photo-1752650734567-fca336c8b77a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB3b3Jrc3BhY2UlMjBjYXJlZXJ8ZW58MXx8fHwxNzYzNTY0MTI1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
  ];

  const metrics = [
    { number: 12000, suffix: '+', labelKey: 'students' },
    { number: 15, suffix: '+', labelKey: 'universities' },
    { number: 5000, suffix: '+', labelKey: 'certificates' },
    { number: 87, suffix: '%', labelKey: 'foundJob' },
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-[#1A2238] to-[#2A3F5F] text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <AnimatedBackground />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Left - Testimonials */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="mb-8" style={{ fontSize: '48px', fontWeight: 800, letterSpacing: '-0.015em' }}>
                {t.social.successStories}
              </h2>
            </motion.div>

            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
              >
                <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
                  <div className="space-y-4">
                    <p className="text-white/90" style={{ fontSize: '18px', lineHeight: '1.6' }}>
                      "{i === 0 ? t.social.testimonial1 : t.social.testimonial2}"
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7B61FF] to-[#5B9FFF] p-0.5">
                        <div className="w-full h-full rounded-full overflow-hidden">
                          <img src={testimonial.photo} alt={testimonial.author} className="w-full h-full object-cover" />
                        </div>
                      </div>
                      <div>
                        <p style={{ fontSize: '16px', fontWeight: 600 }}>{testimonial.author}</p>
                        <p className="text-white/70" style={{ fontSize: '14px' }}>
                          {testimonial.university} • {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Right - Metrics */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="mb-8" style={{ fontSize: '48px', fontWeight: 800, letterSpacing: '-0.015em' }}>
                {t.social.inNumbers}
              </h2>
            </motion.div>

            <div className="grid grid-cols-2 gap-6">
              {metrics.map((metric, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/15 transition-all">
                    <div className="space-y-2">
                      <div style={{ fontSize: '48px', fontWeight: 800 }} className="text-[#00E5A0]">
                        <CounterAnimation end={metric.number} suffix={metric.suffix} />
                      </div>
                      <p className="text-white/80" style={{ fontSize: '14px' }}>
                        {t.social[metric.labelKey as keyof typeof t.social]}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCTA({ onSignup }: { onSignup: () => void }) {
  const { t } = useTranslation();

  return (
    <section className="py-24 relative overflow-hidden" id="about">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1A2238] via-[#2A3F5F] to-[#7B61FF]" />

      {/* Animated constellation overlay */}
      <div className="absolute inset-0 opacity-20">
        <AnimatedBackground />
      </div>

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <h2 className="text-white" style={{ fontSize: '56px', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: '1.1' }}>
            {t.cta.title}
          </h2>

          <p className="text-white/80 max-w-2xl mx-auto" style={{ fontSize: '20px', lineHeight: '1.6' }}>
            {t.cta.subtitle}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Button
              size="lg"
              className="bg-white text-[#1A2238] hover:bg-gray-100 shadow-2xl shadow-white/20 hover:scale-105 transition-transform"
              onClick={onSignup}
            >
              {t.cta.startTest}
              <Rocket className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10"
            >
              {t.cta.bookDemo}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap gap-8 justify-center pt-8 text-white/60" style={{ fontSize: '14px' }}>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span>{t.cta.securePayment}</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span>{t.cta.gdprCompliant}</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span>{t.cta.moneyBack}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  const { t } = useTranslation();

  const footerSections = [
    {
      title: t.footer.product,
      links: t.footer.productLinks,
    },
    {
      title: t.footer.resources,
      links: t.footer.resourcesLinks,
    },
    {
      title: t.footer.company,
      links: t.footer.companyLinks,
    },
  ];

  return (
    <footer className="bg-[#1A2238] text-white pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Top gradient border */}
        <div className="h-1 bg-gradient-to-r from-[#7B61FF] via-[#5B9FFF] to-[#00E5A0] mb-12" />

        <div className="grid md:grid-cols-5 gap-12 mb-12">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#7B61FF] to-[#5B9FFF] rounded-lg flex items-center justify-center">
                <ConstellationIcon type="brain" className="w-6 h-6 text-white" />
              </div>
              <span style={{ fontSize: '24px', fontWeight: 700 }}>Naviq</span>
            </div>
            <p className="text-white/70 max-w-xs" style={{ fontSize: '14px', lineHeight: '1.6' }}>
              {t.footer.description}
            </p>
            <div className="flex gap-4">
              {['Twitter', 'LinkedIn', 'Instagram', 'Facebook'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <span style={{ fontSize: '14px' }}>{social[0]}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {footerSections.map((section, i) => (
            <div key={i} className="space-y-4">
              <h4 className="text-white" style={{ fontSize: '16px', fontWeight: 600 }}>
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link: string, j: number) => (
                  <li key={j}>
                    <a
                      href="#"
                      className="text-white/70 hover:text-white transition-colors"
                      style={{ fontSize: '14px' }}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="border-t border-white/10 pt-8 mb-8">
          <div className="max-w-md">
            <h4 className="mb-4" style={{ fontSize: '18px', fontWeight: 600 }}>
              {t.footer.newsletter}
            </h4>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder={t.footer.emailPlaceholder}
                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:border-[#7B61FF]"
              />
              <Button className="bg-gradient-to-r from-[#7B61FF] to-[#5B9FFF] text-white hover:opacity-90">
                {t.footer.subscribe}
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-8 flex flex-wrap gap-4 justify-between items-center text-white/60" style={{ fontSize: '14px' }}>
          <p>{t.footer.copyright}</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">{t.footer.privacy}</a>
            <a href="#" className="hover:text-white transition-colors">{t.footer.terms}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
