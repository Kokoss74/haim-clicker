import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { supabase } from './supabase/client'
import Game from './components/Game'
import Login from './components/Login.tsx'
import AdminPanel from './components/AdminPanel.tsx'
import { User } from './types/user'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Проверяем наличие пользователя в localStorage
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Ошибка при парсинге пользователя из localStorage:', error)
        localStorage.removeItem('user')
      }
    }
    
    setLoading(false)
    
    // Слушаем изменения аутентификации
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null)
          localStorage.removeItem('user')
          toast.info('Вы вышли из системы')
        }
      }
    )

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Загрузка...</div>
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Game user={user} /> : <Login setUser={setUser} />} />
      <Route
        path="/admin"
        element={
          <AdminPanel />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App