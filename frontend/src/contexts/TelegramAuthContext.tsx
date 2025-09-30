'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@supabase/supabase-js';

// Типы для Telegram пользователя
interface TelegramUser {
  id: number;
  username?: string;
  first_name: string;
  last_name?: string;
  language_code?: string;
  is_premium?: boolean;
}

interface TelegramUserData {
  id: string;
  telegram_user_id: number;
  username?: string;
  first_name: string;
  last_name?: string;
  language_code?: string;
  is_premium: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: TelegramUser | null;
  userData: TelegramUserData | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  setCurrentUser: (userId: number) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const TelegramAuthContext = createContext<AuthContextType | undefined>(undefined);

// Функции для работы с Telegram Web App
export const getTelegramUser = (): TelegramUser | null => {
  if (typeof window !== 'undefined' && (window as { Telegram?: { WebApp?: { initDataUnsafe?: { user?: TelegramUser } } } }).Telegram?.WebApp) {
    return (window as { Telegram?: { WebApp?: { initDataUnsafe?: { user?: TelegramUser } } } }).Telegram?.WebApp?.initDataUnsafe?.user || null;
  }
  return null;
};

export const getTelegramUserId = (): number | null => {
  const user = getTelegramUser();
  return user?.id || null;
};

// Supabase клиент
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const TelegramAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [userData, setUserData] = useState<TelegramUserData | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Синхронизация пользователя с БД
  const syncTelegramUser = async (telegramUser: TelegramUser) => {
    try {
      const { data, error } = await supabase
        .from('telegram_users')
        .upsert({
          telegram_user_id: telegramUser.id,
          username: telegramUser.username,
          first_name: telegramUser.first_name,
          last_name: telegramUser.last_name,
          language_code: telegramUser.language_code,
          is_premium: telegramUser.is_premium || false
        })
        .select()
        .single();

      if (error) {
        console.error('Error syncing user:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error syncing user:', error);
      return null;
    }
  };

  // Установка текущего пользователя в Supabase
  const setCurrentUser = async (userId: number) => {
    try {
      console.log('Setting current user in Supabase:', userId);
      await supabase.rpc('set_current_telegram_user', { user_id: userId });
      console.log('Current user set successfully in Supabase');
    } catch (error) {
      console.error('Error setting current user:', error);
    }
  };

  // Проверка админ прав
  const checkAdminRights = async (userId: number): Promise<boolean> => {
    try {
      // Для тестового пользователя (разработка на ПК) всегда админ
      if (userId === 123456789) {
        return true;
      }

      const { data, error } = await supabase
        .from('telegram_users')
        .select('is_admin')
        .eq('telegram_user_id', userId)
        .single();

      if (error) {
        console.error('Error checking admin rights:', error);
        return false;
      }

      return data?.is_admin || false;
    } catch (error) {
      console.error('Error checking admin rights:', error);
      return false;
    }
  };

  // Авторизация
  const login = async () => {
    try {
      setIsLoading(true);
      
      let telegramUser = getTelegramUser();
      
      // Если Telegram Web App недоступен (разработка на ПК), создаем тестового пользователя
      if (!telegramUser) {
        console.warn('Telegram Web App not available, using test user for development');
        telegramUser = {
          id: 123456789,
          username: 'test_user',
          first_name: 'Test',
          last_name: 'User',
          language_code: 'ru',
          is_premium: false
        };
      }

      // Синхронизируем пользователя с БД
      const syncedUserData = await syncTelegramUser(telegramUser);
      if (!syncedUserData) {
        console.error('Failed to sync user');
        setIsLoading(false);
        return;
      }

      // Устанавливаем текущего пользователя
      await setCurrentUser(telegramUser.id);

      // Проверяем админ права
      const adminStatus = await checkAdminRights(telegramUser.id);

      setUser(telegramUser);
      setUserData(syncedUserData);
      setIsAdmin(adminStatus);

    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Выход
  const logout = () => {
    setUser(null);
    setUserData(null);
    setIsAdmin(false);
  };

  // Обновление данных пользователя из БД
  const refreshUserData = async () => {
    try {
      if (!user?.id) return;

      console.log('Refreshing user data for ID:', user.id);

      // Получаем актуальные данные из БД
      const { data, error } = await supabase
        .from('telegram_users')
        .select('*')
        .eq('telegram_user_id', user.id)
        .single();

      if (error) {
        console.error('Error refreshing user data:', error);
        return;
      }

      if (data) {
        console.log('User data refreshed:', data);
        setUserData(data);
        // Также обновляем локальные данные пользователя
        setUser({
          id: data.telegram_user_id,
          username: data.username,
          first_name: data.first_name,
          last_name: data.last_name,
          language_code: data.language_code,
          is_premium: data.is_premium
        });
        // Обновляем статус админа
        setIsAdmin(data.is_admin);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  // Автоматическая авторизация при загрузке
  useEffect(() => {
    const initAuth = async () => {
      // Проверяем, есть ли Telegram Web App
      if (typeof window !== 'undefined' && (window as { Telegram?: { WebApp?: { initDataUnsafe?: { user?: TelegramUser } } } }).Telegram?.WebApp) {
        await login();
      } else {
        // Fallback для разработки - создаем тестового пользователя
        console.warn('Telegram Web App not available, using fallback');
        const fallbackUser = {
          id: 123456789,
          first_name: 'Test User',
          username: 'testuser',
          is_premium: false
        };
        
        try {
          // Синхронизируем тестового пользователя
          const syncedUserData = await syncTelegramUser(fallbackUser);
          if (syncedUserData) {
            await setCurrentUser(fallbackUser.id);
            const adminStatus = await checkAdminRights(fallbackUser.id);
            
            setUser(fallbackUser);
            setUserData(syncedUserData);
            setIsAdmin(adminStatus);
          }
        } catch (error) {
          console.error('Fallback auth error:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    initAuth();
  }, [login]);

  const value: AuthContextType = {
    user,
    userData,
    isAdmin,
    isLoading,
    login,
    logout,
    setCurrentUser,
    refreshUserData
  };

  return (
    <TelegramAuthContext.Provider value={value}>
      {children}
    </TelegramAuthContext.Provider>
  );
};

export const useTelegramAuth = () => {
  const context = useContext(TelegramAuthContext);
  if (context === undefined) {
    throw new Error('useTelegramAuth must be used within a TelegramAuthProvider');
  }
  return context;
};
