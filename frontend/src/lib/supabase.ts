import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Типы для базы данных
export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
  role: 'user' | 'admin'
}

export interface Topic {
  id: string
  title: string
  description?: string
  icon?: string
  color?: string
  order_index: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Subtopic {
  id: string
  topic_id: string
  title: string
  content: string
  order_index: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserProgress {
  id: string
  user_id: string
  subtopic_id: string
  is_completed: boolean
  completed_at?: string
  created_at: string
}

export interface UserFavorite {
  id: string
  user_id: string
  subtopic_id: string
  created_at: string
}

// Дополнительные типы для админ панели
export interface TopicWithSubtopics extends Topic {
  subtopics: Subtopic[]
}

export interface UserWithProgress extends User {
  progress: UserProgress[]
  favorites: UserFavorite[]
}
