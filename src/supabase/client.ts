import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabaseJwtSecret = import.meta.env.VITE_SUPABASE_JWT_SECRET

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Отсутствуют переменные окружения VITE_SUPABASE_URL или VITE_SUPABASE_ANON_KEY')
}

// Создаем клиент Supabase с дополнительными опциями
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      headers: {
        'x-app-jwt-secret': supabaseJwtSecret || ''
      }
    }
  }
)

// Функция для добавления токена к запросам
export const setupAuthHeaders = () => {
  const token = localStorage.getItem('userToken')
  
  if (token) {
    // Создаем новый экземпляр клиента с заголовком авторизации
    // Это более надежный способ для пользовательской авторизации
    return createClient<Database>(
      supabaseUrl,
      supabaseAnonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
            'x-app-jwt-secret': supabaseJwtSecret || ''
          }
        }
      }
    )
  }
  return supabase
}

// Инициализируем клиент с токеном, если он есть в localStorage
const initialClient = setupAuthHeaders()
export let supabaseWithAuth = initialClient

// Функция для обновления JWT Secret
export const updateJwtSecret = (secret: string) => {
  // Создаем новый клиент с обновленным JWT Secret
  const newClient = createClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      global: {
        headers: {
          'x-app-jwt-secret': secret
        }
      }
    }
  )
  
  // Обновляем глобальные клиенты
  supabaseWithAuth = newClient
  return newClient
}