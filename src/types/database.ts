export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          phone: string
          attempts_left: number
          best_result: number | null
          discount: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          phone: string
          attempts_left?: number
          best_result?: number | null
          discount?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string
          attempts_left?: number
          best_result?: number | null
          discount?: number
          created_at?: string
        }
      }
      attempts: {
        Row: {
          id: string
          user_id: string
          difference: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          difference: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          difference?: number
          created_at?: string
        }
      }
      game_settings: {
        Row: {
          id: number
          attempts_number: number
          discount_ranges: {
            min: number
            max: number | null
            discount: number
          }[]
        }
        Insert: {
          id?: number
          attempts_number?: number
          discount_ranges?: {
            min: number
            max: number | null
            discount: number
          }[]
        }
        Update: {
          id?: number
          attempts_number?: number
          discount_ranges?: {
            min: number
            max: number | null
            discount: number
          }[]
        }
      }
      admins: {
        Row: {
          id: string
          password_hash: string
          failed_attempts: number
          locked_until: string | null
          created_at: string
        }
        Insert: {
          id?: string
          password_hash: string
          failed_attempts?: number
          locked_until?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          password_hash?: string
          failed_attempts?: number
          locked_until?: string | null
          created_at?: string
        }
      }
    }
  }
}