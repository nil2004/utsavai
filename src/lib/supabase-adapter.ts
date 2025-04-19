import { supabase } from './supabase';
import { supabaseProxy } from './supabase-proxy';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './supabase';

// Determine if we should use the proxy based on hostname
const shouldUseProxy = () => {
  // We're in the browser
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Use proxy for production domains, but not localhost or development
    return hostname.includes('utsavai.com') || 
           hostname.includes('vercel.app') || 
           !hostname.includes('localhost');
  }
  // Default to proxy in non-browser environments
  return true;
};

// Debug which client we're using
const clientType = shouldUseProxy() ? 'proxy' : 'direct';
console.log(`Using ${clientType} Supabase client based on environment`);

// Export the appropriate client
export const supabaseClient: SupabaseClient<Database> = shouldUseProxy() ? supabaseProxy : supabase;

// For backward compatibility
export { supabaseClient as supabase }; 