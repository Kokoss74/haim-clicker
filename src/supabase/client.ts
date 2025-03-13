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

export const setupAuthHeaders = async () => {
  let token = localStorage.getItem('userToken');

  if (!token) {
    console.log('Токен отсутствует, создание клиента без авторизации');
    return supabase;
  }

  // Если токен в localStorage в формате JSON строки, парсим его
  if (token.startsWith('"') && token.endsWith('"')) {
    token = JSON.parse(token);
  }

  if (typeof token !== 'string' || !token.trim()) {
    console.error('Недействительный токен:', token);
    return supabase;
  }

  console.log('Аутентификация через signInWithToken');
  try {
    const { data, error } = await supabase.auth.signInWithIdToken(token);
    if (error) {
      console.error('Ошибка аутентификации через signInWithToken:', error);
    } else {
      console.log('Аутентификация успешна:', data);
    }
  } catch (error) {
    console.error('Ошибка в signInWithToken:', error);
  }
  return supabase;
}

// Инициализируем клиент с токеном, если он есть в localStorage
export let supabaseWithAuth = setupAuthHeaders()

// Функция для обновления клиента с токеном
export const updateAuthClient = () => {
  supabaseWithAuth = setupAuthHeaders()
  return supabaseWithAuth
}

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