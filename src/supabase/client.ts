import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Отсутствуют переменные окружения VITE_SUPABASE_URL или VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Функция для добавления токена к запросам
export const setupAuthHeaders = () => {
  const token = localStorage.getItem('userToken')
  
  if (token) {
    // Устанавливаем заголовок Authorization для всех запросов
    supabase.auth.setSession({
      access_token: token,
      refresh_token: '',
    })
  }
}

// Вызываем при инициализации приложения
setupAuthHeaders()