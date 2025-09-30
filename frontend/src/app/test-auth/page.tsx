'use client';

import { useState } from 'react';
import { Waves } from '@/components/ui/wave-background';
import { ShinyButton } from '@/components/ui/shiny-button';
import { useTelegramAuth } from '@/contexts/TelegramAuthContext';

export default function TestAuthPage() {
  const { user, isAdmin, isLoading, isAuthenticated } = useTelegramAuth();
  const [testUserId, setTestUserId] = useState('123456789');

  const handleTestLogin = () => {
    // Симуляция Telegram Web App для тестирования
    if (typeof window !== 'undefined') {
      (window as any).Telegram = {
        WebApp: {
          initDataUnsafe: {
            user: {
              id: parseInt(testUserId),
              first_name: 'Test User',
              username: 'testuser',
              language_code: 'ru'
            }
          },
          ready: () => {},
          expand: () => {}
        }
      };
      
      // Перезагружаем страницу для инициализации
      window.location.reload();
    }
  };

  return (
    <div className="relative w-full min-h-screen">
      <Waves 
        backgroundColor="#000000" 
        strokeColor="#ffffff"
        pointerSize={0.3}
        className="fixed inset-0 -z-10"
      />
      
      <main className="relative z-10 w-full min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-black/20 border border-white/20 rounded-2xl backdrop-blur-sm p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Тест авторизации
              </h1>
              <p className="text-white/70">
                Страница для тестирования без Telegram
              </p>
            </div>

            <div className="space-y-6">
              {/* Статус авторизации */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <h3 className="text-white font-medium mb-2">Статус:</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/70">Загрузка:</span>
                    <span className={isLoading ? 'text-yellow-400' : 'text-green-400'}>
                      {isLoading ? 'Да' : 'Нет'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Авторизован:</span>
                    <span className={isAuthenticated ? 'text-green-400' : 'text-red-400'}>
                      {isAuthenticated ? 'Да' : 'Нет'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Админ:</span>
                    <span className={isAdmin ? 'text-green-400' : 'text-red-400'}>
                      {isAdmin ? 'Да' : 'Нет'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Данные пользователя */}
              {user && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <h3 className="text-white font-medium mb-2">Пользователь:</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/70">ID:</span>
                      <span className="text-white">{user.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Telegram ID:</span>
                      <span className="text-white">{user.telegram_user_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Имя:</span>
                      <span className="text-white">{user.first_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Username:</span>
                      <span className="text-white">{user.username || 'Нет'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Тестовая авторизация */}
              <div className="space-y-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Test Telegram User ID
                  </label>
                  <input
                    type="text"
                    value={testUserId}
                    onChange={(e) => setTestUserId(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-colors"
                    placeholder="Введите Telegram User ID"
                  />
                </div>

                <ShinyButton 
                  onClick={handleTestLogin}
                  className="w-full bg-blue-600/80 border-blue-500/50 text-white hover:bg-blue-700/80"
                >
                  🧪 Тестовая авторизация
                </ShinyButton>
              </div>

              {/* Информация */}
              <div className="text-center text-white/50 text-sm">
                <p>Эта страница доступна только для разработки</p>
                <p>В продакшене используйте Telegram Web App</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
