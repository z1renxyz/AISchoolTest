'use client';

import { useState, useEffect } from 'react';
import { useTelegramAuth } from '@/contexts/TelegramAuthContext';
import { getCourses, createCourse, updateCourse, deleteCourse } from '@/lib/telegram-api';
import { ArrowLeft, Plus, Edit, Trash2, Save, X, BookOpen, Brain, Code, Star, TrendingUp, Users, Globe, Settings, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Waves } from '@/components/ui/wave-background';
import { ShinyButton } from '@/components/ui/shiny-button';

// SVG иконки для выбора
const availableIcons = [
  { name: 'Code', icon: Code, label: 'Код' },
  { name: 'Users', icon: Users, label: 'Пользователи' },
  { name: 'Brain', icon: Brain, label: 'Мозг' },
  { name: 'TrendingUp', icon: TrendingUp, label: 'Рост' },
  { name: 'Globe', icon: Globe, label: 'Глобус' },
  { name: 'Star', icon: Star, label: 'Звезда' },
  { name: 'BookOpen', icon: BookOpen, label: 'Книга' },
  { name: 'Settings', icon: Settings, label: 'Настройки' }
];

export default function AdminPage() {
  const { user, isAdmin, isLoading } = useTelegramAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    icon: 'Code',
    lessons_count: 0,
    duration: '',
    is_active: true
  });

  // Загрузка курсов из БД
  useEffect(() => {
    const loadCourses = async () => {
      try {
        console.log('Loading courses in admin panel...');
        const { data, error } = await getCourses();
        console.log('Courses loaded:', { data, error });
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

  const handleAddCourse = async () => {
    try {
      const { data, error } = await createCourse(newCourse);
      if (error) {
        console.error('Error creating course:', error);
        return;
      }
      
      setCourses([...courses, data]);
      setNewCourse({
        title: '',
        description: '',
        icon: 'Code',
        lessons_count: 0,
        duration: '',
        is_active: true
      });
      setIsAddingCourse(false);
    } catch (error) {
      console.error('Error creating course:', error);
    }
  };

  const handleEditCourse = (course: any) => {
    setEditingCourse(course);
    setNewCourse(course);
    setIsAddingCourse(true);
  };

  const handleUpdateCourse = async () => {
    try {
      const { data, error } = await updateCourse(editingCourse.id, newCourse);
      if (error) {
        console.error('Error updating course:', error);
        return;
      }
      
      setCourses(courses.map(c => 
        c.id === editingCourse.id 
          ? { ...c, ...data }
          : c
      ));
      setEditingCourse(null);
      setNewCourse({
        title: '',
        description: '',
        icon: 'Code',
        lessons_count: 0,
        duration: '',
        is_active: true
      });
      setIsAddingCourse(false);
    } catch (error) {
      console.error('Error updating course:', error);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      const { error } = await deleteCourse(courseId);
      if (error) {
        console.error('Error deleting course:', error);
        return;
      }
      
      setCourses(courses.filter(c => c.id !== courseId));
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  const handleToggleCourseStatus = async (courseId: string) => {
    try {
      const course = courses.find(c => c.id === courseId);
      if (!course) return;
      
      const { data, error } = await updateCourse(courseId, { 
        is_active: !course.is_active 
      });
      
      if (error) {
        console.error('Error toggling course status:', error);
        return;
      }
      
      setCourses(courses.map(c => 
        c.id === courseId ? { ...c, is_active: !c.is_active } : c
      ));
    } catch (error) {
      console.error('Error toggling course status:', error);
    }
  };

  const getIconComponent = (iconName: string) => {
    const iconData = availableIcons.find(icon => icon.name === iconName);
    return iconData ? iconData.icon : Code;
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
              <h1 className="text-3xl font-bold text-white">Админ панель</h1>
              <p className="text-white/70">Управление курсами и уроками</p>
            </div>
          </div>

          {/* Add/Edit Course Form */}
          {isAddingCourse && (
            <div className="bg-black/20 border border-white/20 rounded-2xl backdrop-blur-sm p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  {editingCourse ? 'Редактировать курс' : 'Добавить новый курс'}
                </h2>
                <button
                  onClick={() => {
                    setIsAddingCourse(false);
                    setEditingCourse(null);
                    setNewCourse({
                      title: '',
                      description: '',
                      icon: 'Code',
                      lessons_count: 0,
                      duration: '',
                      is_active: true
                    });
                  }}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Название курса
                  </label>
                  <input
                    type="text"
                    value={newCourse.title}
                    onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-colors"
                    placeholder="Введите название курса"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Количество уроков
                  </label>
                  <input
                    type="number"
                    value={newCourse.lessons_count}
                    onChange={(e) => setNewCourse({...newCourse, lessons_count: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-colors"
                    placeholder="Количество уроков"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Длительность
                  </label>
                  <input
                    type="text"
                    value={newCourse.duration}
                    onChange={(e) => setNewCourse({...newCourse, duration: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-colors"
                    placeholder="Например: 4-6 недель"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Иконка
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {availableIcons.map((iconData) => {
                      const IconComponent = iconData.icon;
                      return (
                        <button
                          key={iconData.name}
                          onClick={() => setNewCourse({...newCourse, icon: iconData.name})}
                          className={`p-3 rounded-xl border transition-colors ${
                            newCourse.icon === iconData.name
                              ? 'bg-white/20 border-white/40'
                              : 'bg-white/10 border-white/20 hover:bg-white/15'
                          }`}
                        >
                          <IconComponent className="w-6 h-6 text-white mx-auto" />
                          <div className="text-xs text-white/70 mt-1">{iconData.label}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-white text-sm font-medium mb-2">
                    Описание
                  </label>
                  <textarea
                    value={newCourse.description}
                    onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-colors"
                    placeholder="Описание курса"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <ShinyButton
                  onClick={() => {
                    setIsAddingCourse(false);
                    setEditingCourse(null);
                    setNewCourse({
                      title: '',
                      description: '',
                      icon: 'Code',
                      lessons_count: 0,
                      duration: '',
                      is_active: true
                    });
                  }}
                  className="bg-red-500/20 border-red-500/30 text-red-400"
                >
                  <X className="w-4 h-4 mr-2" />
                  Отмена
                </ShinyButton>
                <ShinyButton
                  onClick={editingCourse ? handleUpdateCourse : handleAddCourse}
                  className="bg-green-500/20 border-green-500/30 text-green-400"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingCourse ? 'Обновить' : 'Добавить'}
                </ShinyButton>
              </div>
            </div>
          )}

          {/* Courses List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Курсы</h2>
              <ShinyButton
                onClick={() => setIsAddingCourse(true)}
                className="bg-green-500/20 border-green-500/30 text-green-400"
              >
                <Plus className="w-4 h-4 mr-2" />
                Добавить курс
              </ShinyButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => {
                const IconComponent = getIconComponent(course.icon);
                return (
                  <div 
                    key={course.id}
                    className={`p-6 bg-black/20 border rounded-2xl backdrop-blur-sm transition-all duration-300 ${
                      course.is_active 
                        ? 'border-white/20 hover:bg-white/5' 
                        : 'border-red-500/30 bg-red-500/10 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleToggleCourseStatus(course.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            course.is_active 
                              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                              : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                          }`}
                        >
                          {course.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleEditCourse(course)}
                          className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course.id)}
                          className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2">{course.title}</h3>
                    <p className="text-white/70 text-sm mb-4">{course.description}</p>
                    
                    <div className="flex items-center justify-between text-sm text-white/60">
                      <span>{course.lessons_count} уроков</span>
                      <span>{course.duration}</span>
                    </div>

                    <div className="mt-4">
                      <Link href={`/admin/courses/${course.id}/lessons`}>
                        <ShinyButton className="w-full bg-white/10 border-white/20 text-white">
                          Управление уроками
                        </ShinyButton>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
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