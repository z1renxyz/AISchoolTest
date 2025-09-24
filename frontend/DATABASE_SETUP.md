# Настройка базы данных для AI School

## Проблема
Приложение не может подключиться к Supabase из-за отсутствия переменных окружения.

## Решение

### Вариант 1: Использовать существующую базу данных

Если у вас уже есть настроенный проект Supabase:

1. **Создайте файл `.env.local`** в папке `frontend/`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://ваш-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ваш-anon-key
```

2. **Выполните SQL скрипт** `ai_school_database.sql` в SQL Editor вашего проекта Supabase

3. **Создайте админа**:
```sql
SELECT public.make_admin('ваш-email@example.com');
```

### Вариант 2: Создать новый проект Supabase

1. **Создайте новый проект** на [supabase.com](https://supabase.com)

2. **Создайте файл `.env.local`** в папке `frontend/`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://ваш-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ваш-anon-key
```

3. **Выполните SQL скрипт** `ai_school_database.sql` в SQL Editor

4. **Создайте админа**:
```sql
SELECT public.make_admin('ваш-email@example.com');
```

### Вариант 3: Адаптировать существующую базу

Если у вас есть готовая база данных из другого проекта:

1. **Скопируйте переменные окружения** из существующего проекта
2. **Адаптируйте таблицы** под нашу структуру
3. **Обновите RLS политики**

## Структура базы данных

### Таблицы:
- `users` - пользователи системы
- `topics` - темы обучения
- `subtopics` - подтемы/уроки
- `user_progress` - прогресс пользователей
- `user_favorites` - избранные уроки

### Роли:
- `user` - обычный пользователь
- `admin` - администратор (доступ к админ панели)

## После настройки

1. **Перезапустите приложение**:
```bash
npm run dev
```

2. **Проверьте консоль** - не должно быть ошибок "Supabase not configured"

3. **Зарегистрируйтесь** в приложении

4. **Назначьте себя админом** через SQL:
```sql
SELECT public.make_admin('ваш-email@example.com');
```

## Проверка работы

- ✅ Нет ошибок в консоли
- ✅ Регистрация работает
- ✅ Авторизация работает
- ✅ Страницы доступны
- ✅ Админ панель доступна
