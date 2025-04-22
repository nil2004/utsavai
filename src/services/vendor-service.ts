import { supabase } from '@/lib/supabase';

export interface Vendor {
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
  status: string;
  services: string[];
}

export interface CreateVendorInput {
  name: string;
  category: string;
  city: string;
  price: number;
  rating: number;
  description: string;
  contact_email: string;
  contact_phone: string;
  image_url: string;
  status: string;
  services: string[];
}

export async function createVendor(vendor: CreateVendorInput): Promise<Vendor> {
  const { data, error } = await supabase
    .from('vendors')
    .insert([
      {
        name: vendor.name,
        category: vendor.category,
        city: vendor.city,
        price: vendor.price,
        rating: vendor.rating,
        description: vendor.description,
        contact_email: vendor.contact_email,
        contact_phone: vendor.contact_phone,
        image_url: vendor.image_url,
        status: vendor.status,
        services: vendor.services,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateVendor(id: number, vendor: Partial<CreateVendorInput>): Promise<Vendor> {
  const { data, error } = await supabase
    .from('vendors')
    .update({
      name: vendor.name,
      category: vendor.category,
      city: vendor.city,
      price: vendor.price,
      rating: vendor.rating,
      description: vendor.description,
      contact_email: vendor.contact_email,
      contact_phone: vendor.contact_phone,
      image_url: vendor.image_url,
      status: vendor.status,
      services: vendor.services,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
} 