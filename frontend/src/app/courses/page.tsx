'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Brain, Code, Star, TrendingUp, Users, Home as HomeIcon, User, Globe, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Waves } from '@/components/ui/wave-background';
import { NavBar } from '@/components/ui/tubelight-navbar';
import { ShinyButton } from '@/components/ui/shiny-button';
import { useTokenAuth } from '@/contexts/TokenAuthContext';
import { getCourses, Course } from '@/lib/telegram-api';

export default function CoursesPage() {
  const { isAdmin } = useTokenAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Загрузка курсов из БД
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const { data, error } = await getCourses();
        if (error) {
          console.error('Error loading courses:', error);
        } else {
          setCourses(data || []);
        }
      } catch (error) {
        console.error('Error loading courses:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  const navItems = [
    { name: 'Главная', url: '/', icon: HomeIcon },
    { name: 'Курсы', url: '/courses', icon: BookOpen },
    { name: 'Прогресс', url: '/progress', icon: TrendingUp },
    { name: 'Профиль', url: '/profile', icon: User }
  ];

  // Функция для получения иконки
  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
      'Code': Code,
      'Zap': Star,
      'TrendingUp': TrendingUp,
      'Brain': Brain,
      'BookOpen': BookOpen,
      'Users': Users,
      'Globe': Globe
    };
    return iconMap[iconName] || BookOpen;
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
          isAdmin={isAdmin}
        />

        {/* Main Content */}
        <main className="relative z-10 w-full min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
            {/* Header */}
            <div className="flex items-center space-x-6 mb-8">
              <Link href="/">
                <ShinyButton className="bg-black/20 border-white/30 text-white">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Назад
                </ShinyButton>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white">Курсы</h1>
                <p className="text-white/70">Выберите курс для изучения</p>
              </div>
            </div>

            {/* Courses Grid */}
            <div className="max-w-4xl mx-auto space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="text-white/60">Загрузка курсов...</div>
                </div>
              ) : courses.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-white/60">Курсы не найдены</div>
                </div>
              ) : (
                courses.map((course: Course) => {
                  const IconComponent = getIconComponent(course.icon || 'BookOpen');
                  return (
                    <div 
                      key={course.id} 
                      className="w-full p-6 bg-black/20 border border-white/20 rounded-2xl backdrop-blur-sm group cursor-pointer transition-all duration-300 hover:scale-105 hover:bg-white/5"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20 group-hover:bg-white/20 transition-colors">
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-white mb-1 group-hover:text-white/90 transition-colors">
                            {course.title}
                          </h4>
                          <p className="text-white/70 text-sm mb-2">
                            {course.description}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-white/60">
                            <span>{course.lessons_count} уроков</span>
                            <span>•</span>
                            <span>{course.duration}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link href={`/courses/${course.id}`}>
                            <button className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors">
                              Начать курс
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
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