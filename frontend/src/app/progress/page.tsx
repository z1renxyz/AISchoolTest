'use client';

import { useState, useEffect } from 'react';
import { Waves } from '@/components/ui/wave-background';
import { NavBar } from '@/components/ui/tubelight-navbar';
import { ShinyButton } from '@/components/ui/shiny-button';
import { Home as HomeIcon, BookOpen, TrendingUp, User, ArrowLeft, Trophy, Award } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useTokenAuth } from '@/contexts/TokenAuthContext';
import { getUserProgressStats } from '@/lib/telegram-api';

export default function ProgressPage() {
  const { user, isAdmin } = useTokenAuth();
  const [progressStats, setProgressStats] = useState<{ stats: { totalLessons: number; completedLessons: number; totalHours: number; completedHours: number; currentStreak: number; longestStreak: number; overallProgress: number; achievements: Array<{ earned: boolean }>; weeklyProgress: Array<{ day: string; lessons: number; completed: boolean }>; courseProgress: Array<{ name: string; progress: number; lessons: number; completed: number }> } } | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const navItems = [
    { name: 'Главная', url: '/', icon: HomeIcon },
    { name: 'Курсы', url: '/courses', icon: BookOpen },
    { name: 'Прогресс', url: '/progress', icon: TrendingUp },
    { name: 'Профиль', url: '/profile', icon: User }
  ];

  // Загружаем статистику прогресса
  useEffect(() => {
    const loadProgressStats = async () => {
      if (!user?.id) {
        console.log('No user ID, skipping progress stats load');
        setStatsLoading(false);
        return;
      }

      setStatsLoading(true);
      try {
        console.log('Loading progress stats for ID:', user.id);
        const { stats, error } = await getUserProgressStats(parseInt(user.id));
        if (error) {
          console.error('Error loading progress stats:', error);
          setProgressStats(null);
        } else if (stats) {
          console.log('Progress stats loaded:', stats);
          setProgressStats({ stats });
        }
      } catch (error) {
        console.error('Error loading progress stats:', error);
        setProgressStats(null);
      } finally {
        setStatsLoading(false);
      }
    };

    loadProgressStats();
  }, [user?.id]);

  // Данные для отображения
  const progressData = progressStats || {
    totalLessons: 0,
    completedLessons: 0,
    totalHours: 0,
    completedHours: 0,
    currentStreak: 0,
    longestStreak: 0,
    overallProgress: 0,
    achievements: [
      { id: 1, title: 'Первый урок', description: 'Завершили первый урок', icon: '🎯', earned: false },
      { id: 2, title: 'Неделя обучения', description: 'Занимались 7 дней подряд', icon: '🔥', earned: false },
      { id: 3, title: 'Исследователь ИИ', description: 'Изучили основы ИИ', icon: '🧠', earned: false },
      { id: 4, title: 'Мастер кодинга', description: 'Завершили курс программирования', icon: '💻', earned: false },
      { id: 5, title: 'Гуру ассистентов', description: 'Освоили работу с ИИ-ассистентами', icon: '🤖', earned: false }
    ],
    weeklyProgress: [
      { day: 'Пн', lessons: 0, completed: false },
      { day: 'Вт', lessons: 0, completed: false },
      { day: 'Ср', lessons: 0, completed: false },
      { day: 'Чт', lessons: 0, completed: false },
      { day: 'Пт', lessons: 0, completed: false },
      { day: 'Сб', lessons: 0, completed: false },
      { day: 'Вс', lessons: 0, completed: false }
    ],
    courseProgress: []
  };

  const overallProgress = (progressData as { stats?: { overallProgress?: number }; overallProgress?: number })?.stats?.overallProgress || (progressData as { stats?: { overallProgress?: number }; overallProgress?: number })?.overallProgress || 0;

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
          isAdmin={isAdmin}
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
                  <h1 className="text-3xl font-bold text-white">Прогресс обучения</h1>
                  <p className="text-white/70">Отслеживайте свои достижения</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Overall Stats */}
              <div className="lg:col-span-2 space-y-6">
                {/* Main Progress Card */}
                <div className="bg-black/20 border border-white/20 rounded-2xl backdrop-blur-sm p-8">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                      <Trophy className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Общий прогресс</h2>
                      <p className="text-white/70">Ваши достижения в обучении</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-2">{overallProgress}%</div>
                      <div className="text-sm text-white/60">Общий прогресс</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-2">{(progressData as { stats?: { completedLessons?: number }; completedLessons?: number })?.stats?.completedLessons || (progressData as { stats?: { completedLessons?: number }; completedLessons?: number })?.completedLessons || 0}</div>
                      <div className="text-sm text-white/60">Уроков завершено</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-2">{(progressData as { stats?: { completedHours?: number }; completedHours?: number })?.stats?.completedHours || (progressData as { stats?: { completedHours?: number }; completedHours?: number })?.completedHours || 0}</div>
                      <div className="text-sm text-white/60">Часов изучено</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-2">{(progressData as { stats?: { currentStreak?: number }; currentStreak?: number })?.stats?.currentStreak || (progressData as { stats?: { currentStreak?: number }; currentStreak?: number })?.currentStreak || 0}</div>
                      <div className="text-sm text-white/60">Дней подряд</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-6">
                    <div className="flex justify-between text-sm text-white/60 mb-2">
                      <span>Прогресс курса</span>
                      <span>{(progressData as { stats?: { completedLessons?: number; totalLessons?: number }; completedLessons?: number; totalLessons?: number })?.stats?.completedLessons || (progressData as { stats?: { completedLessons?: number; totalLessons?: number }; completedLessons?: number; totalLessons?: number })?.completedLessons || 0} из {(progressData as { stats?: { completedLessons?: number; totalLessons?: number }; completedLessons?: number; totalLessons?: number })?.stats?.totalLessons || (progressData as { stats?: { completedLessons?: number; totalLessons?: number }; completedLessons?: number; totalLessons?: number })?.totalLessons || 0}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3">
                      <div 
                        className="bg-white h-3 rounded-full transition-all duration-500"
                        style={{ width: `${overallProgress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Course Progress */}
                <div className="bg-black/20 border border-white/20 rounded-2xl backdrop-blur-sm p-8">
                  <h3 className="text-xl font-bold text-white mb-6">Прогресс по курсам</h3>
                  {statsLoading ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                      <div className="text-white/60">Загрузка прогресса...</div>
                    </div>
                  ) : ((progressData as { stats?: { courseProgress?: Array<{ name: string; progress: number; lessons: number; completed: number }> }; courseProgress?: Array<{ name: string; progress: number; lessons: number; completed: number }> })?.stats?.courseProgress || (progressData as { stats?: { courseProgress?: Array<{ name: string; progress: number; lessons: number; completed: number }> }; courseProgress?: Array<{ name: string; progress: number; lessons: number; completed: number }> })?.courseProgress || []).length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-white/60">Пока нет данных по курсам</div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {((progressData as { stats?: { courseProgress?: Array<{ name: string; progress: number; lessons: number; completed: number }> }; courseProgress?: Array<{ name: string; progress: number; lessons: number; completed: number }> })?.stats?.courseProgress || (progressData as { stats?: { courseProgress?: Array<{ name: string; progress: number; lessons: number; completed: number }> }; courseProgress?: Array<{ name: string; progress: number; lessons: number; completed: number }> })?.courseProgress || []).map((course: { name: string; progress: number; lessons: number; completed: number }, index: number) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                          <div className="flex-1">
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-white font-medium">{course.name}</span>
                              <span className="text-white/60">{course.completed}/{course.lessons} уроков</span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-2">
                              <div
                                className="bg-white h-2 rounded-full transition-all duration-500"
                                style={{ width: `${course.progress}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="ml-4 text-right">
                            <div className="text-lg font-bold text-white">{course.progress}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Weekly Progress */}
                <div className="bg-black/20 border border-white/20 rounded-2xl backdrop-blur-sm p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Активность на неделе</h3>
                  <div className="grid grid-cols-7 gap-2">
                    {((progressData as { stats?: { weeklyProgress?: Array<{ day: string; lessons: number; completed: boolean }> }; weeklyProgress?: Array<{ day: string; lessons: number; completed: boolean }> })?.stats?.weeklyProgress || (progressData as { stats?: { weeklyProgress?: Array<{ day: string; lessons: number; completed: boolean }> }; weeklyProgress?: Array<{ day: string; lessons: number; completed: boolean }> })?.weeklyProgress || []).map((day, index) => (
                      <div key={index} className="text-center">
                        <div className="text-xs text-white/60 mb-1">{day.day}</div>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                          day.completed ? 'bg-white text-black' : 'bg-white/10 text-white/60'
                        }`}>
                          {day.lessons}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Achievements */}
                <div className="bg-black/20 border border-white/20 rounded-2xl backdrop-blur-sm p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Достижения</h3>
                  <div className="space-y-3">
                    {((progressData as { stats?: { achievements?: Array<{ id: number; title: string; description: string; icon: string; earned: boolean }> }; achievements?: Array<{ id: number; title: string; description: string; icon: string; earned: boolean }> })?.stats?.achievements || (progressData as { stats?: { achievements?: Array<{ id: number; title: string; description: string; icon: string; earned: boolean }> }; achievements?: Array<{ id: number; title: string; description: string; icon: string; earned: boolean }> })?.achievements || []).map((achievement) => (
                      <div 
                        key={achievement.id}
                        className={`flex items-center space-x-3 p-3 rounded-xl ${
                          achievement.earned ? 'bg-white/10' : 'bg-white/5 opacity-60'
                        }`}
                      >
                        <span className="text-2xl">{achievement.icon}</span>
                        <div className="flex-1">
                          <div className="text-white font-medium text-sm">{achievement.title}</div>
                          <div className="text-white/60 text-xs">{achievement.description}</div>
                        </div>
                        {achievement.earned && (
                          <Award className="w-5 h-5 text-yellow-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-black/20 border border-white/20 rounded-2xl backdrop-blur-sm p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Быстрые действия</h3>
                  <div className="space-y-3">
                    <Link href="/courses">
                      <ShinyButton className="w-full bg-black/20 border-white/30 text-white">
                        Продолжить обучение
                      </ShinyButton>
                    </Link>
                    <ShinyButton className="w-full bg-white/10 border-white/20 text-white">
                      Поделиться прогрессом
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

