import { supabase } from './supabase';
import type { Database } from './supabase';

export type UserDetail = Database['public']['Tables']['user_details']['Row'];
export type UserDetailInsert = Database['public']['Tables']['user_details']['Insert'];
export type UserDetailUpdate = Database['public']['Tables']['user_details']['Update'];

// Get all users with optional filters
export const getUserDetails = async (filters?: {
  search?: string;
}): Promise<UserDetail[]> => {
  try {
    let query = supabase
      .from('user_details')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Apply filters if provided
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching user details:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching user details:', error);
    return [];
  }
};

// Get a single user by ID
export const getUserDetailById = async (id: number): Promise<UserDetail | null> => {
  try {
    const { data, error } = await supabase
      .from('user_details')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching user detail:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Unexpected error fetching user detail:', error);
    return null;
  }
};

// Get users with their event requests
export const getUsersWithEvents = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('user_details')
      .select(`
        *,
        event_requests:event_request_id (*)
      `);
    
    if (error) {
      console.error('Error fetching users with events:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching users with events:', error);
    return [];
  }
};

// Update an existing user
export const updateUserDetail = async (id: number, updates: UserDetailUpdate): Promise<UserDetail | null> => {
  try {
    const { data, error } = await supabase
      .from('user_details')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user detail:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Unexpected error updating user detail:', error);
    return null;
  }
};

// Delete a user
export const deleteUserDetail = async (id: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_details')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting user detail:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error deleting user detail:', error);
    return false;
  }
};

// Get user statistics
export const getUserStats = async (): Promise<{ total: number, recent: number }> => {
  try {
    // Get total count
    const { count: total, error: countError } = await supabase
      .from('user_details')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      throw countError;
    }
    
    // Get recent (last 30 days) count
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { count: recent, error: recentError } = await supabase
      .from('user_details')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString());
    
    if (recentError) {
      throw recentError;
    }
    
    return {
      total: total || 0,
      recent: recent || 0
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return { total: 0, recent: 0 };
  }
}; 