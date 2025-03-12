export interface Attempt {
  id: string
  user_id: string
  difference: number
  created_at: string
  timestamp?: string // Для отображения времени нажатия
}