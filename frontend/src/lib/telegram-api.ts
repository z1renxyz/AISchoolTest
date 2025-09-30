import { createClient } from '@supabase/supabase-js';

// Supabase клиент
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Функция для установки Telegram User ID в RLS
export const setTelegramUserId = async (telegramUserId: number): Promise<void> => {
  try {
    await supabase.rpc('set_telegram_user_id', { user_id: telegramUserId });
  } catch (error) {
    console.error('Error setting Telegram user ID:', error);
  }
};

// Интерфейсы
export interface User {
  id: string;
  telegram_user_id: number;
  username?: string;
  first_name: string;
  last_name?: string;
  language_code?: string;
  is_premium: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string;
  video_url: string;
  lesson_type: 'sprint' | 'archive';
  order_index: number;
  created_at: string;
  updated_at: string;
}

// Функции для работы с курсами
export const getCourses = async (): Promise<{ data: Course[] | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });
    
    return { data, error };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

export const getCourseById = async (courseId: string): Promise<{ data: Course | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();
    
    return { data, error };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

export const createCourse = async (courseData: Omit<Course, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Course | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .insert(courseData)
      .select('*')
      .single();
    
    return { data, error };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

export const updateCourse = async (courseId: string, courseData: Partial<Course>): Promise<{ data: Course | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .update(courseData)
      .eq('id', courseId)
      .select('*')
      .single();
    
    return { data, error };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

export const deleteCourse = async (courseId: string): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId);
    
    return { error };
  } catch (error) {
    return { error: error as Error };
  }
};

// Функции для работы с уроками
export const getLessonsByCourse = async (courseId: string, lessonType?: 'sprint' | 'archive'): Promise<{ data: Lesson[] | null; error: Error | null }> => {
  try {
    let query = supabase
      .from('lessons')
      .select('*')
      .eq('course_id', courseId);
    
    if (lessonType) {
      query = query.eq('lesson_type', lessonType);
    }
    
    const { data, error } = await query.order('order_index', { ascending: true });
    
    return { data, error };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

export const createLesson = async (lessonData: Omit<Lesson, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Lesson | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .insert(lessonData)
      .select('*')
      .single();
    
    return { data, error };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

export const updateLesson = async (lessonId: string, lessonData: Partial<Lesson>): Promise<{ data: Lesson | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .update(lessonData)
      .eq('id', lessonId)
      .select('*')
      .single();
    
    return { data, error };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

export const deleteLesson = async (lessonId: string): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', lessonId);
    
    return { error };
  } catch (error) {
    return { error: error as Error };
  }
};

// Функции для работы с пользователями
export const getUserProfileStats = async (): Promise<{ stats: Record<string, unknown>; error: Error | null }> => {
  try {
    // Здесь можно добавить логику для получения статистики пользователя
    // Пока возвращаем пустую статистику
    return { stats: {}, error: null };
  } catch (error) {
    return { stats: {}, error: error as Error };
  }
};

export const updateUserProfile = async (telegramUserId: number, userData: Partial<User>): Promise<{ data: User | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from('telegram_users')
      .update(userData)
      .eq('telegram_user_id', telegramUserId)
      .select('*')
      .single();
    
    return { data, error };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

export const getUserProgressStats = async (): Promise<{ stats: Record<string, unknown>; error: Error | null }> => {
  try {
    // Здесь можно добавить логику для получения прогресса пользователя
    // Пока возвращаем пустую статистику
    return { stats: {}, error: null };
  } catch (error) {
    return { stats: {}, error: error as Error };
  }
};