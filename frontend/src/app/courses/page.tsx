'use client';

import { useState } from 'react';
import { Waves } from '@/components/ui/wave-background';
import { NavBar } from '@/components/ui/tubelight-navbar';
import { ShinyButton } from '@/components/ui/shiny-button';
import { Home as HomeIcon, BookOpen, TrendingUp, User, ArrowLeft, Play, CheckCircle, Clock, Star } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function CoursesPage() {
  const [selectedCourse, setSelectedCourse] = useState('ai-coding');

  const navItems = [
    { name: 'Главная', url: '/', icon: HomeIcon },
    { name: 'Курсы', url: '/courses', icon: BookOpen },
    { name: 'Прогресс', url: '/progress', icon: TrendingUp },
    { name: 'Профиль', url: '/profile', icon: User }
  ];

  const courses = [
    {
      id: 'ai-coding',
      title: 'ИИ Кодинг',
      description: 'Программирование с помощью ИИ',
      icon: '💻',
      lessons: [
        { id: 1, title: 'Введение в ИИ-программирование', duration: '15 мин', completed: true },
        { id: 2, title: 'GitHub Copilot - основы работы', duration: '20 мин', completed: true },
        { id: 3, title: 'ChatGPT для разработчиков', duration: '25 мин', completed: false },
        { id: 4, title: 'Автоматизация тестирования с ИИ', duration: '30 мин', completed: false },
        { id: 5, title: 'ИИ-ассистенты для отладки кода', duration: '20 мин', completed: false }
      ]
    },
    {
      id: 'ai-assistants',
      title: 'ИИ Ассистенты',
      description: 'ChatGPT, Claude и другие помощники',
      icon: '🤖',
      lessons: [
        { id: 1, title: 'Обзор ИИ-ассистентов', duration: '10 мин', completed: true },
        { id: 2, title: 'ChatGPT: продвинутые техники', duration: '25 мин', completed: false },
        { id: 3, title: 'Claude: особенности и возможности', duration: '20 мин', completed: false },
        { id: 4, title: 'Сравнение ИИ-ассистентов', duration: '15 мин', completed: false }
      ]
    },
    {
      id: 'generative-ai',
      title: 'Генеративный ИИ',
      description: 'Создание контента с помощью ИИ',
      icon: '🎨',
      lessons: [
        { id: 1, title: 'Введение в генеративный ИИ', duration: '12 мин', completed: true },
        { id: 2, title: 'Создание текстового контента', duration: '30 мин', completed: false },
        { id: 3, title: 'Генерация изображений', duration: '25 мин', completed: false },
        { id: 4, title: 'Создание видео с ИИ', duration: '35 мин', completed: false }
      ]
    },
    {
      id: 'machine-learning',
      title: 'Машинное обучение',
      description: 'Основы ML и нейронных сетей',
      icon: '🧠',
      lessons: [
        { id: 1, title: 'Введение в машинное обучение', duration: '20 мин', completed: true },
        { id: 2, title: 'Типы алгоритмов ML', duration: '25 мин', completed: false },
        { id: 3, title: 'Нейронные сети: основы', duration: '30 мин', completed: false },
        { id: 4, title: 'Практические проекты', duration: '45 мин', completed: false }
      ]
    },
    {
      id: 'ai-ethics',
      title: 'Этика ИИ',
      description: 'Безопасность и ответственность',
      icon: '🛡️',
      lessons: [
        { id: 1, title: 'Этические принципы ИИ', duration: '15 мин', completed: false },
        { id: 2, title: 'Безопасность ИИ-систем', duration: '20 мин', completed: false },
        { id: 3, title: 'Ответственное использование ИИ', duration: '18 мин', completed: false }
      ]
    },
    {
      id: 'future-ai',
      title: 'Будущее ИИ',
      description: 'Тренды и перспективы развития',
      icon: '🚀',
      lessons: [
        { id: 1, title: 'Текущие тренды в ИИ', duration: '22 мин', completed: false },
        { id: 2, title: 'Перспективы развития ИИ', duration: '25 мин', completed: false },
        { id: 3, title: 'Влияние ИИ на общество', duration: '20 мин', completed: false }
      ]
    }
  ];

  const selectedCourseData = courses.find(course => course.id === selectedCourse);

  return (
    <ProtectedRoute>
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
                  <h1 className="text-3xl font-bold text-white">Курсы</h1>
                  <p className="text-white/70">Выберите направление для изучения</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Course Navigation */}
              <div className="lg:col-span-1">
                <div className="bg-black/20 border border-white/20 rounded-2xl backdrop-blur-sm p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Направления</h3>
                  <div className="space-y-2">
                    {courses.map((course) => (
                      <button
                        key={course.id}
                        onClick={() => setSelectedCourse(course.id)}
                        className={`w-full text-left p-3 rounded-xl transition-colors ${
                          selectedCourse === course.id
                            ? 'bg-white/20 text-white'
                            : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{course.icon}</span>
                          <div>
                            <div className="font-medium">{course.title}</div>
                            <div className="text-xs opacity-70">{course.lessons.length} уроков</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Course Content */}
              <div className="lg:col-span-3">
                {selectedCourseData && (
                  <div className="bg-black/20 border border-white/20 rounded-2xl backdrop-blur-sm p-8">
                    <div className="flex items-center space-x-4 mb-6">
                      <span className="text-4xl">{selectedCourseData.icon}</span>
                      <div>
                        <h2 className="text-2xl font-bold text-white">{selectedCourseData.title}</h2>
                        <p className="text-white/70">{selectedCourseData.description}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white mb-4">Уроки курса</h3>
                      {selectedCourseData.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              lesson.completed 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-white/10 text-white/60'
                            }`}>
                              {lesson.completed ? (
                                <CheckCircle className="w-5 h-5" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                            </div>
                            <div>
                              <h4 className="text-white font-medium">{lesson.title}</h4>
                              <div className="flex items-center space-x-2 text-sm text-white/60">
                                <Clock className="w-4 h-4" />
                                <span>{lesson.duration}</span>
                              </div>
                            </div>
                          </div>
                          <ShinyButton 
                            className={`${
                              lesson.completed 
                                ? 'bg-green-500/20 border-green-500/30 text-green-400' 
                                : 'bg-black/20 border-white/30 text-white'
                            }`}
                          >
                            {lesson.completed ? 'Просмотрено' : 'Начать урок'}
                          </ShinyButton>
                        </div>
                      ))}
                    </div>

                    {/* Course Stats */}
                    <div className="mt-8 pt-6 border-t border-white/10">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">
                            {selectedCourseData.lessons.filter(l => l.completed).length}
                          </div>
                          <div className="text-sm text-white/60">Завершено</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">
                            {selectedCourseData.lessons.length}
                          </div>
                          <div className="text-sm text-white/60">Всего уроков</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">
                            {Math.round((selectedCourseData.lessons.filter(l => l.completed).length / selectedCourseData.lessons.length) * 100)}%
                          </div>
                          <div className="text-sm text-white/60">Прогресс</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
