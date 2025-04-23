import { createClient } from '@supabase/supabase-js';

// Define the type for your database schema
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
      todos: {
        Row: {
          id: number;
          title: string;
          completed: boolean;
          created_at: string;
        };
        Insert: {
          title: string;
          completed?: boolean;
        };
        Update: {
          title?: string;
          completed?: boolean;
        };
      };
      event_requests: {
        Row: {
          id: number;
          user_id?: string;
          event_type: string;
          location: string;
          budget: number;
          created_at: string;
          status: string;
          special_requests?: string;
        };
        Insert: {
          user_id?: string;
          event_type: string;
          location: string;
          budget: number;
          special_requests?: string;
          status?: string;
        };
        Update: {
          status?: string;
          special_requests?: string;
        };
      };
      event_vendors: {
        Row: {
          id: number;
          event_request_id: number;
          vendor_id: number;
          vendor_name: string;
          vendor_category: string;
          created_at: string;
        };
        Insert: {
          event_request_id: number;
          vendor_id: number;
          vendor_name: string;
          vendor_category: string;
        };
        Update: {
          event_request_id?: number;
          vendor_id?: number;
        };
      };
      user_details: {
        Row: {
          id: number;
          name: string;
          phone: string;
          created_at: string;
          event_request_id: number;
        };
        Insert: {
          name: string;
          phone: string;
          event_request_id: number;
        };
        Update: {
          name?: string;
          phone?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string;
          avatar_url?: string | null;
        };
        Update: {
          email?: string;
          full_name?: string;
          avatar_url?: string | null;
        };
      };
      admin_users: {
        Row: {
          id: number;
          email: string;
          password_hash: string;
          name: string;
          role: string;
          created_at: string;
          last_login?: string;
        };
        Insert: {
          email: string;
          password_hash: string;
          name: string;
          role?: string;
        };
        Update: {
          email?: string;
          password_hash?: string;
          name?: string;
          role?: string;
          last_login?: string;
        };
      };
      vendors: {
        Row: {
          id: number;
          name: string;
          category: string;
          city: string;
          price: number;
          rating: number;
          description: string;
          contact_email: string;
          contact_phone: string;
          image_url: string;
          created_at: string;
          status: string;
          portfolio_images: string[] | null;
          portfolio_description: string | null;
          portfolio_events: string[] | null;
          instagram_reels: string[] | null;
          services: string[];
          experience_years: number;
          completed_events: number;
        };
        Insert: {
          id?: number;
          name: string;
          category: string;
          city: string;
          price: number;
          rating?: number;
          description: string;
          contact_email: string;
          contact_phone: string;
          image_url: string;
          created_at?: string;
          status?: string;
          portfolio_images?: string[] | null;
          portfolio_description?: string | null;
          portfolio_events?: string[] | null;
          instagram_reels?: string[] | null;
          services?: string[];
          experience_years?: number;
          completed_events?: number;
        };
        Update: {
          id?: number;
          name?: string;
          category?: string;
          city?: string;
          price?: number;
          rating?: number;
          description?: string;
          contact_email?: string;
          contact_phone?: string;
          image_url?: string;
          created_at?: string;
          status?: string;
          portfolio_images?: string[] | null;
          portfolio_description?: string | null;
          portfolio_events?: string[] | null;
          instagram_reels?: string[] | null;
          services?: string[];
          experience_years?: number;
          completed_events?: number;
        };
      };
    };
    Views: {
      [_ in never]: never
    };
    Functions: {
      [_ in never]: never
    };
    Enums: {
      [_ in never]: never
    };
  };
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Initializing Supabase with:', {
  url: supabaseUrl?.substring(0, 20) + '...',
  hasKey: !!supabaseAnonKey,
  environment: import.meta.env.MODE
});

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with enhanced config
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 1
    }
  },
  global: {
    fetch: (url, options: RequestInit = {}) => {
      const headers = new Headers(options.headers || {});
      headers.set('apikey', supabaseAnonKey);
      
      if (!headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${supabaseAnonKey}`);
      }

      return fetch(url, {
        ...options,
        headers
      });
    }
  }
});

// Initialize auth state
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event, session?.user?.id);
});

// Test database connection
const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.error('Database connection test failed:', error);
      return false;
    }

    console.log('Database connection successful');
    return true;
  } catch (err) {
    console.error('Unexpected error during connection test:', err);
    return false;
  }
};

// Run initial connection test
void testConnection(); 