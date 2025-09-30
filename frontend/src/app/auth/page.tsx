'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Waves } from '@/components/ui/wave-background';
import { ShinyButton } from '@/components/ui/shiny-button';
import { useTokenAuth } from '@/contexts/TokenAuthContext';
import { AlertCircle, CheckCircle, Loader2, Copy, ExternalLink } from 'lucide-react';

function AuthPageContent() {
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  
  const router = useRouter();
  const { login, isAuthenticated } = useTokenAuth();

  // Перенаправляем, если уже авторизован
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleLogin = useCallback(async (tokenToUse?: string) => {
    const tokenValue = tokenToUse || token;
    
    if (!tokenValue.trim()) {
      setError('Введите токен');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setSuccess(false);

      const success = await login(tokenValue);
      
      if (success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/');
        }, 1500);
      } else {
        setError('Неверный или истекший токен');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Ошибка авторизации');
    } finally {
      setIsLoading(false);
    }
  }, [token, login, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Токен скопирован в буфер обмена!');
    });
  };

  return (
    <div className="relative w-full min-h-screen">
      {/* Background */}
      <Waves 
        backgroundColor="#000000" 
        strokeColor="#ffffff"
        pointerSize={0.3}
        className="fixed inset-0 -z-10"
      />

      {/* Main Content */}
      <main className="relative z-10 w-full min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-black/20 border border-white/20 rounded-2xl backdrop-blur-sm p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Авторизация
              </h1>
              <p className="text-white/70">
                Войдите в обучающую платформу
              </p>
            </div>

            {!showInstructions ? (
              <div className="space-y-6">
                {/* Кнопка получения токена */}
                <div className="text-center">
                  <ShinyButton 
                    onClick={() => setShowInstructions(true)}
                    className="w-full bg-blue-600/80 border-blue-500/50 text-white hover:bg-blue-700/80 transition-colors flex items-center justify-center"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Получить токен авторизации
                  </ShinyButton>
                </div>

                <div className="text-center text-white/50 text-sm">
                  или
                </div>

                {/* Форма ввода токена */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Токен доступа
                    </label>
                    <input
                      type="text"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="Вставьте токен из чата с ботом..."
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-colors"
                      disabled={isLoading}
                    />
                  </div>

                  {error && (
                    <div className="flex items-center space-x-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">{error}</span>
                    </div>
                  )}

                  {success && (
                    <div className="flex items-center space-x-2 text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Авторизация успешна! Перенаправляем...</span>
                    </div>
                  )}

                  <ShinyButton 
                    type="submit"
                    className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Авторизация...
                      </>
                    ) : (
                      'Войти'
                    )}
                  </ShinyButton>
                </form>
              </div>
            ) : (
              /* Инструкции по получению токена */
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-xl font-bold text-white mb-4">
                    Как получить токен
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                        1
                      </div>
                      <div>
                        <h3 className="text-white font-medium mb-1">Откройте чат с ботом</h3>
                        <p className="text-white/70 text-sm">
                          Найдите бота @vladislav_ai_school_bot в Telegram
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                        2
                      </div>
                      <div>
                        <h3 className="text-white font-medium mb-1">Отправьте команду /token</h3>
                        <p className="text-white/70 text-sm">
                          Напишите боту: <code className="bg-white/10 px-2 py-1 rounded text-blue-300">/token</code>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                        3
                      </div>
                      <div>
                        <h3 className="text-white font-medium mb-1">Скопируйте токен</h3>
                        <p className="text-white/70 text-sm">
                          Бот отправит вам токен. Скопируйте его и вернитесь сюда
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <ShinyButton 
                    onClick={() => setShowInstructions(false)}
                    className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    Назад
                  </ShinyButton>
                  <ShinyButton 
                    onClick={() => window.open('https://t.me/vladislav_ai_school_bot', '_blank')}
                    className="flex-1 bg-blue-600/80 border-blue-500/50 text-white hover:bg-blue-700/80"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Открыть бота
                  </ShinyButton>
                </div>
              </div>
            )}

            <div className="mt-6 text-center">
              <p className="text-white/50 text-sm">
                Токен действует 24 часа
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="relative w-full min-h-screen">
        <Waves 
          backgroundColor="#000000" 
          strokeColor="#ffffff"
          pointerSize={0.3}
          className="fixed inset-0 -z-10"
        />
        <main className="relative z-10 w-full min-h-screen flex items-center justify-center">
          <div className="text-white text-xl">Загрузка...</div>
        </main>
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  );
}