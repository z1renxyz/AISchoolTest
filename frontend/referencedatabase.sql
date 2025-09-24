-- Полное исправление RLS политик для PCRepairPro
-- Выполните этот скрипт в SQL Editor в Supabase

-- 1. Отключаем RLS временно для исправления
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;

-- 2. Удаляем ВСЕ существующие политики (включая те, которые могут быть)
-- Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Repair requests
DROP POLICY IF EXISTS "Users can view own requests" ON public.repair_requests;
DROP POLICY IF EXISTS "Users can create requests" ON public.repair_requests;
DROP POLICY IF EXISTS "Admins can view all requests" ON public.repair_requests;
DROP POLICY IF EXISTS "Admins can update all requests" ON public.repair_requests;
DROP POLICY IF EXISTS "Authenticated users can view requests" ON public.repair_requests;
DROP POLICY IF EXISTS "Authenticated users can update requests" ON public.repair_requests;

-- Reviews
DROP POLICY IF EXISTS "Users can view all reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can delete own reviews" ON public.reviews;

-- 3. Включаем RLS обратно
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 4. Создаем простые политики без рекурсии
-- Политики для profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Разрешаем всем аутентифицированным пользователям читать профили (для админ панели)
CREATE POLICY "Authenticated users can view profiles" ON public.profiles
    FOR SELECT USING (auth.role() = 'authenticated');

-- Политики для repair_requests
CREATE POLICY "Users can view own requests" ON public.repair_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create requests" ON public.repair_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Разрешаем всем аутентифицированным пользователям читать заявки (для админ панели)
CREATE POLICY "Authenticated users can view requests" ON public.repair_requests
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update requests" ON public.repair_requests
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Политики для reviews
CREATE POLICY "Users can view all reviews" ON public.reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON public.reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON public.reviews
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews" ON public.reviews
    FOR DELETE USING (auth.uid() = user_id);

-- 5. Обновляем функцию для создания профиля
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, first_name, last_name, phone, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'user')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Обновляем триггер
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Создаем функцию для создания админ профиля
CREATE OR REPLACE FUNCTION public.create_admin_profile(
    user_id UUID,
    user_email TEXT,
    user_first_name TEXT,
    user_last_name TEXT,
    user_phone TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    -- Вставляем профиль админа
    INSERT INTO public.profiles (
        id,
        email,
        first_name,
        last_name,
        phone,
        role
    ) VALUES (
        user_id,
        user_email,
        user_first_name,
        user_last_name,
        user_phone,
        'admin'
    );
    
    -- Возвращаем созданный профиль
    SELECT json_build_object(
        'id', p.id,
        'email', p.email,
        'first_name', p.first_name,
        'last_name', p.last_name,
        'phone', p.phone,
        'role', p.role,
        'created_at', p.created_at
    ) INTO result
    FROM public.profiles p
    WHERE p.id = user_id;
    
    RETURN result;
EXCEPTION
    WHEN unique_violation THEN
        -- Если профиль уже существует, обновляем роль на админ
        UPDATE public.profiles 
        SET role = 'admin'
        WHERE id = user_id;
        
        SELECT json_build_object(
            'id', p.id,
            'email', p.email,
            'first_name', p.first_name,
            'last_name', p.last_name,
            'phone', p.phone,
            'role', p.role,
            'created_at', p.created_at,
            'message', 'Profile updated to admin'
        ) INTO result
        FROM public.profiles p
        WHERE p.id = user_id;
        
        RETURN result;
    WHEN OTHERS THEN
        RETURN json_build_object('error', SQLERRM);
END;
$$;

-- 8. Даем права на выполнение функции
GRANT EXECUTE ON FUNCTION public.create_admin_profile(UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_admin_profile(UUID, TEXT, TEXT, TEXT, TEXT) TO anon;

-- Готово! Теперь все RLS политики исправлены и функция админа создана.

-- 9. Функция для безопасной проверки существования пользователя по email
-- Не раскрывает данные профиля, лишь возвращает boolean. SECURITY DEFINER позволяет выполнять при роли anon
CREATE OR REPLACE FUNCTION public.user_exists(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.profiles p WHERE p.email = user_email
  );
$$;

GRANT EXECUTE ON FUNCTION public.user_exists(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.user_exists(TEXT) TO authenticated;