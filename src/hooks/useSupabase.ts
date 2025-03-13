import { useState } from 'react'
import { toast } from 'react-toastify'
import { supabase, setupAuthHeaders, updateAuthClient } from '../supabase/client'
import { User } from '../types/user'
import { Attempt } from '../types/attempt'
import { GameSettings, DiscountRange } from '../types/settings'
import { useLocalStorage } from './useLocalStorage'

interface UseSupabaseReturn {
  registerUser: (name: string, phone: string) => Promise<User | null>
  loginUser: (phone: string) => Promise<User | null>
  getUser: (userId: string) => Promise<User | null>
  recordAttempt: (userId: string, difference: number) => Promise<boolean>
  getUserAttempts: (userId: string) => Promise<Attempt[]>
  getGameSettings: () => Promise<GameSettings | null>
  adminLogin: (username: string, password: string) => Promise<boolean>
  resetUserAttempts: (userId: string) => Promise<boolean>
  changeAttemptsNumber: (number: number) => Promise<boolean>
  changeDiscountRanges: (ranges: DiscountRange[]) => Promise<boolean>
  getAllUsers: (search?: string) => Promise<User[]>
  exportUsers: (startDate: string, endDate: string) => Promise<User[]>
  logout: () => void
}

export const useSupabase = (): UseSupabaseReturn => {
  const [loading, setLoading] = useState<boolean>(false)
  const [user, setUser] = useLocalStorage<User | null>('userData', null)
  const [token, setToken] = useLocalStorage<string | null>('userToken', null)

  // Проверка существования пользователя по номеру телефона
  const checkPhoneExists = async (phone: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('check_phone_exists', {
        phone_number: phone
      })
      
      if (error) {
        console.error('Ошибка при проверке телефона:', error)
        return false
      }
      
      return data
    } catch (error) {
      console.error('Ошибка при проверке телефона:', error)
      return false
    }
  }

  const registerUser = async (name: string, phone: string): Promise<User | null> => {
    try {
      setLoading(true)

      // Регистрируем пользователя через RPC функцию
      const { data, error } = await supabase.rpc('register_user', {
        user_name: name,
        phone_number: phone
      })
      
      if (error) {
        console.error('Ошибка при регистрации:', error)
        toast.error('Ошибка при регистрации пользователя')
        return null
      }
      
      if (!data.success) {
        toast.error(data.message || 'Ошибка при регистрации')
        return null
      }
      if (!data.token) {
        toast.error('Отсутствует JWT токен')
        return null
      }
      
      // Сохраняем токен и данные пользователя
      setToken(data.token)
      setUser(data.user)
      
      // Обновляем клиент с установленным токеном
      const clientWithAuth = updateAuthClient()
      
      toast.success('Регистрация успешна!')
      return data.user
    } catch (error) {
      console.error('Ошибка при регистрации:', error)
      toast.error('Произошла ошибка при регистрации')
      return null
    } finally {
      setLoading(false)
    }
  }

  const loginUser = async (phone: string): Promise<User | null> => {
    try {
      setLoading(true)
      
      // Входим через RPC функцию
      const { data, error } = await supabase.rpc('login_user', {
        phone_number: phone
      })
      
      if (error) {
        console.error('Ошибка при входе:', error)
        toast.error('Ошибка при входе')
        return null
      }
      
      if (!data.success) {
        toast.error(data.message || 'Пользователь не найден')
        return null
      }
      if (!data.token) {
        toast.error('Отсутствует JWT токен')
        return null
      }
      
      // Сохраняем токен и данные пользователя
      setToken(data.token)
      setUser(data.user)
      
      // Обновляем клиент с установленным токеном
      const clientWithAuth = updateAuthClient()
      
      toast.success('Вход выполнен успешно!')
      return data.user
    } catch (error) {
      console.error('Ошибка при входе:', error)
      toast.error('Произошла ошибка при входе')
      return null
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    // Удаляем данные пользователя и токен
    setUser(null)
    setToken(null)
    localStorage.removeItem('userToken')
    localStorage.removeItem('userData')
    
    // Обновляем клиент Supabase без токена
    updateAuthClient()
    
    // Перенаправляем на страницу входа
    window.location.href = '/'
  }

  const getUser = async (userId: string): Promise<User | null> => {
    try {
      // Проверяем наличие токена
      const storedToken = localStorage.getItem('userToken')
      if (!storedToken) {
        console.error('Отсутствует токен авторизации')
        toast.error('Ошибка авторизации: отсутствует токен')
        return null
      }
      
      // Получаем клиент с токеном авторизации
      const clientWithAuth = setupAuthHeaders()
      
      console.log('Запрос данных пользователя с ID:', userId)
      const { data, error } = await clientWithAuth
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) {
        console.error('Ошибка при получении пользователя:', error)
        toast.error(`Ошибка при получении пользователя: ${error.message}`)
        return null
      }
      
      if (!data) {
        console.error('Пользователь не найден')
        toast.error('Пользователь не найден')
        return null
      }
      
      return data
    } catch (error) {
      console.error('Ошибка при получении пользователя:', error)
      toast.error(`Произошла ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
      return null
    }
  }

  const recordAttempt = async (userId: string, difference: number): Promise<boolean> => {
    try {
      setLoading(true)
      
      // Проверяем наличие токена
      const storedToken = localStorage.getItem('userToken')
      if (!storedToken) {
        console.error('Отсутствует токен авторизации')
        toast.error('Ошибка авторизации: отсутствует токен')
        return false
      }
      
      // Получаем клиент с токеном авторизации
      const clientWithAuth = setupAuthHeaders()
      console.log('Запись попытки для пользователя с ID:', userId)
      
      // Получаем текущего пользователя
      const { data: user } = await clientWithAuth
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (!user || user.attempts_left <= 0) {
        toast.error('Для продолжения игры необходимо использовать имеющуюся скидку в магазине.')
        return false
      }
      
      // Получаем настройки игры для определения скидки
      const { data: settings } = await clientWithAuth
        .from('game_settings')
        .select('*')
        .eq('id', 1)
        .single()
      
      if (!settings) {
        toast.error('Ошибка при получении настроек игры')
        return false
      }
      
      // Записываем попытку
      const { error: attemptError } = await clientWithAuth
        .from('attempts')
        .insert([
          { user_id: userId, difference }
        ])
      
      if (attemptError) {
        console.error('Ошибка при записи попытки:', attemptError)
        toast.error('Ошибка при записи попытки')
        return false
      }
      
      // Определяем скидку на основе диапазонов
      let discountValue = 3 // Минимальная скидка по умолчанию
      
      for (const range of settings.discount_ranges) {
        if (difference >= range.min && (range.max === null || difference <= range.max)) {
          discountValue = range.discount
          break
        }
      }
      
      // Обновляем данные пользователя
      const newAttemptsLeft = user.attempts_left - 1
      const newBestResult = user.best_result === null || difference < user.best_result
        ? difference
        : user.best_result
      
      // Определяем новую скидку на основе лучшего результата
      let newDiscount = 3
      for (const range of settings.discount_ranges) {
        if (newBestResult >= range.min && (range.max === null || newBestResult <= range.max)) {
          newDiscount = range.discount
          break
        }
      }
      
      const { error: updateError } = await clientWithAuth
        .from('users')
        .update({
          attempts_left: newAttemptsLeft,
          best_result: newBestResult,
          discount: newDiscount
        })
        .eq('id', userId)
      
      if (updateError) {
        console.error('Ошибка при обновлении пользователя:', updateError)
        toast.error('Ошибка при обновлении данных пользователя')
        return false
      }
      
      // Обновляем пользователя в localStorage
      const updatedUser = {
        ...user,
        attempts_left: newAttemptsLeft,
        best_result: newBestResult,
        discount: newDiscount
      }
      localStorage.setItem('userData', JSON.stringify(updatedUser))
      
      return true
    } catch (error) {
      console.error('Ошибка при записи попытки:', error)
      toast.error('Произошла ошибка при записи попытки')
      return false
    } finally {
      setLoading(false)
    }
  }

  const getUserAttempts = async (userId: string): Promise<Attempt[]> => {
    try {
      // Проверяем наличие токена
      const storedToken = localStorage.getItem('userToken')
      if (!storedToken) {
        console.error('Отсутствует токен авторизации')
        toast.error('Ошибка авторизации: отсутствует токен')
        return []
      }
      
      // Получаем клиент с токеном авторизации
      const clientWithAuth = setupAuthHeaders()
      
      console.log('Запрос попыток пользователя с ID:', userId)
      const { data, error } = await clientWithAuth
        .from('attempts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
      
      if (error) {
        console.error('Ошибка при получении попыток:', error)
        toast.error(`Ошибка при получении попыток: ${error.message}`)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Ошибка при получении попыток:', error)
      toast.error(`Произошла ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
      return []
    }
  }

  const getGameSettings = async (): Promise<GameSettings | null> => {
    try {
      // Получаем клиент с токеном авторизации
      const clientWithAuth = setupAuthHeaders()
      
      const { data, error } = await clientWithAuth
        .from('game_settings')
        .select('*')
        .eq('id', 1)
        .single()
      
      if (error) {
        console.error('Ошибка при получении настроек игры:', error)
        return null
      }
      
      return data
    } catch (error) {
      console.error('Ошибка при получении настроек игры:', error)
      return null
    }
  }

  const adminLogin = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)
      
      // Используем RPC функцию для входа администратора
      const { data, error } = await supabase.rpc('admin_login', {
        admin_username: username,
        input_password: password
      })
      
      if (error) {
        console.error('Ошибка при входе в админ-панель:', error)
        toast.error('Ошибка при входе в админ-панель')
        return false
      }
      
      if (!data.success) {
        toast.error(data.message || 'Ошибка при входе')
        return false
      }
      
      // Сохраняем токен и данные администратора
      localStorage.setItem('adminToken', data.token)
      localStorage.setItem('adminData', JSON.stringify(data.admin))
      localStorage.setItem('isAdmin', 'true')
      
      toast.success('Вход в админ-панель выполнен успешно!')
      return true
    } catch (error) {
      console.error('Ошибка при входе в админ-панель:', error)
      toast.error('Произошла ошибка при входе в админ-панель')
      return false
    } finally {
      setLoading(false)
    }
  }

  const resetUserAttempts = async (userId: string): Promise<boolean> => {
    try {
      setLoading(true)
      
      // Получаем клиент с токеном авторизации
      const clientWithAuth = setupAuthHeaders()
      
      // Получаем настройки игры для установки количества попыток
      const { data: settings } = await clientWithAuth
        .from('game_settings')
        .select('*')
        .eq('id', 1)
        .single()
      
      const attemptsNumber = settings?.attempts_number || 10
      
      // Сбрасываем попытки пользователя
      const { error } = await clientWithAuth
        .from('users')
        .update({ attempts_left: attemptsNumber })
        .eq('id', userId)
      
      if (error) {
        console.error('Ошибка при сбросе попыток:', error)
        toast.error('Ошибка при сбросе попыток пользователя')
        return false
      }
      
      toast.success('Попытки пользователя успешно сброшены!')
      return true
    } catch (error) {
      console.error('Ошибка при сбросе попыток:', error)
      toast.error('Произошла ошибка при сбросе попыток')
      return false
    } finally {
      setLoading(false)
    }
  }

  const changeAttemptsNumber = async (number: number): Promise<boolean> => {
    try {
      setLoading(true)
      
      // Получаем клиент с токеном авторизации
      const clientWithAuth = setupAuthHeaders()
      
      // Обновляем количество попыток в настройках
      const { error } = await clientWithAuth
        .from('game_settings')
        .update({ attempts_number: number })
        .eq('id', 1)
      
      if (error) {
        console.error('Ошибка при изменении количества попыток:', error)
        toast.error('Ошибка при изменении количества попыток')
        return false
      }
      
      toast.success('Количество попыток успешно изменено!')
      return true
    } catch (error) {
      console.error('Ошибка при изменении количества попыток:', error)
      toast.error('Произошла ошибка при изменении количества попыток')
      return false
    } finally {
      setLoading(false)
    }
  }

  const changeDiscountRanges = async (ranges: DiscountRange[]): Promise<boolean> => {
    try {
      setLoading(true)
      
      // Получаем клиент с токеном авторизации
      const clientWithAuth = setupAuthHeaders()
      
      // Обновляем диапазоны скидок в настройках
      const { error } = await clientWithAuth
        .from('game_settings')
        .update({ discount_ranges: ranges })
        .eq('id', 1)
      
      if (error) {
        console.error('Ошибка при изменении диапазонов скидок:', error)
        toast.error('Ошибка при изменении диапазонов скидок')
        return false
      }
      
      toast.success('Диапазоны скидок успешно изменены!')
      return true
    } catch (error) {
      console.error('Ошибка при изменении диапазонов скидок:', error)
      toast.error('Произошла ошибка при изменении диапазонов скидок')
      return false
    } finally {
      setLoading(false)
    }
  }

  const getAllUsers = async (search?: string): Promise<User[]> => {
    try {
      // Получаем клиент с токеном авторизации
      const clientWithAuth = setupAuthHeaders()
      
      let query = clientWithAuth
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (search) {
        query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`)
      }
      
      const { data, error } = await query
      
      if (error) {
        console.error('Ошибка при получении пользователей:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Ошибка при получении пользователей:', error)
      return []
    }
  }

  const exportUsers = async (startDate: string, endDate: string): Promise<User[]> => {
    try {
      // Получаем клиент с токеном авторизации
      const clientWithAuth = setupAuthHeaders()
      
      const { data, error } = await clientWithAuth
        .from('users')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Ошибка при экспорте пользователей:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Ошибка при экспорте пользователей:', error)
      return []
    }
  }

  return {
    registerUser,
    loginUser,
    getUser,
    recordAttempt,
    getUserAttempts,
    getGameSettings,
    adminLogin,
    resetUserAttempts,
    changeAttemptsNumber,
    changeDiscountRanges,
    getAllUsers,
    exportUsers,
    logout
  }
}
