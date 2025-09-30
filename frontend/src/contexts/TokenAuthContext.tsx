'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { createClient } from '@supabase/supabase-js';

// Типы для пользователя
interface User {
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
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const TokenAuthContext = createContext<AuthContextType | undefined>(undefined);

// Supabase клиент
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const TokenAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Проверка токена
  const checkToken = async (token: string): Promise<User | null> => {
    try {
      console.log('Checking token:', token);
      
      // Проверяем токен в БД
      const { data: tokenData, error: tokenError } = await supabase
        .from('auth_tokens')
        .select('user_id, expires_at, is_used')
        .eq('token', token)
        .eq('is_used', false)
        .single();

      if (tokenError || !tokenData) {
        console.error('Token not found or invalid:', tokenError);
        return null;
      }

      // Проверяем, не истек ли токен
      if (new Date(tokenData.expires_at) < new Date()) {
        console.error('Token expired');
        return null;
      }

      // Получаем данные пользователя
      const { data: userData, error: userError } = await supabase
        .from('telegram_users')
        .select('*')
        .eq('id', tokenData.user_id)
        .single();

      if (userError || !userData) {
        console.error('User not found:', userError);
        return null;
      }

      // Помечаем токен как использованный
      await supabase
        .from('auth_tokens')
        .update({ is_used: true, used_at: new Date().toISOString() })
        .eq('token', token);

      console.log('Token validated, user:', userData);
      return userData;

    } catch (error) {
      console.error('Error checking token:', error);
      return null;
    }
  };

  // Авторизация по токену
  const login = useCallback(async (token: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const userData = await checkToken(token);
      
      if (userData) {
        setUser(userData);
        setIsAdmin(userData.is_admin);
        setIsAuthenticated(true);
        
        // Сохраняем токен в localStorage для автоматической авторизации
        localStorage.setItem('auth_token', token);
        
        console.log('Login successful');
        return true;
      } else {
        console.error('Login failed - invalid token');
        setIsAuthenticated(false);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Выход
  const logout = () => {
    setUser(null);
    setIsAdmin(false);
    setIsAuthenticated(false);
    localStorage.removeItem('auth_token');
    console.log('Logged out');
  };

  // Обновление данных пользователя
  const refreshUser = async () => {
    try {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('telegram_users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error refreshing user:', error);
        return;
      }

      if (data) {
        setUser(data);
        setIsAdmin(data.is_admin);
        console.log('User data refreshed');
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  // Автоматическая авторизация при загрузке
  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsLoading(true);
        
        // Проверяем, есть ли сохраненный токен
        const savedToken = localStorage.getItem('auth_token');
        
        if (savedToken) {
          console.log('Found saved token, attempting login...');
          const success = await login(savedToken);
          
          if (!success) {
            // Токен недействителен, удаляем его
            localStorage.removeItem('auth_token');
          }
        } else {
          console.log('No saved token found');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Init auth error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [login]);

  const value: AuthContextType = {
    user,
    isAdmin,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshUser
  };

  return (
    <TokenAuthContext.Provider value={value}>
      {children}
    </TokenAuthContext.Provider>
  );
};

export const useTokenAuth = () => {
  const context = useContext(TokenAuthContext);
  if (context === undefined) {
    throw new Error('useTokenAuth must be used within a TokenAuthProvider');
  }
  return context;
};
