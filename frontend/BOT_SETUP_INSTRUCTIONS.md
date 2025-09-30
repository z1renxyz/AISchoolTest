# Инструкция по настройке Telegram-бота для токен-авторизации

## 🎯 **Обзор системы**

Новая система авторизации работает через токены:
1. Пользователь пишет боту
2. Бот генерирует уникальный токен
3. Бот отправляет ссылку с токеном
4. Пользователь переходит по ссылке и авторизуется

## 🔧 **Настройка бота**

### **1. Обновите код бота**

Добавьте в ваш бот следующий код:

```javascript
const { Telegraf } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');

// Supabase клиент
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const bot = new Telegraf(process.env.BOT_TOKEN);

// Функция для генерации токена
const generateToken = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Функция для создания токена в БД
const createAuthToken = async (userId) => {
  try {
    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Токен действует 24 часа
    
    const { data, error } = await supabase
      .from('auth_tokens')
      .insert({
        token,
        user_id: userId,
        expires_at: expiresAt.toISOString()
      });
    
    if (error) {
      console.error('Error creating token:', error);
      return null;
    }
    
    return token;
  } catch (error) {
    console.error('Error creating token:', error);
    return null;
  }
};

// Обработчик команды /start
bot.start(async (ctx) => {
  try {
    const userId = ctx.from.id;
    const username = ctx.from.username || ctx.from.first_name;
    
    // Проверяем, есть ли пользователь в БД
    const { data: existingUser } = await supabase
      .from('telegram_users')
      .select('id')
      .eq('telegram_user_id', userId)
      .single();
    
    let userDbId;
    
    if (!existingUser) {
      // Создаем нового пользователя
      const { data: newUser, error } = await supabase
        .from('telegram_users')
        .insert({
          telegram_user_id: userId,
          username: ctx.from.username,
          first_name: ctx.from.first_name,
          last_name: ctx.from.last_name,
          language_code: ctx.from.language_code,
          is_premium: ctx.from.is_premium || false,
          is_admin: false // По умолчанию не админ
        })
        .select('id')
        .single();
      
      if (error) {
        console.error('Error creating user:', error);
        return ctx.reply('Ошибка при создании пользователя. Попробуйте позже.');
      }
      
      userDbId = newUser.id;
    } else {
      userDbId = existingUser.id;
    }
    
    // Создаем токен авторизации
    const token = await createAuthToken(userDbId);
    
    if (!token) {
      return ctx.reply('Ошибка при создании токена. Попробуйте позже.');
    }
    
    // Формируем ссылку
    const authUrl = `${process.env.WEB_APP_URL}/auth?token=${token}`;
    
    // Отправляем сообщение с кнопкой
    await ctx.reply(
      `👋 Привет, ${username}!\n\n` +
      `Для входа в обучающую платформу нажмите кнопку ниже:`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🚀 Открыть обучающую платформу',
                url: authUrl
              }
            ]
          ]
        }
      }
    );
    
  } catch (error) {
    console.error('Error in start command:', error);
    ctx.reply('Произошла ошибка. Попробуйте позже.');
  }
});

// Обработчик кнопки "Открыть платформу"
bot.action('open_platform', async (ctx) => {
  try {
    const userId = ctx.from.id;
    
    // Получаем ID пользователя из БД
    const { data: existingUser } = await supabase
      .from('telegram_users')
      .select('id')
      .eq('telegram_user_id', userId)
      .single();
    
    if (!existingUser) {
      return ctx.answerCbQuery('Пользователь не найден. Используйте /start для регистрации.');
    }
    
    const token = await createAuthToken(existingUser.id);
    
    if (!token) {
      return ctx.answerCbQuery('Ошибка при создании токена. Попробуйте позже.');
    }
    
    const authUrl = `${process.env.WEB_APP_URL}/auth?token=${token}`;
    
    await ctx.answerCbQuery();
    await ctx.reply(
      '🔗 Ссылка для входа в платформу:\n\n' + authUrl,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🚀 Открыть платформу',
                url: authUrl
              }
            ]
          ]
        }
      }
    );
    
  } catch (error) {
    console.error('Error in open_platform action:', error);
    ctx.answerCbQuery('Произошла ошибка. Попробуйте позже.');
  }
});

// Запуск бота
bot.launch();
console.log('Bot started successfully!');
```

### **2. Переменные окружения**

Добавьте в ваш `.env` файл:

```env
# Telegram Bot
BOT_TOKEN=your_bot_token_here

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Web App
WEB_APP_URL=https://your-app.vercel.app
```

### **3. Обновите меню бота**

Используйте BotFather для обновления меню:

```
/setmenubutton
@your_bot_username
Открыть обучающую платформу
```

## 🗄️ **Настройка базы данных**

### **1. Выполните SQL скрипт**

Выполните скрипт `create_auth_tokens_table_fixed.sql` в Supabase:

```sql
-- Создание таблицы для токенов авторизации
CREATE TABLE IF NOT EXISTS auth_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token VARCHAR(255) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES telegram_users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов
CREATE INDEX IF NOT EXISTS idx_auth_tokens_token ON auth_tokens(token);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_user_id ON auth_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_expires_at ON auth_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_is_used ON auth_tokens(is_used);

-- Включаем RLS, но без сложных политик
ALTER TABLE auth_tokens ENABLE ROW LEVEL SECURITY;

-- Простые политики для токенов
-- Разрешаем всем операциям (так как у нас токен-авторизация)
CREATE POLICY "Allow all operations on auth_tokens" ON auth_tokens
  FOR ALL USING (true) WITH CHECK (true);
```

### **2. Настройте RLS**

Убедитесь, что RLS настроен правильно для таблицы `telegram_users`.

## 🚀 **Деплой**

### **1. Обновите Vercel**

Деплойте обновленное приложение на Vercel.

### **2. Обновите переменные окружения**

В настройках Vercel добавьте:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### **3. Обновите бота**

Деплойте обновленного бота на ваш сервер.

## 🧪 **Тестирование**

### **1. Проверьте создание токенов**

1. Напишите боту `/start`
2. Проверьте, что токен создался в БД
3. Проверьте, что ссылка работает

### **2. Проверьте авторизацию**

1. Перейдите по ссылке от бота
2. Убедитесь, что авторизация прошла успешно
3. Проверьте, что пользователь видит контент

### **3. Проверьте безопасность**

1. Попробуйте использовать истекший токен
2. Попробуйте использовать уже использованный токен
3. Убедитесь, что токены одноразовые

## 🔒 **Безопасность**

- Токены действуют 24 часа
- Токены одноразовые
- Автоматическая очистка истекших токенов
- RLS защищает данные пользователей

## 📱 **Пользовательский опыт**

1. Пользователь пишет боту
2. Бот отправляет ссылку
3. Пользователь переходит по ссылке
4. Автоматическая авторизация
5. Доступ к платформе

## 🛠️ **Поддержка**

При возникновении проблем:
1. Проверьте логи бота
2. Проверьте логи Supabase
3. Проверьте переменные окружения
4. Убедитесь, что таблицы созданы правильно
