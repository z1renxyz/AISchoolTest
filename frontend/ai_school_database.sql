-- База данных для AI School
-- Адаптированная версия для проекта обучения ИИ

-- 1. Создаем таблицу пользователей (адаптируем profiles)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Создаем таблицу тем (topics)
CREATE TABLE IF NOT EXISTS public.topics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT DEFAULT '#3B82F6',
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Создаем таблицу подтем (subtopics)
CREATE TABLE IF NOT EXISTS public.subtopics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Создаем таблицу прогресса пользователей
CREATE TABLE IF NOT EXISTS public.user_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    subtopic_id UUID REFERENCES public.subtopics(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, subtopic_id)
);

-- 5. Создаем таблицу избранного
CREATE TABLE IF NOT EXISTS public.user_favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    subtopic_id UUID REFERENCES public.subtopics(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, subtopic_id)
);

-- 6. Включаем RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtopics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- 7. Создаем политики RLS

-- Политики для users
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Админы могут видеть всех пользователей
CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Политики для topics (все могут читать)
CREATE POLICY "Anyone can view topics" ON public.topics
    FOR SELECT USING (true);

-- Только админы могут изменять темы
CREATE POLICY "Admins can manage topics" ON public.topics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Политики для subtopics (все могут читать)
CREATE POLICY "Anyone can view subtopics" ON public.subtopics
    FOR SELECT USING (true);

-- Только админы могут изменять подтемы
CREATE POLICY "Admins can manage subtopics" ON public.subtopics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Политики для user_progress
CREATE POLICY "Users can view own progress" ON public.user_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own progress" ON public.user_progress
    FOR ALL USING (auth.uid() = user_id);

-- Политики для user_favorites
CREATE POLICY "Users can view own favorites" ON public.user_favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own favorites" ON public.user_favorites
    FOR ALL USING (auth.uid() = user_id);

-- 8. Создаем функцию для автоматического создания профиля пользователя
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        'user'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Создаем триггер для автоматического создания профиля
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. Создаем функцию для назначения админа
CREATE OR REPLACE FUNCTION public.make_admin(user_email TEXT)
RETURNS JSON AS $$
DECLARE
    user_id UUID;
    result JSON;
BEGIN
    -- Находим пользователя по email
    SELECT id INTO user_id FROM auth.users WHERE email = user_email;
    
    IF user_id IS NULL THEN
        RETURN json_build_object('success', false, 'message', 'User not found');
    END IF;
    
    -- Обновляем роль на админ
    UPDATE public.users 
    SET role = 'admin'
    WHERE id = user_id;
    
    RETURN json_build_object('success', true, 'message', 'User promoted to admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Вставляем начальные данные
INSERT INTO public.topics (title, description, icon, color, order_index) VALUES
('Основы ИИ', 'Введение в искусственный интеллект', '🧠', '#3B82F6', 1),
('Машинное обучение', 'Алгоритмы и модели ML', '🤖', '#10B981', 2),
('Нейронные сети', 'Глубокое обучение и нейросети', '🔗', '#8B5CF6', 3),
('Обработка данных', 'Работа с данными для ИИ', '📊', '#F59E0B', 4);

-- 12. Создаем подтемы для первой темы
INSERT INTO public.subtopics (topic_id, title, content, order_index) VALUES
((SELECT id FROM public.topics WHERE title = 'Основы ИИ' LIMIT 1), 
 'Что такое ИИ?', 'Введение в концепции искусственного интеллекта', 1),
((SELECT id FROM public.topics WHERE title = 'Основы ИИ' LIMIT 1), 
 'История развития ИИ', 'От первых идей до современных достижений', 2),
((SELECT id FROM public.topics WHERE title = 'Основы ИИ' LIMIT 1), 
 'Типы ИИ', 'Узкий, общий и сверхинтеллект', 3);

-- 13. Создаем админа (замените email на ваш)
-- Выполните после создания пользователя в Supabase Auth:
-- SELECT public.make_admin('ваш-email@example.com');
