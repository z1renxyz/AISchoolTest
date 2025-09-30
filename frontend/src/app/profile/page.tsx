'use client';

import { useState, useEffect } from 'react';
import { useTelegramAuth } from '@/contexts/TelegramAuthContext';
import { Waves } from '@/components/ui/wave-background';
import { NavBar } from '@/components/ui/tubelight-navbar';
import { ShinyButton } from '@/components/ui/shiny-button';
import { Home as HomeIcon, BookOpen, TrendingUp, User, ArrowLeft, Settings, Bell, Shield, Download, LogOut, Edit3, Save, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getUserProfileStats, updateUserProfile } from '@/lib/telegram-api';

export default function ProfilePage() {
  const { user, refreshUser } = useTelegramAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.first_name || '',
    email: user?.username || '',
    telegramId: user?.id?.toString() || ''
  });
  const [userStats, setUserStats] = useState<{ stats: { totalLessons: number; completedLessons: number; totalHours: number; completedHours: number; achievements: Array<{ earned: boolean }>; progressPercentage: number } } | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Синхронизируем editData с user
  useEffect(() => {
    if (user) {
      setEditData({
        name: user.first_name || '',
        email: user.username || '',
        telegramId: user.telegram_user_id.toString()
      });
    }
  }, [user]);

  // Загружаем статистику пользователя
  useEffect(() => {
    const loadUserStats = async () => {
      if (!user?.id) {
        console.log('No user ID, skipping stats load');
        setStatsLoading(false);
        return;
      }

      setStatsLoading(true);
      try {
        console.log('Loading user stats for ID:', user.id);
        const { stats, error } = await getUserProfileStats(parseInt(user.id));
        if (error) {
          console.error('Error loading user stats:', error);
        } else if (stats) {
          console.log('User stats loaded:', stats);
          setUserStats({ stats });
        }
      } catch (error) {
        console.error('Error loading user stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    loadUserStats();
  }, [user?.id]);

  const navItems = [
    { name: 'Главная', url: '/', icon: HomeIcon },
    { name: 'Курсы', url: '/courses', icon: BookOpen },
    { name: 'Прогресс', url: '/progress', icon: TrendingUp },
    { name: 'Профиль', url: '/profile', icon: User }
  ];

  const handleSave = async () => {
    if (!user?.id) return;

    setSaving(true);
    try {
      const { data, error } = await updateUserProfile(parseInt(user.id), {
        first_name: editData.name,
        username: editData.email
      });

      if (error) {
        console.error('Error saving profile:', error);
        alert('Ошибка при сохранении профиля');
      } else {
        console.log('Profile saved successfully:', data);
        // Обновляем данные пользователя в контексте
        await refreshUser();
        // Обновляем локальное состояние
        if (data) {
          setEditData({
            name: data.first_name || '',
            email: data.username || '',
            telegramId: user.id.toString()
          });
        }
        setIsEditing(false);
        alert('Профиль успешно сохранен!');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Произошла ошибка при сохранении профиля');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      name: user?.first_name || '',
      email: user?.username || '',
      telegramId: user?.id?.toString() || ''
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
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

        {/* Navigation */}
        <NavBar 
          items={navItems} 
          logo={
            <Image 
              src="/logo.svg" 
              alt="Школа ИИ с Владиславом" 
              width={40} 
              height={40}
              className="w-10 h-10 brightness-0 invert"
            />
          }
          isAdmin={user?.is_admin || false}
        />

        {/* Main Content */}
        <main className="relative z-10 w-full min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <Link href="/">
                  <ShinyButton className="bg-black/20 border-white/30 text-white">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Назад
                  </ShinyButton>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-white">Профиль</h1>
                  <p className="text-white/70">Управление аккаунтом и настройками</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Personal Information */}
                <div className="bg-black/20 border border-white/20 rounded-2xl backdrop-blur-sm p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Личная информация</h2>
                    {!isEditing ? (
                      <ShinyButton 
                        onClick={() => setIsEditing(true)}
                        className="bg-black/20 border-white/30 text-white"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Редактировать
                      </ShinyButton>
                    ) : (
                      <div className="flex space-x-2">
                        <ShinyButton
                          onClick={handleSave}
                          disabled={saving}
                          className={`${
                            saving
                              ? 'bg-gray-500/20 border-gray-500/30 text-gray-400'
                              : 'bg-green-500/20 border-green-500/30 text-green-400'
                          }`}
                        >
                          {saving ? (
                            <>
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                              Сохранение...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Сохранить
                            </>
                          )}
                        </ShinyButton>
                        <ShinyButton 
                          onClick={handleCancel}
                          className="bg-red-500/20 border-red-500/30 text-red-400"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Отмена
                        </ShinyButton>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Имя
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.name}
                          onChange={(e) => setEditData({...editData, name: e.target.value})}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-colors"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white">
                          {user?.first_name}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Email
                      </label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={editData.email}
                          onChange={(e) => setEditData({...editData, email: e.target.value})}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-colors"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white">
                          {user?.username}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Telegram ID
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.telegramId}
                          onChange={(e) => setEditData({...editData, telegramId: e.target.value})}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-colors"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white">
                          {user?.id || 'Не настроен'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Learning Statistics */}
                <div className="bg-black/20 border border-white/20 rounded-2xl backdrop-blur-sm p-8">
                  <h2 className="text-xl font-bold text-white mb-6">Статистика обучения</h2>
                  {statsLoading ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                      <div className="text-white/60">Загрузка статистики...</div>
                    </div>
                  ) : userStats ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white mb-2">{userStats.stats.completedLessons}</div>
                        <div className="text-sm text-white/60">Завершено уроков</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white mb-2">{userStats.stats.completedHours}</div>
                        <div className="text-sm text-white/60">Часов изучено</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white mb-2">0</div>
                        <div className="text-sm text-white/60">Дней подряд</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white mb-2">
                          {userStats.stats.achievements.filter((a: { earned: boolean }) => a.earned).length}
                        </div>
                        <div className="text-sm text-white/60">Достижения</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-white/60">Данные недоступны</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Settings */}
                <div className="bg-black/20 border border-white/20 rounded-2xl backdrop-blur-sm p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Настройки</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => alert('Общие настройки - функция в разработке')}
                      className="w-full flex items-center space-x-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                    >
                      <Settings className="w-5 h-5 text-white" />
                      <span className="text-white">Общие настройки</span>
                    </button>
                    <button
                      onClick={() => alert('Уведомления - функция в разработке')}
                      className="w-full flex items-center space-x-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                    >
                      <Bell className="w-5 h-5 text-white" />
                      <span className="text-white">Уведомления</span>
                    </button>
                    <button
                      onClick={() => alert('Безопасность - функция в разработке')}
                      className="w-full flex items-center space-x-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                    >
                      <Shield className="w-5 h-5 text-white" />
                      <span className="text-white">Безопасность</span>
                    </button>
                  </div>
                </div>

                {/* Data Management */}
                <div className="bg-black/20 border border-white/20 rounded-2xl backdrop-blur-sm p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Управление данными</h3>
                  <div className="space-y-3">
                    <ShinyButton
                      onClick={() => alert('Экспорт данных - функция в разработке')}
                      className="w-full bg-black/20 border-white/30 text-white cursor-pointer"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Экспорт данных
                    </ShinyButton>
                    <ShinyButton
                      onClick={() => alert('Резервное копирование - функция в разработке')}
                      className="w-full bg-white/10 border-white/20 text-white cursor-pointer"
                    >
                      Резервное копирование
                    </ShinyButton>
                  </div>
                </div>

                {/* Account Actions */}
                <div className="bg-black/20 border border-white/20 rounded-2xl backdrop-blur-sm p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Аккаунт</h3>
                  <div className="space-y-3">
                    <ShinyButton 
                      onClick={handleLogout}
                      className="w-full bg-red-500/20 border-red-500/30 text-red-400"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Выйти из аккаунта
                    </ShinyButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
  );
}

