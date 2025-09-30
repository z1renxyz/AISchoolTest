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

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
