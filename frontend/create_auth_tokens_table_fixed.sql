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

-- Создание индексов для быстрого поиска
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

-- Функция для очистки истекших токенов
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM auth_tokens 
  WHERE expires_at < NOW() AND is_used = FALSE;
END;
$$ LANGUAGE plpgsql;

-- Создание триггера для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_auth_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_auth_tokens_updated_at
  BEFORE UPDATE ON auth_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_auth_tokens_updated_at();

-- Комментарии к таблице и колонкам
COMMENT ON TABLE auth_tokens IS 'Таблица для хранения токенов авторизации пользователей';
COMMENT ON COLUMN auth_tokens.token IS 'Уникальный токен для авторизации';
COMMENT ON COLUMN auth_tokens.user_id IS 'ID пользователя, которому принадлежит токен';
COMMENT ON COLUMN auth_tokens.expires_at IS 'Время истечения токена';
COMMENT ON COLUMN auth_tokens.is_used IS 'Флаг использования токена';
COMMENT ON COLUMN auth_tokens.used_at IS 'Время использования токена';
