// This is a simplified email service for demonstration purposes
// In a real application, you would integrate with an email API like SendGrid, Mailgun, etc.

interface EmailData {
  name: string;
  email: string;
  phone: string;
  eventDetails: string;
  type: string;
  recipient?: string;
  to?: string;
}

/**
 * Simulates sending form data to an email
 * In a real implementation, this would connect to an email API
 */
export const saveFormDataToEmail = async (formData: EmailData): Promise<{success: boolean}> => {
  // This is just a simulation - no actual email is sent
  console.log('Email would be sent to:', formData.recipient || formData.to || 'nilbrata0@gmail.com');
  console.log('Email content:', formData);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return success
  return { success: true };
};

export default {
  saveFormDataToEmail
}; 