import { createClient } from '@supabase/supabase-js';

/**
 * Utility function to test a direct Supabase connection with provided credentials
 * This bypasses the singleton pattern to test if the credentials themselves work
 */
export const testDirectSupabaseConnection = async (
  url: string,
  key: string
): Promise<{ success: boolean; message: string; data?: any }> => {
  try {
    if (!url || !key) {
      return {
        success: false,
        message: 'Missing URL or API key'
      };
    }

    console.log('Testing direct connection with provided credentials');
    const testClient = createClient(url, key);
    
    // Try a simple query
    const { data, error } = await testClient
      .from('admin_users')
      .select('count(*)', { count: 'exact', head: true });
    
    if (error) {
      console.error('Test connection error:', error);
      return {
        success: false,
        message: error.message || 'Unknown error during test connection'
      };
    }
    
    return {
      success: true,
      message: 'Connection successful',
      data
    };
  } catch (err) {
    console.error('Unexpected error during test connection:', err);
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Unknown error'
    };
  }
}; 