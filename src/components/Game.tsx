import React, { useState } from 'react'
import { useTimer } from '../hooks/useTimer'
import { useSupabase } from '../hooks/useSupabase'
import { User } from '../types/user'
import ModalRules from './ModalRules'

interface GameProps {
  user: User
}

const Game: React.FC<GameProps> = ({ user }) => {
  const { time, milliseconds, startTimer, stopTimer, resetTimer } = useTimer()
  const { recordAttempt, getUserAttempts } = useSupabase()
  const [attempts, setAttempts] = useState<number[]>([])
  const [showRules, setShowRules] = useState(false)

  const handleAttempt = async () => {
    stopTimer()
    // Вычисляем отклонение от целой секунды
    const diff: number = milliseconds < 500 ? milliseconds : 1000 - milliseconds
    const success: boolean = await recordAttempt(user.id, diff)
    if (success) {
      const userAttempts = await getUserAttempts(user.id)
      setAttempts(userAttempts.map((a: any) => a.difference))
    }
    resetTimer()
    startTimer()
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Игра Clicker</h1>
      <div className="timer text-4xl font-mono mb-4">{time}</div>
      <button onClick={handleAttempt} className="game-button mb-4">
        Нажать
      </button>
      <div>
        <h2 className="text-xl font-bold">Попытки:</h2>
        <table className="table mt-2">
          <thead>
            <tr>
              <th>#</th>
              <th>Отклонение (мс)</th>
            </tr>
          </thead>
          <tbody>
            {attempts.map((diff, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{diff}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={() => setShowRules(true)} className="mt-4 btn btn-secondary">
        Правила игры
      </button>
      <ModalRules isOpen={showRules} onRequestClose={() => setShowRules(false)} />
    </div>
  )
}

export default Game