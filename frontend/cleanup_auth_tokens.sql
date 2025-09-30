-- Удаление таблицы auth_tokens и связанных данных
-- ВНИМАНИЕ: Это удалит все токены авторизации!

-- Удаляем таблицу auth_tokens
DROP TABLE IF EXISTS auth_tokens CASCADE;

-- Проверяем, что таблица удалена
SELECT 'auth_tokens table removed successfully' as status;
