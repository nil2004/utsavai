import { createClient } from '@supabase/supabase-js';
import type { Database } from './supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug logging
console.log('Initializing proxy Supabase client with:', {
  url: supabaseUrl,
  keyExists: !!supabaseAnonKey,
  useProxy: true
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!');
  throw new Error('Missing required environment variables for Supabase connection');
}

// Custom fetch function that routes through our API proxy
const customFetch = async (url: string, options: RequestInit = {}) => {
  try {
    // Replace the Supabase URL with the proxy URL
    const proxyUrl = url.replace(supabaseUrl, '/api/supabase-proxy');
    
    console.log(`Routing Supabase request through proxy: ${url} -> ${proxyUrl}`);
    
    const response = await fetch(proxyUrl, options);
    return response;
  } catch (error) {
    console.error('Error in proxy fetch:', error);
    throw error;
  }
};

// Create a Supabase client that uses our proxy
export const supabaseProxy = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    fetch: customFetch
  },
  db: {
    schema: 'public'
  }
});

// Test the proxied connection
supabaseProxy.from('vendors').select('count', { count: 'exact', head: true })
  .then(({ error }) => {
    if (error) {
      console.error('Proxied Supabase connection test failed:', error);
    } else {
      console.log('Proxied Supabase connection test successful');
    }
  }); 