import { useState } from 'react'
import { toast } from 'react-toastify'
import { supabase } from '../supabase/client'
import { User } from '../types/user'
import { Attempt } from '../types/attempt'
import { GameSettings, DiscountRange } from '../types/settings'
import bcrypt from 'bcryptjs'

interface UseSupabaseReturn {
  registerUser: (name: string, phone: string) => Promise<User | null>
  loginUser: (phone: string) => Promise<User | null>
  getUser: (userId: string) => Promise<User | null>
  recordAttempt: (userId: string, difference: number) => Promise<boolean>
  getUserAttempts: (userId: string) => Promise<Attempt[]>
  getGameSettings: () => Promise<GameSettings | null>
  adminLogin: (password: string) => Promise<boolean>
  resetUserAttempts: (userId: string) => Promise<boolean>
  changeAttemptsNumber: (number: number) => Promise<boolean>
  changeDiscountRanges: (ranges: DiscountRange[]) => Promise<boolean>
  getAllUsers: (search?: string) => Promise<User[]>
  exportUsers: (startDate: string, endDate: string) => Promise<User[]>
}

export const useSupabase = (): UseSupabaseReturn => {
  const [loading, setLoading] = useState<boolean>(false)

  const registerUser = async (name: string, phone: string): Promise<User | null> => {
    try {
      setLoading(true)

      // Проверяем, существует ли пользователь с таким телефоном
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)
        .single()
      
      if (existingUser) {
        toast.error('Пользователь уже зарегистрирован')
        return null
      }
      
      // Получаем настройки игры для установки количества попыток
      const { data: settings } = await supabase
        .from('game_settings')
        .select('*')
        .eq('id', 1)
        .single()
      
      const attemptsNumber = settings?.attempts_number || 10
      
      // Создаем нового пользователя
      const { data, error } = await supabase
        .from('users')
        .insert([
          { name, phone, attempts_left: attemptsNumber, discount: 3 }
        ])
        .select()
        .single()
      
      if (error) {
        console.error('Ошибка при регистрации:', error)
        toast.error('Ошибка при регистрации пользователя')
        return null
      }
      
      // Сохраняем пользователя в localStorage
      localStorage.setItem('user', JSON.stringify(data))
      
      toast.success('Регистрация успешна!')
      return data
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
      
      // Ищем пользователя по номеру телефона
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)
        .single()
      
      if (error || !data) {
        toast.error('Пользователь не найден')
        return null
      }
      
      // Сохраняем пользователя в localStorage
      localStorage.setItem('user', JSON.stringify(data))
      
      toast.success('Вход выполнен успешно!')
      return data
    } catch (error) {
      console.error('Ошибка при входе:', error)
      toast.error('Произошла ошибка при входе')
      return null
    } finally {
      setLoading(false)
    }
  }

  const getUser = async (userId: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error || !data) {
        console.error('Ошибка при получении пользователя:', error)
        return null
      }
      
      return data
    } catch (error) {
      console.error('Ошибка при получении пользователя:', error)
      return null
    }
  }

  const recordAttempt = async (userId: string, difference: number): Promise<boolean> => {
    try {
      setLoading(true)
      
      // Получаем текущего пользователя
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (!user || user.attempts_left <= 0) {
        toast.error('Для продолжения игры необходимо использовать имеющуюся скидку в магазине.')
        return false
      }
      
      // Получаем настройки игры для определения скидки
      const { data: settings } = await supabase
        .from('game_settings')
        .select('*')
        .eq('id', 1)
        .single()
      
      if (!settings) {
        toast.error('Ошибка при получении настроек игры')
        return false
      }
      
      // Записываем попытку
      const { error: attemptError } = await supabase
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
      
      const { error: updateError } = await supabase
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
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
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
      const { data, error } = await supabase
        .from('attempts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
      
      if (error) {
        console.error('Ошибка при получении попыток:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Ошибка при получении попыток:', error)
      return []
    }
  }

  const getGameSettings = async (): Promise<GameSettings | null> => {
    try {
      const { data, error } = await supabase
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

  const adminLogin = async (password: string): Promise<boolean> => {
    try {
      setLoading(true)
      
      // Получаем данные администратора из базы данных
      const { data: admin, error } = await supabase
        .from('admins')
        .select('*')
        .eq('id', 1)
        .single()
      
      if (error || !admin) {
        toast.error('Ошибка при входе в админ-панель')
        return false
      }
      
      // Проверяем, не заблокирован ли аккаунт
      if (admin.locked_until && new Date(admin.locked_until) > new Date()) {
        const unlockTime = new Date(admin.locked_until)
        toast.error(`Аккаунт заблокирован до ${unlockTime.toLocaleTimeString()}`)
        return false
      }
      
      // Получаем хеш пароля из переменной окружения
      const hashedPassword = import.meta.env.VITE_ADMIN_PASSWORD 
      
      if (!hashedPassword) {
        console.error('Ошибка: Хеш пароля администратора не найден в переменных окружения')
        toast.error('Ошибка конфигурации: отсутствует пароль администратора')
        return false
      }
      
      // Проверяем пароль с использованием bcrypt
      const isPasswordCorrect = await bcrypt.compare(password, hashedPassword)
      
      if (!isPasswordCorrect) {
        // Увеличиваем счетчик неудачных попыток
        const newFailedAttempts = admin.failed_attempts + 1
        
        // Если достигли 5 неудачных попыток, блокируем на 15 минут
        let lockedUntil = null
        if (newFailedAttempts >= 5) {
          const lockTime = new Date()
          lockTime.setMinutes(lockTime.getMinutes() + 15)
          lockedUntil = lockTime.toISOString()
          toast.error(`Превышено количество попыток входа. Аккаунт заблокирован на 15 минут.`)
        }
        
        // Обновляем данные в базе
        await supabase
          .from('admins')
          .update({ 
            failed_attempts: newFailedAttempts,
            locked_until: lockedUntil
          })
          .eq('id', 1)
        
        toast.error('Неверный пароль')
        return false
      }
      
      // Сбрасываем счетчик неудачных попыток при успешном входе
      await supabase
        .from('admins')
        .update({ 
          failed_attempts: 0,
          locked_until: null
        })
        .eq('id', 1)
      
      // Устанавливаем флаг админа в localStorage
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
      
      // Получаем настройки игры для установки количества попыток
      const { data: settings } = await supabase
        .from('game_settings')
        .select('*')
        .eq('id', 1)
        .single()
      
      const attemptsNumber = settings?.attempts_number || 10
      
      // Сбрасываем попытки пользователя
      const { error } = await supabase
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
      
      // Обновляем количество попыток в настройках
      const { error } = await supabase
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
      
      // Обновляем диапазоны скидок в настройках
      const { error } = await supabase
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
      let query = supabase
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
      const { data, error } = await supabase
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
    exportUsers
  }
}
