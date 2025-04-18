import { supabase } from './supabase';

/**
 * Creates a new event request
 */
export const createEventRequest = async (eventData: any): Promise<{success: boolean, error?: any}> => {
  try {
    const { error } = await supabase
      .from('event_requests')
      .insert(eventData);

    if (error) {
      console.error('Error creating event request:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in createEventRequest:', error);
    return { success: false, error };
  }
};

/**
 * Saves a complete event request with vendor selections
 */
export const saveCompleteEventRequest = async (
  eventType: string,
  location: string,
  budget: string,
  name: string,
  phone: string,
  specialRequests: string,
  selectedVendors: any[]
): Promise<{success: boolean, error?: any, request_id?: number}> => {
  try {
    console.log('Saving event request:', {
      eventType,
      location,
      budget,
      name,
      phone,
      specialRequests,
      selectedVendors: selectedVendors.length
    });
    
    // Convert budget to number
    const budgetNumber = parseInt(budget) || 0;
    
    // Save the event request to Supabase
    const { data: requestData, error } = await supabase
      .from('event_requests')
      .insert({
        event_type: eventType,
        location: location,
        budget: budgetNumber,
        customer_name: name,
        customer_phone: phone,
        special_requests: specialRequests,
        status: 'pending',
        vendor_count: selectedVendors.length
      })
      .select('id')
      .single();
    
    if (error) {
      console.error('Error saving event request:', error);
      return { success: false, error };
    }
    
    // If we have selected vendors and a request ID, save each vendor interest
    if (selectedVendors.length > 0 && requestData?.id) {
      const vendorInterests = selectedVendors.map(vendor => ({
        event_request_id: requestData.id,
        vendor_id: vendor.id,
        vendor_name: vendor.name,
        vendor_category: vendor.category,
        status: 'pending'
      }));
      
      const { error: vendorsError } = await supabase
        .from('vendor_interests')
        .insert(vendorInterests);
      
      if (vendorsError) {
        console.error('Error saving vendor interests:', vendorsError);
        // Continue despite error since the main request was saved
      }
    }
    
    return { success: true, request_id: requestData?.id };
  } catch (error) {
    console.error('Error saving complete event request:', error);
    return { success: false, error };
  }
};

export default {
  createEventRequest,
  saveCompleteEventRequest
};
