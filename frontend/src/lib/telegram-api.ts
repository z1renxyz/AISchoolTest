import { createClient } from '@supabase/supabase-js';
import { getTelegramUserId } from '@/contexts/TelegramAuthContext';

// Supabase клиент
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Типы
export interface TelegramUser {
  id: number;
  username?: string;
  first_name: string;
  last_name?: string;
  language_code?: string;
  is_premium?: boolean;
}

export interface Course {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  lessons_count: number;
  duration?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  content?: string;
  type: 'video' | 'practice' | 'reading' | 'quiz';
  duration?: number; // в минутах
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProgress {
  id: string;
  telegram_user_id: number;
  lesson_id: string;
  is_completed: boolean;
  completed_at?: string;
  progress_percentage: number;
  created_at: string;
  updated_at: string;
}

// Функции для работы с курсами
export const getCourses = async (): Promise<{ data: Course[] | null; error: any }> => {
  try {
    console.log('Fetching courses from Supabase...');
    
    // Сначала устанавливаем текущего пользователя для RLS
    const userId = getTelegramUserId();
    if (userId) {
      await setCurrentUser(userId);
    }
    
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('is_active', true)
      .order('created_at');
    
    console.log('Supabase response:', { data, error });
    
    if (error) {
      console.error('Error fetching courses:', error);
    }
    
    return { data, error };
  } catch (error) {
    console.error('Error fetching courses:', error);
    return { data: null, error };
  }
};

export const getCourseById = async (id: string): Promise<{ data: Course | null; error: any }> => {
  try {
    console.log('Fetching course by ID:', id);
    
    // Сначала устанавливаем текущего пользователя для RLS
    const userId = getTelegramUserId();
    if (userId) {
      await setCurrentUser(userId);
    }
    
    // Пробуем загрузить курс
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        lessons:lessons(*)
      `)
      .eq('id', id)
      .single();
    
    console.log('Course response:', { data, error });
    
    if (error) {
      console.error('Error fetching course:', error);
      // Если курс не найден, попробуем загрузить без RLS
      console.log('Trying to fetch course without RLS...');
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();
      
      console.log('Fallback course response:', { data: fallbackData, error: fallbackError });
      return { data: fallbackData, error: fallbackError };
    }
    
    return { data, error };
  } catch (error) {
    console.error('Error fetching course:', error);
    return { data: null, error };
  }
};

// Функции для работы с уроками
export const getLessonsByCourse = async (courseId: string): Promise<{ data: Lesson[] | null; error: any }> => {
  try {
    console.log('Fetching lessons for course:', courseId);
    
    // Сначала устанавливаем текущего пользователя для RLS
    const userId = getTelegramUserId();
    if (userId) {
      await setCurrentUser(userId);
    }
    
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', courseId)
      .eq('is_active', true)
      .order('order_index');
    
    console.log('Lessons response:', { data, error });
    
    if (error) {
      console.error('Error fetching lessons:', error);
      // Если уроки не найдены, попробуем загрузить без RLS
      console.log('Trying to fetch lessons without RLS...');
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at');
      
      console.log('Fallback lessons response:', { data: fallbackData, error: fallbackError });
      return { data: fallbackData, error: fallbackError };
    }
    
    return { data, error };
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return { data: null, error };
  }
};

// Функции для создания, обновления и удаления уроков
export const createLesson = async (lessonData: any): Promise<{ data: Lesson | null; error: any }> => {
  try {
    console.log('Creating lesson:', lessonData);
    
    // Преобразуем duration из строки в число (минуты)
    let durationMinutes = 0;
    if (lessonData.duration) {
      const durationStr = lessonData.duration.toString();
      const match = durationStr.match(/(\d+)/);
      if (match) {
        durationMinutes = parseInt(match[1]);
      }
    }
    
    // Подготавливаем данные согласно схеме БД
    const insertData = {
      course_id: lessonData.course_id,
      title: lessonData.title,
      description: lessonData.description || '',
      content: '', // Поле content обязательно
      type: lessonData.type || 'video',
      duration: durationMinutes, // INTEGER в минутах
      order_index: 0,
      is_active: lessonData.is_active !== undefined ? lessonData.is_active : true
    };
    
    console.log('Insert data:', insertData);
    
    const { data, error } = await supabase
      .from('lessons')
      .insert(insertData)
      .select()
      .single();
    
    console.log('Create lesson response:', { data, error });
    
    if (error) {
      console.error('Supabase error:', error);
      return { data: null, error };
    }
    
    return { data, error };
  } catch (error) {
    console.error('Error creating lesson:', error);
    return { data: null, error };
  }
};

export const updateLesson = async (id: string, lessonData: any): Promise<{ data: Lesson | null; error: any }> => {
  try {
    console.log('Updating lesson:', id, lessonData);
    
    // Сначала устанавливаем текущего пользователя для RLS
    const userId = getTelegramUserId();
    if (userId) {
      await setCurrentUser(userId);
    }
    
    // Подготавливаем данные для обновления
    const updateData = {
      title: lessonData.title,
      description: lessonData.description,
      duration: lessonData.duration,
      type: lessonData.type,
      is_completed: lessonData.is_completed || false,
      is_locked: lessonData.is_locked || false,
      is_active: lessonData.is_active !== undefined ? lessonData.is_active : true
    };
    
    console.log('Update data:', updateData);
    
    const { data, error } = await supabase
      .from('lessons')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    console.log('Update lesson response:', { data, error });
    
    if (error) {
      console.error('Supabase error:', error);
      return { data: null, error };
    }
    
    return { data, error };
  } catch (error) {
    console.error('Error updating lesson:', error);
    return { data: null, error };
  }
};

export const deleteLesson = async (id: string): Promise<{ error: any }> => {
  try {
    console.log('Deleting lesson:', id);
    
    // Сначала устанавливаем текущего пользователя для RLS
    const userId = getTelegramUserId();
    if (userId) {
      await setCurrentUser(userId);
    }
    
    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', id);
    
    console.log('Delete lesson response:', { error });
    
    return { error };
  } catch (error) {
    console.error('Error deleting lesson:', error);
    return { error };
  }
};

// Функции для работы с прогрессом
export const getUserProgress = async (telegramUserId: number): Promise<{ data: UserProgress[] | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select(`
        *,
        lesson:lessons(*)
      `)
      .eq('telegram_user_id', telegramUserId);
    
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

export const markLessonCompleted = async (
  telegramUserId: number, 
  lessonId: string
): Promise<{ data: UserProgress | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .upsert({
        telegram_user_id: telegramUserId,
        lesson_id: lessonId,
        is_completed: true,
        completed_at: new Date().toISOString(),
        progress_percentage: 100
      })
      .select()
      .single();
    
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

// Функции для админ панели
export const createCourse = async (courseData: Partial<Course>): Promise<{ data: Course | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .insert(courseData)
      .select()
      .single();
    
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

export const updateCourse = async (id: string, courseData: Partial<Course>): Promise<{ data: Course | null; error: any }> => {
  try {
    console.log('Updating course:', id, courseData);
    
    // Сначала устанавливаем текущего пользователя для RLS
    const userId = getTelegramUserId();
    if (userId) {
      await setCurrentUser(userId);
    }
    
    const { data, error } = await supabase
      .from('courses')
      .update(courseData)
      .eq('id', id)
      .select()
      .single();
    
    console.log('Update course response:', { data, error });
    
    return { data, error };
  } catch (error) {
    console.error('Error updating course:', error);
    return { data: null, error };
  }
};

export const deleteCourse = async (id: string): Promise<{ error: any }> => {
  try {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);
    
    return { error };
  } catch (error) {
    return { error };
  }
};



// Функции для работы с Telegram пользователями
export const getTelegramUsers = async (): Promise<{ data: any[] | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('telegram_users')
      .select('*')
      .order('created_at');
    
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

export const updateUserAdminStatus = async (
  telegramUserId: number,
  isAdmin: boolean
): Promise<{ data: any | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('telegram_users')
      .update({ is_admin: isAdmin })
      .eq('telegram_user_id', telegramUserId)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

export const updateUserProfile = async (
  telegramUserId: number,
  profileData: { first_name?: string; username?: string }
): Promise<{ data: any | null; error: any }> => {
  try {
    console.log('Updating user profile:', { telegramUserId, profileData });

    const { data, error } = await supabase
      .from('telegram_users')
      .update({
        first_name: profileData.first_name,
        username: profileData.username,
        updated_at: new Date().toISOString()
      })
      .eq('telegram_user_id', telegramUserId)
      .select()
      .single();

    console.log('Update profile response:', { data, error });

    return { data, error };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { data: null, error };
  }
};

// Функции для статистики профиля
export const getUserProfileStats = async (telegramUserId: number) => {
  try {
    // Получаем прогресс пользователя
    const { data: progressData, error: progressError } = await supabase
      .from('user_progress')
      .select(`
        *,
        lesson:lessons(*)
      `)
      .eq('telegram_user_id', telegramUserId);

    if (progressError) {
      console.error('Error fetching user progress:', progressError);
      return { error: progressError };
    }

    // Получаем данные пользователя
    const { data: userData, error: userError } = await supabase
      .from('telegram_users')
      .select('*')
      .eq('telegram_user_id', telegramUserId)
      .single();

    if (userError) {
      console.error('Error fetching user data:', userError);
      return { error: userError };
    }

    // Рассчитываем статистику
    const completedLessons = progressData?.filter(p => p.is_completed) || [];
    const totalLessons = progressData?.length || 0;
    const totalMinutes = completedLessons.reduce((sum, progress) => {
      return sum + (progress.lesson?.duration || 0);
    }, 0);

    // Подсчитываем достижения
    const achievements = [
      {
        id: 1,
        title: 'Первый урок',
        description: 'Завершили первый урок',
        icon: '🎯',
        earned: completedLessons.length > 0
      },
      {
        id: 2,
        title: 'Неделя обучения',
        description: 'Занимались 7 дней подряд',
        icon: '🔥',
        earned: false // Пока заглушка
      },
      {
        id: 3,
        title: 'Исследователь ИИ',
        description: 'Изучили основы ИИ',
        icon: '🧠',
        earned: false // Пока заглушка
      }
    ];

    return {
      user: userData,
      stats: {
        totalLessons,
        completedLessons: completedLessons.length,
        totalHours: Math.round(totalMinutes / 60),
        completedHours: Math.round(totalMinutes / 60),
        achievements,
        progressPercentage: totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0
      }
    };
  } catch (error) {
    console.error('Error calculating user stats:', error);
    return { error };
  }
};

// Функции для статистики прогресса
export const getUserProgressStats = async (telegramUserId: number) => {
  try {
    // Получаем прогресс пользователя
    const { data: progressData, error: progressError } = await supabase
      .from('user_progress')
      .select(`
        *,
        lesson:lessons(
          *,
          course:courses(*)
        )
      `)
      .eq('telegram_user_id', telegramUserId);

    if (progressError) {
      console.error('Error fetching user progress:', progressError);
      return { error: progressError };
    }

    // Получаем все курсы
    const { data: coursesData, error: coursesError } = await supabase
      .from('courses')
      .select('*');

    if (coursesError) {
      console.error('Error fetching courses:', coursesError);
      return { error: coursesError };
    }

    // Рассчитываем статистику
    const completedLessons = progressData?.filter(p => p.is_completed) || [];
    const totalLessons = progressData?.length || 0;

    // Подсчитываем время обучения в минутах
    const totalMinutes = completedLessons.reduce((sum, progress) => {
      return sum + (progress.lesson?.duration || 0);
    }, 0);

    // Группируем по курсам
    const courseProgressMap = new Map();
    progressData?.forEach(progress => {
      if (progress.lesson?.course) {
        const courseId = progress.lesson.course.id;
        if (!courseProgressMap.has(courseId)) {
          courseProgressMap.set(courseId, {
            name: progress.lesson.course.title,
            totalLessons: 0,
            completedLessons: 0
          });
        }
        courseProgressMap.get(courseId).totalLessons++;
        if (progress.is_completed) {
          courseProgressMap.get(courseId).completedLessons++;
        }
      }
    });

    const courseProgress = Array.from(courseProgressMap.values()).map(course => ({
      name: course.name,
      progress: course.totalLessons > 0 ? Math.round((course.completedLessons / course.totalLessons) * 100) : 0,
      lessons: course.totalLessons,
      completed: course.completedLessons
    }));

    // Подсчитываем недельную активность (заглушка - последние 7 дней)
    const weeklyProgress = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = date.toLocaleLowerCase();
      const dayLessons = progressData?.filter(p => {
        if (p.completed_at) {
          const completedDate = new Date(p.completed_at);
          return completedDate.toDateString() === date.toDateString();
        }
        return false;
      }).length || 0;

      weeklyProgress.push({
        day: dayName,
        lessons: dayLessons,
        completed: dayLessons > 0
      });
    }

    // Получаем достижения
    const achievements = [
      {
        id: 1,
        title: 'Первый урок',
        description: 'Завершили первый урок',
        icon: '🎯',
        earned: completedLessons.length > 0
      },
      {
        id: 2,
        title: 'Неделя обучения',
        description: 'Занимались 7 дней подряд',
        icon: '🔥',
        earned: false // Заглушка для будущей логики
      },
      {
        id: 3,
        title: 'Исследователь ИИ',
        description: 'Изучили основы ИИ',
        icon: '🧠',
        earned: completedLessons.length >= 5 // Заглушка - 5+ уроков
      },
      {
        id: 4,
        title: 'Мастер кодинга',
        description: 'Завершили курс программирования',
        icon: '💻',
        earned: false // Заглушка для будущей логики
      },
      {
        id: 5,
        title: 'Гуру ассистентов',
        description: 'Освоили работу с ИИ-ассистентами',
        icon: '🤖',
        earned: false // Заглушка для будущей логики
      }
    ];

    return {
      stats: {
        totalLessons,
        completedLessons: completedLessons.length,
        totalHours: Math.round(totalMinutes / 60),
        completedHours: Math.round(totalMinutes / 60),
        currentStreak: 0, // Заглушка для будущей логики
        longestStreak: 0, // Заглушка для будущей логики
        overallProgress: totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0,
        achievements,
        weeklyProgress,
        courseProgress
      }
    };
  } catch (error) {
    console.error('Error calculating progress stats:', error);
    return { error };
  }
};
