'use client';

import { BookOpen, Brain, Code, Star, TrendingUp, Users, Home as HomeIcon, User, Globe } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Waves } from '@/components/ui/wave-background';
import { NavBar } from '@/components/ui/tubelight-navbar';
import { useTokenAuth } from '@/contexts/TokenAuthContext';
import { AuthError } from '@/components/ui/auth-error';

export default function Home() {
  const { isAdmin, isLoading, isAuthenticated } = useTokenAuth();
  
  // Показываем загрузку
  if (isLoading) {
    return (
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
    );
  }
  
  // Перенаправляем на авторизацию
  if (!isAuthenticated) {
    window.location.href = '/auth';
    return null;
  }
  
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
      color: 'blue'
    },
    {
      id: 2,
      title: 'ИИ Ассистенты',
      description: 'ChatGPT, Claude и другие помощники',
      icon: Users,
      color: 'green'
    },
    {
      id: 3,
      title: 'Генеративный ИИ',
      description: 'Создание контента с помощью ИИ',
      icon: Brain,
      color: 'purple'
    },
    {
      id: 4,
      title: 'Машинное обучение',
      description: 'Основы ML и нейронных сетей',
      icon: TrendingUp,
      color: 'orange'
    },
    {
      id: 5,
      title: 'Этика ИИ',
      description: 'Безопасность и ответственность',
      icon: Globe,
      color: 'cyan'
    },
    {
      id: 6,
      title: 'Будущее ИИ',
      description: 'Тренды и перспективы развития',
      icon: Star,
      color: 'pink'
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
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              Школа ИИ с Владиславом
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Платформа для изучения искусственного интеллекта и современных технологий
            </p>
          </div>

          {/* Learning Directions */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-4">
                Выберите направление обучения
              </h3>
            </div>
            <div className="max-w-4xl mx-auto space-y-4">
              {courses.map((course) => (
                <Link 
                  key={course.id} 
                  href="/courses"
                  className="block w-full p-6 bg-black/20 border border-white/20 rounded-2xl backdrop-blur-sm group cursor-pointer transition-all duration-300 hover:scale-105 hover:bg-white/5"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20 group-hover:bg-white/20 transition-colors">
                      <course.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-white mb-1 group-hover:text-white/90 transition-colors">
                        {course.title}
                      </h4>
                      <p className="text-white/70 text-sm">
                        {course.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>


          {/* Footer */}
          <footer className="border-t border-white/10 pt-8 mt-16">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-3 mb-4">
                {isAdmin ? (
                  <Link href="/admin" className="hover:opacity-80 transition-opacity">
                    <Image 
                      src="/logo.svg" 
                      alt="Школа ИИ с Владиславом" 
                      width={24} 
                      height={24}
                      className="w-6 h-6 brightness-0 invert"
                    />
                  </Link>
                ) : (
                  <Image 
                    src="/logo.svg" 
                    alt="Школа ИИ с Владиславом" 
                    width={24} 
                    height={24}
                    className="w-6 h-6 brightness-0 invert"
                  />
                )}
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