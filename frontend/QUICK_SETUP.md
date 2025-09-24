# Быстрая настройка Supabase

## 🚀 Пошаговая инструкция

### 1. Создайте проект в Supabase

1. Перейдите на [supabase.com](https://supabase.com)
2. Нажмите "Start your project"
3. Войдите через GitHub или создайте аккаунт
4. Нажмите "New Project"
5. Выберите организацию и введите:
   - **Name**: `AI School Database`
   - **Database Password**: придумайте сложный пароль
   - **Region**: выберите ближайший к вам

### 2. Получите данные проекта

После создания проекта:

1. Перейдите в **Settings** → **API**
2. Скопируйте:
   - **Project URL** (например: `https://abcdefgh.supabase.co`)
   - **anon public** ключ (длинная строка)

### 3. Создайте файл .env.local

Создайте файл `.env.local` в папке `frontend/`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ваш-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ваш-anon-ключ
```

### 4. Создайте таблицы

1. В Supabase перейдите в **SQL Editor**
2. Скопируйте и выполните SQL из файла `SUPABASE_SETUP.md`
3. Нажмите "Run"

### 5. Настройте аутентификацию

1. Перейдите в **Authentication** → **Settings**
2. В разделе **Site URL** добавьте: `http://localhost:3000`
3. В разделе **Redirect URLs** добавьте: `http://localhost:3000/auth/callback`

### 6. Создайте первого админа

В **SQL Editor** выполните:

```sql
-- Замените email на ваш реальный email
INSERT INTO users (email, full_name, role) 
VALUES ('ваш-email@gmail.com', 'Administrator', 'admin');
```

### 7. Перезапустите приложение

```bash
npm run dev
```

## ✅ Готово!

Теперь приложение будет работать с реальной базой данных Supabase!
