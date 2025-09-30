-- Миграция БД для Telegram аутентификации
-- Выполнить в Supabase SQL Editor

-- 1. Создаем таблицу Telegram пользователей
CREATE TABLE IF NOT EXISTS public.telegram_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    telegram_user_id BIGINT UNIQUE NOT NULL,
    username TEXT,
    first_name TEXT,
    last_name TEXT,
    language_code TEXT,
    is_premium BOOLEAN DEFAULT false,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Создаем таблицу сессий для веб-приложения
CREATE TABLE IF NOT EXISTS public.telegram_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    telegram_user_id BIGINT REFERENCES public.telegram_users(telegram_user_id),
    session_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Создаем таблицу курсов (заменяет topics)
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    lessons_count INTEGER DEFAULT 0,
    duration TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Создаем таблицу уроков (заменяет subtopics)
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    type TEXT CHECK (type IN ('video', 'practice', 'reading', 'quiz')),
    duration INTEGER, -- в минутах
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Обновляем таблицу прогресса для Telegram пользователей
ALTER TABLE public.user_progress 
DROP CONSTRAINT IF EXISTS user_progress_user_id_fkey;

ALTER TABLE public.user_progress 
ADD COLUMN IF NOT EXISTS telegram_user_id BIGINT REFERENCES public.telegram_users(telegram_user_id);

-- 6. Включаем RLS для новых таблиц
ALTER TABLE public.telegram_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- 7. Создаем RLS политики для Telegram пользователей
CREATE POLICY "Users can view their own data" ON public.telegram_users
    FOR SELECT USING (telegram_user_id = current_setting('app.current_telegram_user_id')::bigint);

CREATE POLICY "Admins can view all data" ON public.telegram_users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.telegram_users 
            WHERE telegram_user_id = current_setting('app.current_telegram_user_id')::bigint 
            AND is_admin = true
        )
    );

-- 8. Политики для курсов (все могут читать)
CREATE POLICY "Anyone can view courses" ON public.courses
    FOR SELECT USING (true);

-- Только админы могут изменять курсы
CREATE POLICY "Admins can manage courses" ON public.courses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.telegram_users 
            WHERE telegram_user_id = current_setting('app.current_telegram_user_id')::bigint 
            AND is_admin = true
        )
    );

-- 9. Политики для уроков (все могут читать)
CREATE POLICY "Anyone can view lessons" ON public.lessons
    FOR SELECT USING (true);

-- Только админы могут изменять уроки
CREATE POLICY "Admins can manage lessons" ON public.lessons
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.telegram_users 
            WHERE telegram_user_id = current_setting('app.current_telegram_user_id')::bigint 
            AND is_admin = true
        )
    );

-- 10. Обновляем политики для прогресса
DROP POLICY IF EXISTS "Users can view own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can manage own progress" ON public.user_progress;

CREATE POLICY "Users can view own progress" ON public.user_progress
    FOR SELECT USING (telegram_user_id = current_setting('app.current_telegram_user_id')::bigint);

CREATE POLICY "Users can manage own progress" ON public.user_progress
    FOR ALL USING (telegram_user_id = current_setting('app.current_telegram_user_id')::bigint);

-- 11. Вставляем тестовые данные
INSERT INTO public.courses (title, description, icon, lessons_count, duration) VALUES
('ИИ Кодинг', 'Программирование с помощью ИИ', 'Code', 24, '4-6 недель'),
('Промпт-инжиниринг', 'Создание эффективных промптов', 'Zap', 16, '3-4 недели'),
('ИИ для бизнеса', 'Применение ИИ в бизнес-процессах', 'TrendingUp', 20, '5-6 недель'),
('Машинное обучение', 'Основы ML и нейронных сетей', 'Brain', 18, '4-5 недель');

-- 12. Создаем тестового админа (замените на ваш Telegram User ID)
INSERT INTO public.telegram_users (telegram_user_id, first_name, is_admin) VALUES
(123456789, 'Admin User', true);

-- 13. Создаем функцию для установки текущего пользователя
CREATE OR REPLACE FUNCTION public.set_current_telegram_user(user_id BIGINT)
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.current_telegram_user_id', user_id::text, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. Создаем функцию для проверки админ прав
CREATE OR REPLACE FUNCTION public.is_admin(user_id BIGINT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.telegram_users 
        WHERE telegram_user_id = user_id AND is_admin = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

