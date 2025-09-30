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
  isAuthenticated: boolean;
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
      
      const telegramUser = getTelegramUser();
      
      if (!telegramUser) {
        console.error('Telegram Web App not available - user data not found');
        setIsLoading(false);
        return;
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
      setIsAuthenticated(true);

    } catch (error) {
      console.error('Login error:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Выход
  const logout = () => {
    setUser(null);
    setUserData(null);
    setIsAdmin(false);
    setIsAuthenticated(false);
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
        console.error('Telegram Web App not available - authentication failed');
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };

    initAuth();
  }, [login]);

  const value: AuthContextType = {
    user,
    userData,
    isAdmin,
    isLoading,
    isAuthenticated,
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
