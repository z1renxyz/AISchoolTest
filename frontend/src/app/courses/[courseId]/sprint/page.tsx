'use client';

import { useState, useEffect, use } from 'react';
import { ArrowLeft, Play, Clock, BookOpen, Code, HelpCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Waves } from '@/components/ui/wave-background';
import { ShinyButton } from '@/components/ui/shiny-button';
import { getCourseById, getLessonsByCourse, Course, Lesson } from '@/lib/telegram-api';
import { useTelegramAuth } from '@/contexts/TelegramAuthContext';

interface SprintLessonsPageProps {
  params: Promise<{ courseId: string }>;
}

export default function SprintLessonsPage({ params }: SprintLessonsPageProps) {
  const resolvedParams = use(params);
  const { isAdmin } = useTelegramAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        console.log('Loading sprint lessons for course:', resolvedParams.courseId);
        
        // Загружаем курс
        const { data: courseData, error: courseError } = await getCourseById(resolvedParams.courseId);
        console.log('Course data:', { courseData, courseError });
        if (courseError) {
          console.error('Error loading course:', courseError);
        } else {
          setCourse(courseData);
        }

        // Загружаем уроки
        const { data: lessonsData, error: lessonsError } = await getLessonsByCourse(resolvedParams.courseId);
        console.log('Lessons data:', { lessonsData, lessonsError });
        if (lessonsError) {
          console.error('Error loading lessons:', lessonsError);
        } else {
          setLessons(lessonsData || []);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [resolvedParams.courseId]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return Play;
      case 'practice': return Code;
      case 'reading': return BookOpen;
      case 'quiz': return HelpCircle;
      default: return Play;
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 relative overflow-hidden">
        <Waves />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-white text-xl">Загрузка уроков...</div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 relative overflow-hidden">
        <Waves />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-white text-xl">Курс не найден</div>
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
            <Link href={`/courses/${course.id}`}>
              <ShinyButton className="bg-black/20 border-white/30 text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад
              </ShinyButton>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Спринт Сентябрь 2025</h1>
              <p className="text-white/70">{course.title}</p>
            </div>
          </div>

          {/* Lessons List */}
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Уроки спринта</h2>
              <p className="text-white/70">Актуальные уроки курса {course.title}</p>
            </div>

            <div className="space-y-4">
              {lessons.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-white/60">Уроки не найдены</div>
                </div>
              ) : (
                lessons.map((lesson, index) => {
                  const TypeIcon = getTypeIcon('video');
                  return (
                    <a 
                      key={lesson.id}
                      href="https://youtube.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full p-6 bg-black/20 border border-white/20 rounded-2xl backdrop-blur-sm hover:scale-105 hover:bg-white/5 cursor-pointer transition-all duration-300 block"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                          <TypeIcon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white mb-1">
                            {lesson.title}
                          </h3>
                          <p className="text-white/70 text-sm mb-2">
                            {lesson.description}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-white/60">
                            <span className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>0 мин</span>
                            </span>
                            <span>•</span>
                            <span>Видео</span>
                            <span>•</span>
                            <span>Урок {index + 1}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                            <Play className="w-4 h-4 text-green-400" />
                          </div>
                        </div>
                      </div>
                    </a>
                  );
                })
              )}
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
      </div>
    </div>
  );
}