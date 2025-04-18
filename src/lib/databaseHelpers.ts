import { supabase } from './supabase';
import type { Vendor } from '@/types';

/**
 * Save event request data to Supabase
 */
export const saveEventRequest = async (
  eventType: string,
  location: string,
  budget: string,
  specialRequests: string = '',
  userId?: string
) => {
  try {
    const { data, error } = await supabase
      .from('event_requests')
      .insert({
        event_type: eventType,
        location: location,
        budget: parseInt(budget) || 0,
        special_requests: specialRequests,
        user_id: userId,
        status: 'pending'
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error saving event request:', error);
      return null;
    }

    return data.id;
  } catch (error) {
    console.error('Unexpected error saving event request:', error);
    return null;
  }
};

/**
 * Save selected vendors to Supabase
 */
export const saveSelectedVendors = async (
  eventRequestId: number,
  vendors: Vendor[]
) => {
  try {
    const vendorData = vendors.map(vendor => ({
      event_request_id: eventRequestId,
      vendor_id: vendor.id,
      vendor_name: vendor.name,
      vendor_category: vendor.category
    }));

    const { error } = await supabase
      .from('event_vendors')
      .insert(vendorData);

    if (error) {
      console.error('Error saving selected vendors:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error saving selected vendors:', error);
    return false;
  }
};

/**
 * Save user details to Supabase
 */
export const saveUserDetails = async (
  name: string,
  phone: string,
  eventRequestId: number
) => {
  try {
    const { error } = await supabase
      .from('user_details')
      .insert({
        name,
        phone,
        event_request_id: eventRequestId
      });

    if (error) {
      console.error('Error saving user details:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error saving user details:', error);
    return false;
  }
};

/**
 * Save complete event request with user details and selected vendors
 */
export const saveCompleteEventRequest = async (
  eventType: string,
  location: string,
  budget: string,
  name: string,
  phone: string,
  specialRequests: string,
  selectedVendors: Vendor[],
  userId?: string
) => {
  try {
    // First save the event request
    const eventRequestId = await saveEventRequest(
      eventType,
      location,
      budget,
      specialRequests,
      userId
    );

    if (!eventRequestId) {
      return { success: false, message: 'Failed to save event request' };
    }

    // Then save the user details
    const userDetailsSaved = await saveUserDetails(
      name,
      phone,
      eventRequestId
    );

    if (!userDetailsSaved) {
      return { success: false, message: 'Failed to save user details' };
    }

    // Finally save the selected vendors
    const vendorsSaved = await saveSelectedVendors(
      eventRequestId,
      selectedVendors
    );

    if (!vendorsSaved) {
      return { success: false, message: 'Failed to save selected vendors' };
    }

    return { 
      success: true, 
      message: 'Successfully saved event request',
      eventRequestId 
    };
  } catch (error) {
    console.error('Error saving complete event request:', error);
    return { 
      success: false, 
      message: 'Unexpected error occurred' 
    };
  }
}; 