'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
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

  console.log('Supabase config check:', {
    url: url ? `${url.substring(0, 20)}...` : 'missing',
    key: key ? `${key.substring(0, 20)}...` : 'missing',
    hasUrl: !!url,
    hasKey: !!key
  });

  if (!url || !key) {
    console.error('Supabase environment variables are missing:', { url: !!url, key: !!key });
    return false;
  }

  if (PLACEHOLDER_URLS.has(url) || PLACEHOLDER_KEYS.has(key)) {
    console.error('Supabase environment variables contain placeholder values:', { url, key });
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
  const isRestoringSession = useRef(false);

  const persistProfile = useCallback((profile: Profile | null) => {
    setUser(profile);
    writeProfileToStorage(profile);
  }, []);

  const fetchUserProfile = useCallback(async (sessionUser: SupabaseAuthUser) => {
    // With the simplified AuthContext, we directly build the profile from the Supabase Auth user
    const profile = buildProfileFromAuthUser(sessionUser);
    persistProfile(profile);
    return profile;
  }, [persistProfile]);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const { data: { user: authUser }, error } = await supabase.auth.getUser();
    if (error || !authUser) {
      console.error('Error refreshing auth user:', error);
      persistProfile(null);
      return;
    }
    await fetchUserProfile(authUser);
  }, [fetchUserProfile, user, persistProfile]);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, using localStorage fallback');
      const cached = readProfileFromStorage();
      if (cached) setUser(cached);
      setLoading(false);
      return;
    }

    let isMounted = true;

    const initialiseSession = async () => {
      if (isRestoringSession.current) return;
      isRestoringSession.current = true;

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
        isRestoringSession.current = false;
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
      console.warn('Supabase not configured, using mock authentication');
      // Fallback для разработки без Supabase
      const mockUser = {
        id: 'mock-user-id',
        email: email,
        full_name: 'Test User',
        avatar_url: undefined,
        role: 'user' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      persistProfile(mockUser);
      return;
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
  }, [fetchUserProfile, persistProfile]);

  const register = useCallback(async (email: string, password: string, fullName: string) => {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, using mock registration');
      const mockUser = {
        id: 'mock-user-id',
        email: email,
        full_name: fullName,
        avatar_url: undefined,
        role: 'user' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      persistProfile(mockUser);
      return {};
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
        return { needsEmailConfirmation: true };
      }

      if (data.user && data.user.email_confirmed_at) {
        await fetchUserProfile(data.user);
      }

      return {};
    } finally {
      setLoading(false);
    }
  }, [fetchUserProfile, persistProfile]);

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


