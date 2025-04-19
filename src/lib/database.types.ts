export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      vendors: {
        Row: {
          id: string
          created_at?: string
          name: string
          description?: string
          category?: string
          city?: string
          status?: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description?: string
          category?: string
          city?: string
          status?: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string
          category?: string
          city?: string
          status?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 