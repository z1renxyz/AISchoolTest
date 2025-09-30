'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { createClient } from '@supabase/supabase-js';
import { setTelegramUserId } from '@/lib/telegram-api';

// Supabase клиент
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Интерфейс пользователя
export interface User {
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

// Типы для Telegram Web App
interface TelegramWebApp {
  initDataUnsafe: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
      is_premium?: boolean;
    };
  };
  ready: () => void;
  expand: () => void;
  close: () => void;
}

// Расширяем Window для Telegram Web App
declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

// Контекст авторизации
interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Провайдер авторизации
export function TelegramAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Получение данных Telegram пользователя
  const getTelegramUser = useCallback((): { id: number; userData: Omit<User, 'id' | 'created_at' | 'updated_at'> } | null => {
    if (typeof window === 'undefined') return null;
    
    const tg = window.Telegram?.WebApp;
    if (!tg?.initDataUnsafe?.user) return null;

    const tgUser = tg.initDataUnsafe.user;
    return {
      id: tgUser.id,
      userData: {
        telegram_user_id: tgUser.id,
        username: tgUser.username,
        first_name: tgUser.first_name,
        last_name: tgUser.last_name,
        language_code: tgUser.language_code,
        is_premium: tgUser.is_premium || false,
        is_admin: false // По умолчанию не админ, можно изменить в БД
      }
    };
  }, []);

  // Поиск или создание пользователя
  const findOrCreateUser = useCallback(async (telegramUserId: number, userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User | null> => {
    try {
      console.log('🔍 Looking for user with Telegram ID:', telegramUserId);
      
      // Устанавливаем Telegram User ID для RLS
      await setTelegramUserId(telegramUserId);
      
      // Ищем существующего пользователя
      const { data: existingUser, error: findError } = await supabase
        .from('telegram_users')
        .select('*')
        .eq('telegram_user_id', telegramUserId)
        .single();

      if (findError && findError.code !== 'PGRST116') {
        console.error('❌ Error finding user:', findError);
        return null;
      }

      if (existingUser) {
        console.log('✅ Found existing user:', existingUser);
        return existingUser;
      }

      // Создаем нового пользователя
      console.log('👤 Creating new user...');
      const { data: newUser, error: createError } = await supabase
        .from('telegram_users')
        .insert(userData)
        .select('*')
        .single();

      if (createError) {
        console.error('❌ Error creating user:', createError);
        return null;
      }

      console.log('✅ Created new user:', newUser);
      return newUser;
    } catch (error) {
      console.error('❌ Error in findOrCreateUser:', error);
      return null;
    }
  }, []);

  // Автоматическая авторизация
  const autoLogin = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const telegramUser = getTelegramUser();
      if (!telegramUser) {
        console.log('❌ No Telegram user data available');
        setIsAuthenticated(false);
        return;
      }

      console.log('🔍 Telegram user data:', telegramUser);
      
      const user = await findOrCreateUser(telegramUser.id, telegramUser.userData);
      
      if (user) {
        setUser(user);
        setIsAdmin(user.is_admin || false);
        setIsAuthenticated(true);
        console.log('✅ Auto-login successful:', user);
      } else {
        console.error('❌ Failed to find or create user');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('❌ Auto-login error:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, [getTelegramUser, findOrCreateUser]);

  // Обновление данных пользователя
  const refreshUser = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data: updatedUser, error } = await supabase
        .from('telegram_users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('❌ Error refreshing user:', error);
        return;
      }

      if (updatedUser) {
        setUser(updatedUser);
        setIsAdmin(updatedUser.is_admin || false);
        console.log('✅ User data refreshed:', updatedUser);
      }
    } catch (error) {
      console.error('❌ Error refreshing user:', error);
    }
  }, [user]);

  // Инициализация при загрузке
  useEffect(() => {
    const initAuth = async () => {
      // Ждем, пока Telegram Web App загрузится
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
        
        // Небольшая задержка для инициализации
        setTimeout(autoLogin, 100);
      } else {
        console.log('❌ Telegram Web App not available');
        setIsLoading(false);
      }
    };

    initAuth();
  }, [autoLogin]);

  const value: AuthContextType = {
    user,
    isAdmin,
    isLoading,
    isAuthenticated,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Хук для использования контекста
export const useTelegramAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useTelegramAuth must be used within a TelegramAuthProvider');
  }
  return context;
};