# Настройка переменных окружения

## Проблема
Приложение не может найти переменные Supabase, поэтому использует mock режим.

## Решение

### 1. Создайте файл `.env.local` в папке `frontend/`

Создайте файл с именем `.env.local` в папке `frontend/` и добавьте в него:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ваш-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ваш-anon-key
```

### 2. Получите данные из Supabase

1. Зайдите в ваш проект Supabase
2. Перейдите в Settings → API
3. Скопируйте:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Пример файла `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY5ODc2ODAwMCwiZXhwIjoyMDE0MzQ0MDAwfQ.example
```

### 4. Перезапустите приложение

После создания файла `.env.local` перезапустите приложение:

```bash
npm run dev
```

## Альтернативное решение

Если у вас есть готовая база данных из другого проекта, мы можем адаптировать ее под этот проект.
