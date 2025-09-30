-- Настройка RLS политик для Telegram Web App авторизации

-- 1. Включаем RLS для всех таблиц
ALTER TABLE telegram_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- 2. Удаляем старые политики (если есть)
DROP POLICY IF EXISTS "Users can view their own data" ON telegram_users;
DROP POLICY IF EXISTS "Users can update their own data" ON telegram_users;
DROP POLICY IF EXISTS "Users can insert their own data" ON telegram_users;
DROP POLICY IF EXISTS "Allow all operations on telegram_users" ON telegram_users;

-- 3. Политики для telegram_users
-- Пользователи могут читать свои данные
CREATE POLICY "Users can read their own data" ON telegram_users
  FOR SELECT USING (telegram_user_id = current_setting('app.telegram_user_id', true)::bigint);

-- Пользователи могут обновлять свои данные
CREATE POLICY "Users can update their own data" ON telegram_users
  FOR UPDATE USING (telegram_user_id = current_setting('app.telegram_user_id', true)::bigint);

-- Разрешаем создание новых пользователей
CREATE POLICY "Allow user creation" ON telegram_users
  FOR INSERT WITH CHECK (true);

-- 4. Политики для courses
-- Все могут читать курсы
CREATE POLICY "Anyone can read courses" ON courses
  FOR SELECT USING (true);

-- Только админы могут изменять курсы
CREATE POLICY "Admins can modify courses" ON courses
  FOR ALL USING (
    current_setting('app.telegram_user_id', true)::bigint IN (
      SELECT telegram_user_id FROM telegram_users WHERE is_admin = true
    )
  );

-- 5. Политики для lessons
-- Все могут читать уроки
CREATE POLICY "Anyone can read lessons" ON lessons
  FOR SELECT USING (true);

-- Только админы могут изменять уроки
CREATE POLICY "Admins can modify lessons" ON lessons
  FOR ALL USING (
    current_setting('app.telegram_user_id', true)::bigint IN (
      SELECT telegram_user_id FROM telegram_users WHERE is_admin = true
    )
  );

-- 6. Создаем функцию для установки Telegram User ID
CREATE OR REPLACE FUNCTION set_telegram_user_id(user_id bigint)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.telegram_user_id', user_id::text, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Проверяем, что политики созданы
SELECT 'RLS policies created successfully' as status;
