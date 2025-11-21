import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Award, Sparkles, User, Mail, Lock } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { ConstellationIcon } from './constellation-icon';

interface SignupProps {
  onSignup: (email: string, password: string, name: string) => Promise<void>;
  onLogin: () => void;
  onBack: () => void;
}

export function Signup({ onSignup, onLogin, onBack }: SignupProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSignup(email, password, name);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#f0f4ff] via-[#f6f8ff] to-[#e6f7f1] text-[#0f1b40] overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-28 right-4 w-[520px] h-[520px] bg-[#7B61FF]/18 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-10 w-[520px] h-[520px] bg-[#00E5A0]/14 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_25%,rgba(123,97,255,0.09),transparent_35%),radial-gradient(circle_at_80%_50%,rgba(0,229,160,0.08),transparent_36%)]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-12 sm:pb-16 md:pb-20">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-[#0f1b40] hover:text-[#5b4dff] px-2 sm:px-3 text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">На главную</span>
          </Button>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-br from-[#7B61FF] to-[#5B9FFF] rounded-2xl flex items-center justify-center shadow-lg shadow-[#7B61FF]/30">
              <ConstellationIcon type="brain" className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-xs uppercase tracking-[0.22em] text-[#0f1b40]/60">Naviq</p>
              <p className="text-base sm:text-lg font-semibold text-[#0f1b40]">AI Career Navigator</p>
            </div>
          </div>

          <Button
            variant="ghost"
            onClick={onLogin}
            className="hidden sm:inline-flex bg-white/90 hover:bg-white text-[#0f1b40] border border-[#e3e7f5] hover:border-[#7B61FF] rounded-full h-11 px-4 shadow-sm text-sm"
          >
            Уже с нами?
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <div className="grid lg:grid-cols-[1.06fr_0.94fr] gap-6 sm:gap-8 items-start mt-6 sm:mt-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-[20px] sm:rounded-[30px] bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_30px_100px_rgba(73,92,175,0.18)] p-6 sm:p-10"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#7B61FF]/12 via-white/70 to-[#00E5A0]/12" />
            <div className="absolute inset-x-6 sm:inset-x-12 top-10 sm:top-14 h-px bg-gradient-to-r from-transparent via-[#7B61FF]/25 to-transparent" />

            <div className="relative space-y-5 sm:space-y-7">
              <Badge className="bg-[#00E5A0]/12 text-[#0EAD7A] border-[#00E5A0]/20 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 inline-flex w-auto text-xs sm:text-sm">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Начни новую траекторию
              </Badge>

              <div className="space-y-2 sm:space-y-3">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-extrabold leading-tight text-[#0f1b40]">
                  Создай аккаунт и начинай карьерный маршрут с AI
                </h1>
                <p className="text-base sm:text-lg text-[#0f1b40]/70 max-w-2xl">
                  20 минут — и у тебя готов персонализированный план, симуляции и подсказки по развитию навыков.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="relative bg-white/95 backdrop-blur-xl border border-white/60 shadow-[0_30px_100px_rgba(73,92,175,0.16)] rounded-[20px] sm:rounded-[30px] p-6 sm:p-8"
          >
            <div className="relative space-y-6 sm:space-y-8">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm uppercase tracking-[0.18em] text-[#0f1b40]/50">Регистрация</p>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#0f1b40]">Создай аккаунт Naviq</h2>
                  <p className="text-xs sm:text-sm text-[#0f1b40]/60">Заполни поля — мы настроим маршрут под тебя.</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#7B61FF] to-[#5B9FFF] text-white flex items-center justify-center shadow-lg shadow-[#7B61FF]/35 flex-shrink-0">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[#0f1b40] text-sm sm:text-base">
                    Имя
                  </Label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#0f1b40]/40 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Например, Алия"
                      required
                      className="h-11 sm:h-12 pl-10 rounded-xl bg-[#f6f8ff] border border-[#e3e7f5] focus-visible:ring-[#7B61FF]/80 focus-visible:border-[#7B61FF] text-[#0f1b40] text-sm sm:text-base"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#0f1b40] text-sm sm:text-base">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#0f1b40]/40 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@naviq.ai"
                      required
                      className="h-11 sm:h-12 pl-10 rounded-xl bg-[#f6f8ff] border border-[#e3e7f5] focus-visible:ring-[#7B61FF]/80 focus-visible:border-[#7B61FF] text-[#0f1b40] text-sm sm:text-base"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[#0f1b40] text-sm sm:text-base">
                    Пароль
                  </Label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#0f1b40]/40 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Минимум 6 символов"
                      required
                      minLength={6}
                      className="h-11 sm:h-12 pl-10 rounded-xl bg-[#f6f8ff] border border-[#e3e7f5] focus-visible:ring-[#7B61FF]/80 focus-visible:border-[#7B61FF] text-[#0f1b40] text-sm sm:text-base"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 sm:h-12 rounded-xl bg-gradient-to-r from-[#6555ff] via-[#5972ff] to-[#4fb5ff] text-white shadow-[0_12px_35px_rgba(101,85,255,0.32)] hover:opacity-95 transition text-sm sm:text-base"
                  disabled={loading}
                >
                  {loading ? 'Создаём...' : 'Создать аккаунт'}
                </Button>
              </form>

              <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-3 text-xs sm:text-sm text-[#0f1b40]/70">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#7B61FF] flex-shrink-0" />
                  <span>Получай сертификаты и трек прогресса</span>
                </div>
                <button
                  onClick={onLogin}
                  className="hidden sm:inline-flex items-center gap-1 text-[#6555ff] font-semibold hover:underline whitespace-nowrap"
                >
                  Войти
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <p className="sm:hidden text-center text-sm text-[#0f1b40]/70">
                Уже есть аккаунт?{' '}
                <button onClick={onLogin} className="text-[#6555ff] font-semibold hover:underline">
                  Войти
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
