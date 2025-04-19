import { supabase } from './supabase';
import { supabaseProxy } from './supabase-proxy';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './supabase';

// Determine if we should use the proxy based on hostname
const shouldUseProxy = () => {
  // We're in the browser
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const useProxy = hostname.includes('utsavai.com') || 
           hostname.includes('vercel.app') || 
           !hostname.includes('localhost');
    
    console.log(`Hostname is "${hostname}" -> Using ${useProxy ? 'PROXY' : 'DIRECT'} connection`);
    return useProxy;
  }
  
  // Default to proxy in non-browser environments
  console.log('Non-browser environment detected -> Using PROXY connection');
  return true;
};

// Debug which client we're using
const clientType = shouldUseProxy() ? 'proxy' : 'direct';
console.log(`Using ${clientType} Supabase client based on environment`);

// Export the appropriate client
export const supabaseClient: SupabaseClient<Database> = shouldUseProxy() ? supabaseProxy : supabase;

// For backward compatibility
export { supabaseClient as supabase }; 