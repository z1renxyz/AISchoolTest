'use client';

import { BookOpen, Brain, Code, Star, TrendingUp, Users, Home as HomeIcon, User, Globe } from 'lucide-react';
import Image from 'next/image';
import { Waves } from '@/components/ui/wave-background';
import { NavBar } from '@/components/ui/tubelight-navbar';
import { useTelegramAuth } from '@/contexts/TelegramAuthContext';

export default function TopicsPage() {
  const { user, isAdmin, isLoading } = useTelegramAuth();
  
  const navItems = [
    { name: 'Главная', url: '/', icon: HomeIcon },
    { name: 'Курсы', url: '/courses', icon: BookOpen },
    { name: 'Прогресс', url: '/progress', icon: TrendingUp },
    { name: 'Профиль', url: '/profile', icon: User }
  ];

  const courses = [
    {
      id: 1,
      title: 'ИИ Кодинг',
      description: 'Программирование с помощью ИИ',
      icon: Code,
      lessons: 24,
      duration: '4-6 недель'
    },
    {
      id: 2,
      title: 'ИИ Ассистенты',
      description: 'ChatGPT, Claude и другие помощники',
      icon: Users,
      lessons: 18,
      duration: '3-4 недели'
    },
    {
      id: 3,
      title: 'Генеративный ИИ',
      description: 'Создание контента с помощью ИИ',
      icon: Brain,
      lessons: 20,
      duration: '4-5 недель'
    },
    {
      id: 4,
      title: 'Машинное обучение',
      description: 'Основы ML и нейронных сетей',
      icon: TrendingUp,
      lessons: 32,
      duration: '6-8 недель'
    },
    {
      id: 5,
      title: 'Этика ИИ',
      description: 'Безопасность и ответственность',
      icon: Globe,
      lessons: 12,
      duration: '2-3 недели'
    },
    {
      id: 6,
      title: 'Будущее ИИ',
      description: 'Тренды и перспективы развития',
      icon: Star,
      lessons: 16,
      duration: '3-4 недели'
    }
  ];

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
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              Темы обучения
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Выберите направление для изучения
            </p>
          </div>

          {/* Courses Grid */}
          <div className="max-w-4xl mx-auto space-y-4">
            {courses.map((course) => (
              <div 
                key={course.id} 
                className="w-full p-6 bg-black/20 border border-white/20 rounded-2xl backdrop-blur-sm group cursor-pointer transition-all duration-300 hover:scale-105 hover:bg-white/5"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20 group-hover:bg-white/20 transition-colors">
                    <course.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-white mb-1 group-hover:text-white/90 transition-colors">
                      {course.title}
                    </h4>
                    <p className="text-white/70 text-sm mb-2">
                      {course.description}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-white/60">
                      <span>{course.lessons} уроков</span>
                      <span>•</span>
                      <span>{course.duration}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors">
                      Начать курс
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <footer className="border-t border-white/10 pt-8 mt-16">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <Image 
                  src="/logo.svg" 
                  alt="Школа ИИ с Владиславом" 
                  width={24} 
                  height={24}
                  className="w-6 h-6 brightness-0 invert"
                />
                <span className="text-white font-semibold">
                  Школа ИИ с Владиславом
                </span>
              </div>
              <p className="text-white/60 text-sm">
                © 2024 Все права защищены
              </p>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}