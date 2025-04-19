import { createClient } from '@supabase/supabase-js';

// Define the type for your database schema
export type Database = {
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
          image_url?: string;
          created_at: string;
          status: string;
          portfolio_images?: string[];
          portfolio_description?: string;
          portfolio_events?: string[];
        };
        Insert: {
          name: string;
          category: string;
          city: string;
          price: number;
          rating?: number;
          description: string;
          contact_email: string;
          contact_phone: string;
          image_url?: string;
          status?: string;
          portfolio_images?: string[];
          portfolio_description?: string;
          portfolio_events?: string[];
        };
        Update: {
          name?: string;
          category?: string;
          city?: string;
          price?: number;
          rating?: number;
          description?: string;
          contact_email?: string;
          contact_phone?: string;
          image_url?: string;
          status?: string;
          portfolio_images?: string[];
          portfolio_description?: string;
          portfolio_events?: string[];
        };
      };
    };
  };
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug logging
console.log('Initializing Supabase client with:', {
  url: supabaseUrl,
  keyExists: !!supabaseAnonKey
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!');
  throw new Error('Missing required environment variables for Supabase connection');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  }
});

// Enhanced connection testing
async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');
    console.log('Supabase URL:', supabaseUrl);
    console.log('Anon Key exists:', !!supabaseAnonKey);
    
    const { data, error, count } = await supabase
      .from('vendors')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details
      });
      throw error;
    }
    
    console.log('Supabase connection test successful');
    console.log('Vendors count:', count);
    return true;
  } catch (err) {
    console.error('Unexpected error during Supabase connection test:', err);
    return false;
  }
}

// Run the connection test
testSupabaseConnection(); 