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
          click_time: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          difference: number
          click_time?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          difference?: number
          click_time?: string
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
          username: string
          password_hash: string
          failed_attempts: number
          locked_until: string | null
          created_at: string
        }
        Insert: {
          id?: string
          username: string
          password_hash: string
          failed_attempts?: number
          locked_until?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          password_hash?: string
          failed_attempts?: number
          locked_until?: string | null
          created_at?: string
        }
      }
      admin_logs: {
        Row: {
          id: string
          admin_id: string
          action: string
          details: any | null
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          admin_id: string
          action: string
          details?: any | null
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          admin_id?: string
          action?: string
          details?: any | null
          ip_address?: string | null
          created_at?: string
        }
      }
    }
    Functions: {
      check_phone_exists: {
        Args: { phone_number: string }
        Returns: boolean
      }
      login_user: {
        Args: { phone_number: string }
        Returns: {
          success: boolean
          message?: string
          user?: {
            id: string
            name: string
            phone: string
            attempts_left: number
            best_result: number | null
            discount: number
          }
          token?: string
        }
      }
      register_user: {
        Args: { user_name: string; phone_number: string }
        Returns: {
          success: boolean
          message?: string
          user?: {
            id: string
            name: string
            phone: string
            attempts_left: number
            best_result: number | null
            discount: number
          }
          token?: string
        }
      }
      admin_login: {
        Args: { admin_username: string; input_password: string }
        Returns: {
          success: boolean
          message?: string
          admin?: {
            id: string
            username: string
          }
          token?: string
        }
      }
      log_admin_action: {
        Args: { action_text: string; action_details?: any }
        Returns: boolean
      }
      get_auth_user_id: {
        Args: Record<string, never>
        Returns: string | null
      }
      calculate_discount: {
        Args: { difference_ms: number }
        Returns: number
      }
    }
  }
}