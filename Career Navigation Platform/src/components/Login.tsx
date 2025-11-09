import { useState } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onGoogleAuth: (token: string) => Promise<void>;
  onSignup: () => void;
  onBack: () => void;
}

export function Login({ onLogin, onGoogleAuth, onSignup, onBack }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    if (!clientId || clientId.trim() === '') {
      alert(
        'Google Client ID не настроен.\n\n' +
        'Для настройки:\n' +
        '1. Создайте файл .env в корне проекта\n' +
        '2. Добавьте: VITE_GOOGLE_CLIENT_ID=ваш-client-id\n' +
        '3. Получите Client ID в Google Cloud Console\n' +
        '4. Перезапустите dev сервер'
      );
      console.error('VITE_GOOGLE_CLIENT_ID не найден в переменных окружения');
      return;
    }

    // Always use redirect for reliability
    handleGoogleRedirect(clientId);
  };

  const handleGoogleRedirect = (clientId: string) => {
    // Store redirect info
    sessionStorage.setItem('google_auth_redirect', 'true');
    const redirectUri = encodeURIComponent(window.location.origin);
    const nonce = Math.random().toString(36).substring(7);
    sessionStorage.setItem('google_auth_nonce', nonce);
    
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=id_token&scope=openid%20email%20profile&nonce=${nonce}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onLogin(email, password);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>

          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl">NAVIQ</span>
          </div>

          <h1 className="text-3xl mb-2">Вход в систему</h1>
          <p className="text-gray-600 mb-8">
            Продолжи свой путь к идеальной карьере
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600"
              disabled={loading}
            >
              {loading ? 'Вход...' : 'Войти'}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">или</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full mt-4"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Войти через Google
            </Button>
          </div>

          <p className="mt-6 text-center text-gray-600">
            Нет аккаунта?{' '}
            <button
              onClick={onSignup}
              className="text-green-600 hover:underline"
            >
              Зарегистрироваться
            </button>
          </p>
        </div>
      </div>

      {/* Right Side - Image/Illustration */}
      <div className="hidden lg:block flex-1 bg-gradient-to-br from-green-400 to-green-600 p-12 text-white">
        <div className="h-full flex flex-col justify-center max-w-lg">
          <h2 className="text-4xl mb-6">Добро пожаловать обратно!</h2>
          <p className="text-xl opacity-90">
            Продолжай проходить симуляции, открывай новые направления
            и строй карьеру своей мечты
          </p>
        </div>
      </div>
    </div>
  );
}
