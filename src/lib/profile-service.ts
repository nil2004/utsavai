import { supabase } from './supabase';
import type { Database } from './supabase';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

// Get all profiles with optional filters
export const getProfiles = async (filters?: {
  search?: string;
}): Promise<Profile[]> => {
  try {
    let query = supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Apply filters if provided
    if (filters?.search) {
      query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching profiles:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching profiles:', error);
    return [];
  }
};

// Get a single profile by ID
export const getProfileById = async (id: string): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Unexpected error fetching profile:', error);
    return null;
  }
};

// Update an existing profile
export const updateProfile = async (id: string, updates: ProfileUpdate): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating profile:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Unexpected error updating profile:', error);
    return null;
  }
};

// Delete a profile
export const deleteProfile = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting profile:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error deleting profile:', error);
    return false;
  }
};

// Get profile statistics
export const getProfileStats = async (): Promise<{ total: number, recent: number }> => {
  try {
    // Get total count
    const { count: total, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      throw countError;
    }
    
    // Get recent (last 30 days) count
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { count: recent, error: recentError } = await supabase
      .from('profiles')
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
    console.error('Error getting profile stats:', error);
    return { total: 0, recent: 0 };
  }
};
