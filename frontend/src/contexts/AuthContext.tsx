'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { User as SupabaseAuthUser } from '@supabase/supabase-js';
import { supabase, User as Profile } from '@/lib/supabase';

interface AuthContextType {
  user: Profile | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<{ needsEmailConfirmation?: boolean }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'ai-school-user';
const PLACEHOLDER_URLS = new Set([
  'https://placeholder.supabase.co',
  'https://your-project-id.supabase.co',
]);
const PLACEHOLDER_KEYS = new Set(['placeholder-key', 'your-anon-key-here']);

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error('Supabase environment variables are missing.');
    return false;
  }

  if (PLACEHOLDER_URLS.has(url) || PLACEHOLDER_KEYS.has(key)) {
    console.error('Supabase environment variables contain placeholder values.');
    return false;
  }

  return true;
};

const hydrateProfile = (raw: unknown): Profile | null => {
  if (!raw || typeof raw !== 'object') return null;

  const candidate = raw as Partial<Profile>;
  if (!candidate.id || !candidate.email) return null;

  return {
    id: candidate.id,
    email: candidate.email,
    full_name: candidate.full_name ?? '',
    avatar_url: candidate.avatar_url ?? undefined,
    role: candidate.role ?? 'user',
    created_at: candidate.created_at ?? new Date().toISOString(),
    updated_at: candidate.updated_at ?? new Date().toISOString(),
  };
};

const readProfileFromStorage = (): Profile | null => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    const profile = hydrateProfile(parsed);
    if (!profile) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return profile;
  } catch (error) {
    console.error('Failed to parse profile from localStorage:', error);
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

const writeProfileToStorage = (profile: Profile | null) => {
  if (typeof window === 'undefined') return;
  if (profile) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
};

const buildProfileFromAuthUser = (authUser: SupabaseAuthUser): Profile => {
  const metadata = (authUser.user_metadata ?? {}) as Record<string, unknown>;

  return {
    id: authUser.id,
    email: authUser.email ?? '',
    full_name: typeof metadata.full_name === 'string' ? metadata.full_name : '',
    avatar_url: typeof metadata.avatar_url === 'string' ? metadata.avatar_url : undefined,
    role: (metadata.role === 'admin' ? 'admin' : 'user') as Profile['role'],
    created_at: authUser.created_at ?? new Date().toISOString(),
    updated_at: authUser.updated_at ?? new Date().toISOString(),
  };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const persistProfile = useCallback((profile: Profile | null) => {
    setUser(profile);
    writeProfileToStorage(profile);
  }, []);

  const fetchUserProfile = useCallback(async (authUser: SupabaseAuthUser) => {
    // Создаем профиль из данных Supabase Auth без обращения к таблице users
    const profile = buildProfileFromAuthUser(authUser);
    persistProfile(profile);
    return profile;
  }, [persistProfile]);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data: authUser, error } = await supabase.auth.getUser();
      if (error || !authUser.user) {
        console.error('Error getting current user:', error);
        return;
      }
      
      await fetchUserProfile(authUser.user);
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  }, [fetchUserProfile, user]);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      const cached = readProfileFromStorage();
      if (cached) setUser(cached);
      setLoading(false);
      return;
    }

    let isMounted = true;

    const initialiseSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error restoring Supabase session:', error);
          const cached = readProfileFromStorage();
          if (cached && isMounted) setUser(cached);
          return;
        }

        if (session?.user) {
          try {
            await fetchUserProfile(session.user);
          } catch (profileError) {
            console.error('Error fetching user profile during init:', profileError);
          }
        } else {
          const cached = readProfileFromStorage();
          if (cached && isMounted) setUser(cached);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initialiseSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;

      if (session?.user) {
        try {
          await fetchUserProfile(session.user);
        } catch (profileError) {
          console.error('Error fetching user profile on auth change:', profileError);
        }
      } else {
        persistProfile(null);
      }

      setLoading(false);
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [fetchUserProfile, persistProfile]);

  const login = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Please provide valid environment variables.');
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      if (data.user) {
        await fetchUserProfile(data.user);
      }
    } finally {
      setLoading(false);
    }
  }, [fetchUserProfile]);

  const register = useCallback(async (email: string, password: string, fullName: string) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Please provide valid environment variables.');
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      if (data.user && !data.user.email_confirmed_at) {
        // Требуется подтверждение email
        return { needsEmailConfirmation: true };
      }

      if (data.user && data.user.email_confirmed_at) {
        await fetchUserProfile(data.user);
      }

      return {};
    } finally {
      setLoading(false);
    }
  }, [fetchUserProfile]);

  const logout = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      persistProfile(null);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      persistProfile(null);
    } finally {
      setLoading(false);
    }
  }, [persistProfile]);

  const value = useMemo<AuthContextType>(() => ({
    user,
    isAuthenticated: Boolean(user),
    loading,
    login,
    register,
    logout,
    refreshProfile,
  }), [user, loading, login, register, logout, refreshProfile]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}