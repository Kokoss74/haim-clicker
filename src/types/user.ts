export interface User {
  id: string
  name: string
  phone: string
  attempts_left: number
  best_result: number | null
  discount: number
  created_at: string
}