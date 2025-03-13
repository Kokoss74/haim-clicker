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

// Функция для очистки токена от пробелов и переносов строк
export const cleanToken = (token: string): string => {
  return token.replace(/[\s\n\r]+/g, '');
};

export const setupAuthHeaders = async () => {
  let access_token = localStorage.getItem('access_token');
  let refresh_token = localStorage.getItem('refresh_token');

  if (!access_token || !refresh_token) {
    console.log('Токены отсутствуют, создание клиента без авторизации');
    return supabase;
  }

  // Очищаем токены от пробелов и переносов строк
  access_token = cleanToken(access_token);
  refresh_token = cleanToken(refresh_token);

  // Обновляем токены в localStorage
  localStorage.setItem('access_token', access_token);
  localStorage.setItem('refresh_token', refresh_token);

  console.log('Установка сессии с помощью access_token и refresh_token');
  try {
    // Используем новый метод setSession для установки сессии
    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token
    });
    
    if (error) {
      console.error('Ошибка при установке сессии:', error);
    } else {
      console.log('Сессия успешно установлена:', data);
    }
  } catch (error) {
    console.error('Ошибка при установке сессии:', error);
  }
  
  return supabase;
}

// Инициализируем клиент с токеном, если он есть в localStorage
export let supabaseWithAuth = supabase

// Функция для обновления клиента с токеном
export const updateAuthClient = async () => {
  supabaseWithAuth = await setupAuthHeaders()
  return supabaseWithAuth
}

// Инициализируем клиент при загрузке
setupAuthHeaders().then(client => {
  supabaseWithAuth = client
}).catch(error => {
  console.error('Ошибка при инициализации клиента:', error)
})

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