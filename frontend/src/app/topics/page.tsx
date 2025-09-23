'use client';

import { useState } from 'react';
import { Brain, Code, Globe, Smartphone, ArrowLeft, Play, Star, Clock, Users, Home as HomeIcon, BookOpen, TrendingUp, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Waves } from '@/components/ui/wave-background';
import { GlowCard } from '@/components/ui/spotlight-card';
import { ShinyButton } from '@/components/ui/shiny-button';
import { NavBar } from '@/components/ui/tubelight-navbar';

export default function TopicsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'Все курсы', count: 25 },
    { id: 'ai', name: 'Искусственный интеллект', count: 8 },
    { id: 'programming', name: 'Программирование', count: 10 },
    { id: 'web', name: 'Веб-технологии', count: 5 },
    { id: 'mobile', name: 'Мобильная разработка', count: 2 }
  ];

  const courses = [
    {
      id: 1,
      title: 'Основы искусственного интеллекта',
      description: 'Изучите основы машинного обучения, нейронных сетей и современных алгоритмов ИИ',
      category: 'ai',
      icon: Brain,
      level: 'Начальный',
      duration: '4-6 недель',
      lessons: 24,
      students: 1234,
      rating: 4.9,
      color: 'blue',
      topics: ['Машинное обучение', 'Нейронные сети', 'Обработка данных', 'Python для ИИ']
    },
    {
      id: 2,
      title: 'Python для начинающих',
      description: 'Полный курс программирования на Python с нуля до создания реальных проектов',
      category: 'programming',
      icon: Code,
      level: 'Начальный',
      duration: '6-8 недель',
      lessons: 32,
      students: 2156,
      rating: 4.8,
      color: 'green',
      topics: ['Синтаксис Python', 'ООП', 'Работа с данными', 'Веб-скрапинг']
    },
    {
      id: 3,
      title: 'Веб-разработка с React',
      description: 'Создание современных веб-приложений с использованием React и Next.js',
      category: 'web',
      icon: Globe,
      level: 'Средний',
      duration: '8-10 недель',
      lessons: 40,
      students: 892,
      rating: 4.9,
      color: 'purple',
      topics: ['React Hooks', 'Next.js', 'TypeScript', 'State Management']
    },
    {
      id: 4,
      title: 'Глубокое обучение и нейронные сети',
      description: 'Продвинутый курс по глубокому обучению с практическими проектами',
      category: 'ai',
      icon: Brain,
      level: 'Продвинутый',
      duration: '10-12 недель',
      lessons: 48,
      students: 567,
      rating: 4.9,
      color: 'blue',
      topics: ['CNN', 'RNN', 'Transformers', 'Computer Vision']
    },
    {
      id: 5,
      title: 'JavaScript: от основ до продвинутого',
      description: 'Полное изучение JavaScript, включая ES6+, асинхронность и современные паттерны',
      category: 'programming',
      icon: Code,
      level: 'Средний',
      duration: '7-9 недель',
      lessons: 36,
      students: 1456,
      rating: 4.7,
      color: 'orange',
      topics: ['ES6+', 'Async/Await', 'DOM', 'Node.js основы']
    },
    {
      id: 6,
      title: 'React Native разработка',
      description: 'Создание мобильных приложений для iOS и Android с React Native',
      category: 'mobile',
      icon: Smartphone,
      level: 'Средний',
      duration: '6-8 недель',
      lessons: 30,
      students: 423,
      rating: 4.6,
      color: 'red',
      topics: ['React Native', 'Navigation', 'Native Modules', 'Expo']
    }
  ];

  const filteredCourses = selectedCategory === 'all' 
    ? courses 
    : courses.filter(course => course.category === selectedCategory);

  return (
    <Waves 
      backgroundColor="#000000" 
      strokeColor="#ffffff"
      pointerSize={0.3}
    >
      {/* Navigation */}
      <NavBar 
        items={[
          { name: 'Главная', url: '/', icon: HomeIcon },
          { name: 'Курсы', url: '/topics', icon: BookOpen },
          { name: 'Прогресс', url: '#', icon: TrendingUp },
          { name: 'Профиль', url: '#', icon: User }
        ]} 
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

      <main className="relative z-10 w-full min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Categories Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 backdrop-blur-sm ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-50/80 dark:hover:bg-slate-700/80'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredCourses.map((course) => (
            <GlowCard
              key={course.id}
              glowColor={course.color as any}
              customSize
              className="w-full min-h-96 p-6"
            >
              <div className="h-full flex flex-col">
                {/* Course Info */}
                <div className="flex items-start space-x-4 mb-4">
                  <div className={`w-16 h-16 bg-${course.color}-500 rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <course.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-block px-3 py-1 text-sm font-medium bg-slate-100/80 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 rounded-full">
                        {course.level}
                      </span>
                      <div className="flex items-center text-sm text-yellow-500">
                        <Star className="w-4 h-4 mr-1 fill-current" />
                        {course.rating}
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                      {course.title}
                    </h3>
                  </div>
                </div>

                {/* Description */}
                <p className="text-slate-600 dark:text-slate-400 mb-4 flex-grow">
                  {course.description}
                </p>

                {/* Topics */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-2">
                    Что изучите:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {course.topics.map((topic, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-slate-100/80 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 rounded-md backdrop-blur-sm"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-6">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {course.duration}
                  </div>
                  <div className="flex items-center">
                    <Play className="w-4 h-4 mr-1" />
                    {course.lessons} уроков
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {course.students.toLocaleString()}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3">
                  <ShinyButton className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-none">
                    <Play className="w-4 h-4 mr-2" />
                    Начать курс
                  </ShinyButton>
                  <button className="p-3 border border-slate-300/50 dark:border-slate-600/50 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors backdrop-blur-sm">
                    <Star className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </GlowCard>
          ))}
        </div>

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <GlowCard glowColor="blue" customSize className="w-96 h-64 mx-auto p-8">
              <div className="h-full flex flex-col justify-center items-center">
                <Brain className="w-16 h-16 text-slate-400 mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Курсы не найдены
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  В этой категории пока нет доступных курсов
                </p>
              </div>
            </GlowCard>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-12">
          <GlowCard glowColor="orange" customSize className="w-full h-48 p-8">
            <div className="h-full flex flex-col justify-center items-center text-center">
              <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
                Не нашли подходящий курс?
              </h2>
              <p className="text-lg mb-6 opacity-90 text-slate-600 dark:text-slate-400">
                Напишите нам, и мы создадим курс специально для ваших потребностей
              </p>
              <ShinyButton className="bg-gradient-to-r from-orange-500 to-red-600 text-white border-none">
                Связаться с нами
              </ShinyButton>
            </div>
          </GlowCard>
        </div>
        </div>
      </main>
    </Waves>
  );
}