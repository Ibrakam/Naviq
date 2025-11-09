import { ArrowRight, Sparkles, Target, TrendingUp, Award } from 'lucide-react';
import { Button } from './ui/button';

interface LandingProps {
  onLogin: () => void;
  onSignup: () => void;
}

export function Landing({ onLogin, onSignup }: LandingProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl">NAVIQ</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onLogin}>
              Войти
            </Button>
            <Button onClick={onSignup} className="bg-green-500 hover:bg-green-600">
              Начать бесплатно
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4" />
            <span>AI-навигатор карьеры</span>
          </div>
          <h1 className="text-5xl mb-6">
            AI, который ведёт тебя к карьере
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Пройди персонализированную профориентацию с искусственным интеллектом,
            открой свой карьерный путь и получи реальный опыт через симуляции
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={onSignup}
              size="lg"
              className="bg-green-500 hover:bg-green-600"
            >
              Пройти тест AI
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button variant="outline" size="lg">
              Посмотреть демо
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-gray-50">
        <h2 className="text-3xl text-center mb-12">Как работает Naviq</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl mb-3">AI-профориентация</h3>
            <p className="text-gray-600">
              Пройди тест из 20-25 вопросов. Искусственный интеллект проанализирует
              твои интересы, навыки и ценности, чтобы найти идеальное направление
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl mb-3">Карьерные треки</h3>
            <p className="text-gray-600">
              Получи персонализированные рекомендации по карьерным трекам:
              Frontend, Data, Design, Marketing и другие
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Award className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl mb-3">Реальные симуляции</h3>
            <p className="text-gray-600">
              Проходи пошаговые кейсы от реальных компаний. Получай сертификаты
              и добавляй опыт в резюме
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-green-500 rounded-2xl p-12 text-center text-white">
          <h2 className="text-4xl mb-4">Начни свой путь сегодня</h2>
          <p className="text-xl mb-8 opacity-90">
            Присоединяйся к тысячам студентов, которые уже нашли своё направление
          </p>
          <Button
            onClick={onSignup}
            size="lg"
            className="bg-white text-green-600 hover:bg-gray-100"
          >
            Начать бесплатно
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          <p>© 2025 Naviq. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
}
