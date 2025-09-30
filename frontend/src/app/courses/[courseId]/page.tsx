'use client';

import { useState, useEffect, use } from 'react';
import { ArrowLeft, Archive, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Waves } from '@/components/ui/wave-background';
import { ShinyButton } from '@/components/ui/shiny-button';
import { getCourseById, Course } from '@/lib/telegram-api';

interface CourseSelectionPageProps {
  params: Promise<{ courseId: string }>;
}

export default function CourseSelectionPage({ params }: CourseSelectionPageProps) {
  const resolvedParams = use(params);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourse = async () => {
      try {
        console.log('Loading course:', resolvedParams.courseId);
        const { data, error } = await getCourseById(resolvedParams.courseId);
        console.log('Course loaded:', { data, error });
        if (error) {
          console.error('Error loading course:', error);
        } else {
          setCourse(data);
        }
      } catch (error) {
        console.error('Error loading course:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [resolvedParams.courseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 relative overflow-hidden">
        <Waves />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-white text-xl">Загрузка курса...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 relative overflow-hidden">
        <Waves />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-white text-xl mb-4">Курс не найден</div>
            <Link href="/courses">
              <ShinyButton className="bg-black/20 border-white/30 text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Вернуться к курсам
              </ShinyButton>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      <Waves />
      
      {/* Header */}
      <div className="relative z-10 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-6 mb-8">
            <Link href="/courses">
              <ShinyButton className="bg-black/20 border-white/30 text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад
              </ShinyButton>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">{course.title}</h1>
              <p className="text-white/70">{course.description}</p>
            </div>
          </div>

          {/* Course Selection */}
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Выберите тип курса</h2>
              <p className="text-white/70">Выберите, как вы хотите изучать этот курс</p>
            </div>

            {/* Sprint Course */}
            <Link href={`/courses/${course.id}/sprint`}>
              <div className="w-full p-8 bg-black/20 border border-white/20 rounded-2xl backdrop-blur-sm hover:scale-105 hover:bg-white/5 cursor-pointer transition-all duration-300">
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-green-500/30">
                    <Calendar className="w-8 h-8 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2">Спринт Сентябрь 2025</h3>
                    <p className="text-white/70 text-lg mb-4">
                      Актуальный курс по {course.title} 2025 года
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-white/60">
                      <span>0 уроков</span>
                      <span>•</span>
                      <span>4-6 недель</span>
                      <span>•</span>
                      <span className="text-green-400">Активный</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Archive Course */}
            <Link href={`/courses/${course.id}/archive`}>
              <div className="w-full p-8 bg-black/20 border border-white/20 rounded-2xl backdrop-blur-sm hover:scale-105 hover:bg-white/5 cursor-pointer transition-all duration-300">
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-blue-500/30">
                    <Archive className="w-8 h-8 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2">Архив</h3>
                    <p className="text-white/70 text-lg mb-4">
                      Доступ ко всем предыдущим урокам
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-white/60">
                      <span>Все уроки</span>
                      <span>•</span>
                      <span>Без ограничений</span>
                      <span>•</span>
                      <span className="text-blue-400">Доступно</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}