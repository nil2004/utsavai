import { supabase } from './supabase';
import { supabaseProxy } from './supabase-proxy';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './supabase';

// Force direct connection instead of proxy
const shouldUseProxy = () => {
  // We're in the browser
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Always use direct connection regardless of environment
    const useProxy = false;
    
    console.log(`Hostname is "${hostname}" -> Using DIRECT connection (proxy disabled)`);
    return useProxy;
  }
  
  // Default to direct in non-browser environments
  console.log('Non-browser environment detected -> Using DIRECT connection');
  return false;
};

// Debug which client we're using
const clientType = shouldUseProxy() ? 'proxy' : 'direct';
console.log(`Using ${clientType} Supabase client based on environment`);

// Export the appropriate client
export const supabaseClient: SupabaseClient<Database> = shouldUseProxy() ? supabaseProxy : supabase;

// For backward compatibility
export { supabaseClient as supabase }; 