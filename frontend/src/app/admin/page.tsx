'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Waves } from '@/components/ui/wave-background';
import { NavBar } from '@/components/ui/tubelight-navbar';
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Home as HomeIcon,
  User,
  TrendingUp,
  Save,
  X
} from 'lucide-react';
import Image from 'next/image';
import { supabase, Topic, Subtopic } from '@/lib/supabase';

export default function AdminPage() {
  const { user, isAuthenticated } = useAuth();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [isEditingTopic, setIsEditingTopic] = useState(false);
  const [isEditingSubtopic, setIsEditingSubtopic] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Partial<Topic>>({});
  const [editingSubtopic, setEditingSubtopic] = useState<Partial<Subtopic>>({});
  const [loading, setLoading] = useState(true);

  const navItems = [
    { name: 'Главная', url: '/', icon: HomeIcon },
    { name: 'Курсы', url: '/courses', icon: BookOpen },
    { name: 'Прогресс', url: '/progress', icon: TrendingUp },
    { name: 'Профиль', url: '/profile', icon: User }
  ];

  // Загрузка данных
  useEffect(() => {
    loadTopics();
  }, []);

  useEffect(() => {
    if (selectedTopic) {
      loadSubtopics(selectedTopic);
    }
  }, [selectedTopic]);

  // Проверяем права администратора
  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="relative w-full min-h-screen">
        <Waves 
          backgroundColor="#000000" 
          strokeColor="#ffffff"
          pointerSize={0.3}
          className="fixed inset-0 -z-10"
        />
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
        <main className="relative z-10 w-full min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Доступ запрещен
            </h1>
            <p className="text-lg text-white/70">
              У вас нет прав для доступа к админ-панели
            </p>
          </div>
        </main>
      </div>
    );
  }

  const loadTopics = async () => {
    try {
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .order('order_index');

      if (error) throw error;
      setTopics(data || []);
    } catch (error) {
      console.error('Error loading topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubtopics = async (topicId: string) => {
    try {
      const { data, error } = await supabase
        .from('subtopics')
        .select('*')
        .eq('topic_id', topicId)
        .order('order_index');

      if (error) throw error;
      setSubtopics(data || []);
    } catch (error) {
      console.error('Error loading subtopics:', error);
    }
  };

  const createTopic = async () => {
    try {
      const { data, error } = await supabase
        .from('topics')
        .insert({
          title: 'Новая тема',
          description: '',
          icon: 'BookOpen',
          color: 'blue',
          order_index: topics.length
        })
        .select()
        .single();

      if (error) throw error;
      setTopics([...topics, data]);
    } catch (error) {
      console.error('Error creating topic:', error);
    }
  };

  const updateTopic = async (id: string, updates: Partial<Topic>) => {
    try {
      const { error } = await supabase
        .from('topics')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      setTopics(topics.map(topic => 
        topic.id === id ? { ...topic, ...updates } : topic
      ));
      setIsEditingTopic(false);
      setEditingTopic({});
    } catch (error) {
      console.error('Error updating topic:', error);
    }
  };

  const deleteTopic = async (id: string) => {
    try {
      const { error } = await supabase
        .from('topics')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setTopics(topics.filter(topic => topic.id !== id));
    } catch (error) {
      console.error('Error deleting topic:', error);
    }
  };

  const createSubtopic = async () => {
    if (!selectedTopic) return;

    try {
      const { data, error } = await supabase
        .from('subtopics')
        .insert({
          topic_id: selectedTopic,
          title: 'Новый урок',
          content: '',
          order_index: subtopics.length
        })
        .select()
        .single();

      if (error) throw error;
      setSubtopics([...subtopics, data]);
    } catch (error) {
      console.error('Error creating subtopic:', error);
    }
  };

  const updateSubtopic = async (id: string, updates: Partial<Subtopic>) => {
    try {
      const { error } = await supabase
        .from('subtopics')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      setSubtopics(subtopics.map(subtopic => 
        subtopic.id === id ? { ...subtopic, ...updates } : subtopic
      ));
      setIsEditingSubtopic(false);
      setEditingSubtopic({});
    } catch (error) {
      console.error('Error updating subtopic:', error);
    }
  };

  const deleteSubtopic = async (id: string) => {
    try {
      const { error } = await supabase
        .from('subtopics')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setSubtopics(subtopics.filter(subtopic => subtopic.id !== id));
    } catch (error) {
      console.error('Error deleting subtopic:', error);
    }
  };

  if (loading) {
    return (
      <div className="relative w-full min-h-screen">
        <Waves 
          backgroundColor="#000000" 
          strokeColor="#ffffff"
          pointerSize={0.3}
          className="fixed inset-0 -z-10"
        />
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
        <main className="relative z-10 w-full min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Загрузка...
            </h1>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen">
      <Waves 
        backgroundColor="#000000" 
        strokeColor="#ffffff"
        pointerSize={0.3}
        className="fixed inset-0 -z-10"
      />

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

      <main className="relative z-10 w-full min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              Админ-панель
            </h1>
            <p className="text-white/70">
              Управление темами и уроками
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Topics Section */}
            <div className="bg-black/20 border border-white/20 rounded-2xl backdrop-blur-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Темы</h2>
                <button
                  onClick={createTopic}
                  className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Добавить</span>
                </button>
              </div>

              <div className="space-y-3">
                {topics.map((topic) => (
                  <div key={topic.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                    {isEditingTopic && editingTopic.id === topic.id ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editingTopic.title || topic.title}
                          onChange={(e) => setEditingTopic({...editingTopic, title: e.target.value})}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60"
                          placeholder="Название темы"
                        />
                        <textarea
                          value={editingTopic.description || topic.description || ''}
                          onChange={(e) => setEditingTopic({...editingTopic, description: e.target.value})}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60"
                          placeholder="Описание темы"
                          rows={2}
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => updateTopic(topic.id, editingTopic)}
                            className="px-3 py-1 bg-green-500/20 border border-green-500/30 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors flex items-center space-x-1"
                          >
                            <Save className="w-4 h-4" />
                            <span>Сохранить</span>
                          </button>
                          <button
                            onClick={() => {
                              setIsEditingTopic(false);
                              setEditingTopic({});
                            }}
                            className="px-3 py-1 bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors flex items-center space-x-1"
                          >
                            <X className="w-4 h-4" />
                            <span>Отмена</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div 
                          className="flex-1 cursor-pointer"
                          onClick={() => setSelectedTopic(topic.id)}
                        >
                          <h3 className="text-white font-semibold">{topic.title}</h3>
                          <p className="text-white/60 text-sm">{topic.description}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setIsEditingTopic(true);
                              setEditingTopic(topic);
                            }}
                            className="p-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteTopic(topic.id)}
                            className="p-2 bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Subtopics Section */}
            <div className="bg-black/20 border border-white/20 rounded-2xl backdrop-blur-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Уроки</h2>
                {selectedTopic && (
                  <button
                    onClick={createSubtopic}
                    className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Добавить</span>
                  </button>
                )}
              </div>

              {selectedTopic ? (
                <div className="space-y-3">
                  {subtopics.map((subtopic) => (
                    <div key={subtopic.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                      {isEditingSubtopic && editingSubtopic.id === subtopic.id ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={editingSubtopic.title || subtopic.title}
                            onChange={(e) => setEditingSubtopic({...editingSubtopic, title: e.target.value})}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60"
                            placeholder="Название урока"
                          />
                          <textarea
                            value={editingSubtopic.content || subtopic.content}
                            onChange={(e) => setEditingSubtopic({...editingSubtopic, content: e.target.value})}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60"
                            placeholder="Содержание урока"
                            rows={3}
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={() => updateSubtopic(subtopic.id, editingSubtopic)}
                              className="px-3 py-1 bg-green-500/20 border border-green-500/30 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors flex items-center space-x-1"
                            >
                              <Save className="w-4 h-4" />
                              <span>Сохранить</span>
                            </button>
                            <button
                              onClick={() => {
                                setIsEditingSubtopic(false);
                                setEditingSubtopic({});
                              }}
                              className="px-3 py-1 bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors flex items-center space-x-1"
                            >
                              <X className="w-4 h-4" />
                              <span>Отмена</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-white font-semibold">{subtopic.title}</h3>
                            <p className="text-white/60 text-sm">{subtopic.content}</p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setIsEditingSubtopic(true);
                                setEditingSubtopic(subtopic);
                              }}
                              className="p-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteSubtopic(subtopic.id)}
                              className="p-2 bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-white/60">Выберите тему для просмотра уроков</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
