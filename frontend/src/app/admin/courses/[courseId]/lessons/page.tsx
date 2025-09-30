'use client';

import { useState, useEffect, use } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, Save, X, Play, Code, BookOpen, HelpCircle, Clock, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Waves } from '@/components/ui/wave-background';
import { ShinyButton } from '@/components/ui/shiny-button';
import { getCourseById, getLessonsByCourse, createLesson, updateLesson, deleteLesson } from '@/lib/telegram-api';
import { getTelegramUserId } from '@/contexts/TelegramAuthContext';

// Типы уроков
const lessonTypes = [
  { value: 'video', label: 'Видео', icon: Play },
  { value: 'practice', label: 'Практика', icon: Code },
  { value: 'reading', label: 'Чтение', icon: BookOpen },
  { value: 'quiz', label: 'Тест', icon: HelpCircle }
];

export default function CourseLessonsPage({ params }: { params: Promise<{ courseId: string }> }) {
  const resolvedParams = use(params);
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [newLesson, setNewLesson] = useState({
    title: '',
    description: '',
    duration: '',
    type: 'video',
    is_active: true
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        console.log('Loading course and lessons for ID:', resolvedParams.courseId);
        
        // Сначала попробуем загрузить курс без RLS
        const { data: courseData, error: courseError } = await getCourseById(resolvedParams.courseId);
        console.log('Course data:', { courseData, courseError });
        
        if (courseError) {
          console.error('Error loading course:', courseError);
          // Если курс не найден, попробуем создать тестовый курс
          console.log('Creating fallback course data');
          setCourse({
            id: resolvedParams.courseId,
            title: 'Тестовый курс',
            description: 'Описание тестового курса',
            icon: 'Code',
            lessons_count: 0,
            duration: '4-6 недель',
            is_active: true
          });
        } else {
          setCourse(courseData);
        }

        // Загружаем уроки
        const { data: lessonsData, error: lessonsError } = await getLessonsByCourse(resolvedParams.courseId);
        console.log('Lessons data:', { lessonsData, lessonsError });
        if (lessonsError) {
          console.error('Error loading lessons:', lessonsError);
          setLessons([]);
        } else {
          setLessons(lessonsData || []);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        // Создаем fallback данные
        setCourse({
          id: resolvedParams.courseId,
          title: 'Тестовый курс',
          description: 'Описание тестового курса',
          icon: 'Code',
          lessons_count: 0,
          duration: '4-6 недель',
          is_active: true
        });
        setLessons([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [resolvedParams.courseId]);

  const handleAddLesson = async () => {
    try {
      console.log('Adding lesson:', newLesson);
      const { data, error } = await createLesson({
        ...newLesson,
        course_id: resolvedParams.courseId
      });
      
      if (error) {
        console.error('Error creating lesson:', error);
        return;
      }
      
      setLessons([...lessons, data]);
      setNewLesson({
        title: '',
        description: '',
        duration: '',
        type: 'video',
        is_active: true
      });
      setIsAddingLesson(false);
    } catch (error) {
      console.error('Error adding lesson:', error);
    }
  };

  const handleEditLesson = (lesson: any) => {
    setEditingLesson(lesson);
    setNewLesson({
      title: lesson.title,
      description: lesson.description,
      duration: lesson.duration,
      type: lesson.type,
      is_active: lesson.is_active
    });
    setIsAddingLesson(true);
  };

  const handleUpdateLesson = async () => {
    try {
      console.log('Updating lesson:', editingLesson.id, newLesson);
      const { data, error } = await updateLesson(editingLesson.id, newLesson);
      
      if (error) {
        console.error('Error updating lesson:', error);
        return;
      }
      
      setLessons(lessons.map(l => l.id === editingLesson.id ? data : l));
      setEditingLesson(null);
      setNewLesson({
        title: '',
        description: '',
        duration: '',
        type: 'video',
        is_active: true
      });
      setIsAddingLesson(false);
    } catch (error) {
      console.error('Error updating lesson:', error);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    try {
      console.log('Deleting lesson:', lessonId);
      const { error } = await deleteLesson(lessonId);
      
      if (error) {
        console.error('Error deleting lesson:', error);
        return;
      }
      
      setLessons(lessons.filter(l => l.id !== lessonId));
    } catch (error) {
      console.error('Error deleting lesson:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    const typeData = lessonTypes.find(t => t.value === type);
    return typeData ? typeData.icon : Play;
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
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-6 mb-8">
            <Link href="/admin">
              <ShinyButton className="bg-black/20 border-white/30 text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад
              </ShinyButton>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Управление уроками</h1>
              <p className="text-white/70">{course.title}</p>
            </div>
          </div>

          {/* Add/Edit Lesson Form */}
          {isAddingLesson && (
            <div className="bg-black/20 border border-white/20 rounded-2xl backdrop-blur-sm p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  {editingLesson ? 'Редактировать урок' : 'Добавить новый урок'}
                </h2>
                <button
                  onClick={() => {
                    setIsAddingLesson(false);
                    setEditingLesson(null);
      setNewLesson({
        title: '',
        description: '',
        duration: '',
        type: 'video',
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
                    Название урока
                  </label>
                  <input
                    type="text"
                    value={newLesson.title}
                    onChange={(e) => setNewLesson({...newLesson, title: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-colors"
                    placeholder="Введите название урока"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Длительность
                  </label>
                  <input
                    type="text"
                    value={newLesson.duration}
                    onChange={(e) => setNewLesson({...newLesson, duration: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-colors"
                    placeholder="Например: 45 мин"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Тип урока
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {lessonTypes.map((typeData) => {
                      const IconComponent = typeData.icon;
                      return (
                        <button
                          key={typeData.value}
                          onClick={() => setNewLesson({...newLesson, type: typeData.value})}
                          className={`p-3 rounded-xl border transition-colors ${
                            newLesson.type === typeData.value
                              ? 'bg-white/20 border-white/40'
                              : 'bg-white/10 border-white/20 hover:bg-white/15'
                          }`}
                        >
                          <IconComponent className="w-5 h-5 text-white mx-auto mb-1" />
                          <div className="text-xs text-white/70">{typeData.label}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Статус
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newLesson.is_active}
                        onChange={(e) => setNewLesson({...newLesson, is_active: e.target.checked})}
                        className="w-4 h-4 text-blue-500 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                      />
                      <span className="text-white text-sm">Активен</span>
                    </label>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-white text-sm font-medium mb-2">
                    Описание
                  </label>
                  <textarea
                    value={newLesson.description}
                    onChange={(e) => setNewLesson({...newLesson, description: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-colors"
                    placeholder="Описание урока"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <ShinyButton
                  onClick={() => {
                    setIsAddingLesson(false);
                    setEditingLesson(null);
      setNewLesson({
        title: '',
        description: '',
        duration: '',
        type: 'video',
        is_active: true
      });
                  }}
                  className="bg-red-500/20 border-red-500/30 text-red-400"
                >
                  <X className="w-4 h-4 mr-2" />
                  Отмена
                </ShinyButton>
                <ShinyButton
                  onClick={editingLesson ? handleUpdateLesson : handleAddLesson}
                  className="bg-green-500/20 border-green-500/30 text-green-400"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingLesson ? 'Обновить' : 'Добавить'}
                </ShinyButton>
              </div>
            </div>
          )}

          {/* Lessons List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Уроки курса</h2>
              <ShinyButton
                onClick={() => setIsAddingLesson(true)}
                className="bg-green-500/20 border-green-500/30 text-green-400"
              >
                <Plus className="w-4 h-4 mr-2" />
                Добавить урок
              </ShinyButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lessons.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <div className="text-white/60">Уроки не найдены</div>
                </div>
              ) : (
                lessons.map((lesson, index) => {
                  const TypeIcon = getTypeIcon(lesson.type);
                  return (
                    <div 
                      key={lesson.id}
                      className={`p-6 bg-black/20 border rounded-2xl backdrop-blur-sm transition-all duration-300 ${
                        lesson.is_active
                          ? 'border-white/20 hover:bg-white/5'
                          : 'border-gray-500/30 bg-gray-500/10 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-sm border ${
                          lesson.is_active
                            ? 'bg-white/10 border-white/20'
                            : 'bg-gray-500/20 border-gray-500/30'
                        }`}>
                          <TypeIcon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditLesson(lesson)}
                            className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteLesson(lesson.id)}
                            className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-white mb-2">
                        {lesson.title}
                      </h3>
                      <p className="text-white/70 text-sm mb-4">
                        {lesson.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-white/60 mb-4">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{lesson.duration}</span>
                        </span>
                        <span>•</span>
                        <span className="capitalize">{lesson.type}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span>Урок {index + 1}</span>
                        <div className="flex space-x-2">
                          {lesson.is_active ? (
                            <span className="text-blue-400">● Активен</span>
                          ) : (
                            <span className="text-gray-400">○ Неактивен</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
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
      </div>
    </div>
  );
}