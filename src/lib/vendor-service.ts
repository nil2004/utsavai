import { supabase } from './supabase-adapter';
import type { Database } from './supabase';

export type Vendor = Database['public']['Tables']['vendors']['Row'];
export type VendorInsert = Database['public']['Tables']['vendors']['Insert'];
export type VendorUpdate = Database['public']['Tables']['vendors']['Update'];

// Default image for vendors without an image
const DEFAULT_VENDOR_IMAGE = 'https://via.placeholder.com/300x200?text=No+Image+Available';

// Vendor status options
export const VENDOR_STATUSES = {
  ACTIVE: 'active',
  PENDING: 'pending',
  INACTIVE: 'inactive',
};

// Sample fallback data for when database is unavailable
export const SAMPLE_VENDORS: Vendor[] = [
  {
    id: 1,
    name: "Elegant Decorations",
    category: "Decorator",
    city: "Mumbai",
    price: 25000,
    rating: 4.8,
    description: "We specialize in creating elegant and memorable decorations for all types of events.",
    contact_email: "contact@elegantdecorations.com",
    contact_phone: "+91 9876543210",
    image_url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=2070",
    status: "active",
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Capture Moments",
    category: "Photographer",
    city: "Delhi",
    price: 40000,
    rating: 4.9,
    description: "Professional photography services to capture your special moments.",
    contact_email: "info@capturemoments.com",
    contact_phone: "+91 9876543211",
    image_url: "https://images.unsplash.com/photo-1554941829-202a0b2403b8?q=80&w=2070",
    status: "active",
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: "Tasty Feasts",
    category: "Caterer",
    city: "Bangalore",
    price: 30000,
    rating: 4.7,
    description: "Delicious food options for all types of events and tastes.",
    contact_email: "orders@tastyfeasts.com",
    contact_phone: "+91 9876543212",
    image_url: "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=2070",
    status: "active",
    created_at: new Date().toISOString(),
  }
];

// Vendor categories
export const VENDOR_CATEGORIES = [
  'Caterer',
  'Decorator',
  'Photographer',
  'Venue',
  'Entertainment',
  'Sound & Lighting',
  'Makeup Artist',
  'Transportation',
  'Florist',
  'Anchor',
  'Wedding Planner',
  'Cake Designer',
  'DJ',
  'Invitation Designer',
  'Jewelry',
  'Other'
];

// Get all vendors with optional filters
export const getVendors = async (filters?: {
  category?: string;
  city?: string;
  status?: string;
  search?: string;
}): Promise<Vendor[]> => {
  try {
    let query = supabase
      .from('vendors')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Apply filters if provided
    if (filters) {
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.city) {
        query = query.eq('city', filters.city);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching vendors:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching vendors:', error);
    return [];
  }
};

// Get a single vendor by ID
export const getVendorById = async (id: number): Promise<Vendor | null> => {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching vendor:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Unexpected error fetching vendor:', error);
    return null;
  }
};

// Create a new vendor
export const createVendor = async (data: VendorInsert): Promise<Vendor | null> => {
  console.log('Creating vendor with data:', JSON.stringify(data, null, 2));
  try {
    const { data: vendor, error } = await supabase
      .from('vendors')
      .insert([data])
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating vendor:', error);
      throw error;
    }

    if (!vendor) {
      console.error('No vendor returned after creation');
      return null;
    }

    console.log('Successfully created vendor:', vendor);
    return vendor;
  } catch (error) {
    console.error('Error in createVendor:', error);
    throw error;
  }
};

// Update an existing vendor
export const updateVendor = async (id: number, updates: VendorUpdate): Promise<Vendor | null> => {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating vendor:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Unexpected error updating vendor:', error);
    return null;
  }
};

// Delete a vendor
export const deleteVendor = async (id: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('vendors')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting vendor:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error deleting vendor:', error);
    return false;
  }
};

// Get vendors grouped by category for dashboard
export const getVendorCountsByCategory = async (): Promise<{ category: string, count: number }[]> => {
  try {
    // In a real app, this would be a database query
    // For our purposes, we'll fetch all vendors and group them
    const vendors = await getVendors();
    
    const counts = VENDOR_CATEGORIES.map(category => {
      const count = vendors.filter(v => v.category === category).length;
      return { category, count };
    }).filter(item => item.count > 0);
    
    return counts;
  } catch (error) {
    console.error('Error getting vendor counts:', error);
    return [];
  }
};

// Get active vendors for the frontend (only show those with active status)
export const getFrontendVendors = async (filters?: {
  category?: string;
  city?: string;
  maxPrice?: number;
  search?: string;
}): Promise<Vendor[]> => {
  try {
    console.log('Fetching frontend vendors with filters:', filters);
    
    try {
      let query = supabase
        .from('vendors')
        .select('*')
        // Remove status filter to show all vendors
        // .eq('status', VENDOR_STATUSES.ACTIVE) 
        .order('rating', { ascending: false }); // Sort by rating
      
      // Apply additional filters if provided
      if (filters) {
        if (filters.category) {
          query = query.eq('category', filters.category);
        }
        if (filters.city) {
          query = query.eq('city', filters.city);
        }
        if (filters.maxPrice) {
          query = query.lte('price', filters.maxPrice);
        }
        if (filters.search) {
          query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
        }
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching frontend vendors:', error);
        throw error;
      }
      
      console.log(`Found ${data?.length || 0} vendors for frontend`);
      return data || [];
      
    } catch (dbError) {
      console.error('Database query failed, falling back to sample data:', dbError);
      console.log('Using sample vendor data as fallback');
      
      // Return sample data as fallback when database errors occur
      return SAMPLE_VENDORS;
    }
  } catch (error) {
    console.error('Unexpected error in getFrontendVendors:', error);
    return SAMPLE_VENDORS;
  }
}; 