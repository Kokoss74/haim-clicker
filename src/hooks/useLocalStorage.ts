import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // Получаем значение из localStorage или используем initialValue
  const readValue = (): T => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Ошибка при чтении localStorage ключа "${key}":`, error)
      return initialValue
    }
  }

  const [storedValue, setStoredValue] = useState<T>(readValue)

  // Функция для обновления значения в localStorage и state
  const setValue = (value: T) => {
    try {
      // Сохраняем state
      setStoredValue(value)
      
      // Сохраняем в localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(value))
      }
    } catch (error) {
      console.warn(`Ошибка при установке localStorage ключа "${key}":`, error)
    }
  }

  useEffect(() => {
    setStoredValue(readValue())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return [storedValue, setValue]
}