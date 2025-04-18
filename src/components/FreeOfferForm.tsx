import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

interface FreeOfferFormProps {
  onClose: () => void;
  onSubmitSuccess?: () => void;
  eventType?: string;
  budget?: string;
  location?: string;
}

const FreeOfferForm: React.FC<FreeOfferFormProps> = ({ 
  onClose, 
  onSubmitSuccess, 
  eventType = 'consultation', 
  budget = '0',
  location = ''
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [eventDetails, setEventDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const { user } = useAuth();

  // Test connection on component mount and check if user already submitted
  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('Testing Supabase connection...');
        console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
        console.log('Anon Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
        
        const { data, error } = await supabase
          .from('event_requests')
          .select('count', { count: 'exact', head: true });
        
        if (error) {
          console.error('Connection test failed:', error);
          setIsConnected(false);
          setErrorMessage(`Connection error: ${error.message}`);
        } else {
          console.log('Connection test successful');
          setIsConnected(true);
          setErrorMessage(null);
          
          // If user is logged in, check if they already submitted a consultation request
          if (user) {
            checkUserSubmission();
          }
        }
      } catch (err) {
        console.error('Connection test error:', err);
        setIsConnected(false);
        setErrorMessage('Failed to connect to the database. Please try again later.');
      }
    };

    testConnection();
  }, [user]);
  
  // Check if user has already submitted a consultation request
  const checkUserSubmission = async () => {
    if (!user || !user.id) return;
    
    try {
      const { data, error } = await supabase
        .from('event_requests')
        .select('id')
        .eq('user_id', user.id)
        .eq('request_type', 'consultation')
        .maybeSingle();
      
      if (error) {
        console.error('Error checking user submission:', error);
      } else if (data) {
        console.log('User already submitted a consultation request:', data);
        setAlreadySubmitted(true);
        setRequestId(data.id);
      }
    } catch (err) {
      console.error('Error in checkUserSubmission:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    if (!isConnected) {
      setErrorMessage('Cannot submit form: Database connection is not established');
      setLoading(false);
      return;
    }
    
    if (alreadySubmitted) {
      setErrorMessage('You have already submitted a consultation request');
      setLoading(false);
      return;
    }

    try {
      // Create data object for the event request
      const formData = {
        event_type: eventType || 'consultation',
        location: location || 'Not specified',
        budget: parseInt(budget) || 0,
        customer_name: name,
        customer_phone: phone,
        special_requests: eventDetails || 'No specific details provided',
        status: 'pending',
        vendor_count: 0,
        request_type: 'consultation',
        user_id: user?.id // Store the user ID with the request
      };
      
      console.log('Attempting to save consultation request with data:', formData);
      
      // Save to event_requests table in Supabase
      const { data: requestData, error } = await supabase
        .from('event_requests')
        .insert(formData)
        .select('id')
        .single();
      
      if (error) {
        console.error('Error saving consultation request:', error);
        console.error('Error details:', error.details, error.hint, error.code);
        
        if (error.code === '23502') {
          throw new Error('Some required fields are missing. Please check your form.');
        } else if (error.code === '23503') {
          throw new Error('Invalid reference in form data. Please try again.');
        } else {
          throw new Error(`Database error: ${error.message}`);
        }
      }
      
      if (requestData?.id) {
        setRequestId(requestData.id);
        console.log('Successfully saved consultation request with ID:', requestData.id);
        setSubmitted(true);
        
        // Save to localStorage that the user has used the offer
        localStorage.setItem('hasUsedExpertOffer', 'true');
        
        if (onSubmitSuccess) {
          onSubmitSuccess();
        }
      } else {
        throw new Error('No request ID returned from the database');
      }
    } catch (error) {
      console.error('Error submitting consultation request:', error);
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('There was an error submitting your request. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // If user already submitted a request, show the success message with their request ID
  if (alreadySubmitted) {
    return (
      <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg text-center space-y-4">
        <AlertCircle className="h-16 w-16 mx-auto text-amber-500" />
        <h3 className="text-xl font-semibold text-amber-800">You've Already Requested Consultation</h3>
        <p className="text-amber-700">You can only request one free consultation per account.</p>
        {requestId && (
          <div className="bg-white p-3 rounded-md border border-amber-200 mt-4">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Your Request ID:</span> #{requestId}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Our team is working on your request
            </p>
          </div>
        )}
        <Button onClick={onClose} className="mt-4 bg-primary hover:bg-primary/90">
          Continue Exploring
        </Button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="p-6 bg-green-50 border border-green-200 rounded-lg text-center space-y-4">
        <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
        <h3 className="text-xl font-semibold text-green-800">Thank You!</h3>
        <div className="flex items-center justify-start mt-4 text-sm">
          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
          <p className="text-green-700">Our UtsavAI team will connect with you within 24 hours.</p>
        </div>
        {requestId && (
          <div className="bg-white p-3 rounded-md border border-green-200 mt-4">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Request ID:</span> #{requestId}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Please save this ID for your reference
            </p>
          </div>
        )}
        <Button onClick={onClose} className="mt-4 bg-primary hover:bg-primary/90">
          Continue Exploring
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-lg border border-violet-200 bg-gradient-to-br from-violet-50 to-white">
      <h3 className="text-xl font-semibold mb-4 text-violet-800">🎁 Free Expert Event Planning</h3>
      <p className="mb-4 text-gray-700">
        Let our expert team with 7+ years of experience help you plan your perfect event. Fill in your details and we'll contact you within 24 hours.
      </p>
      
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <p className="font-semibold">Error:</p>
          </div>
          <p>{errorMessage}</p>
        </div>
      )}

      {isConnected === false && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <p>Database connection is not established. Please try again later.</p>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-gray-700">Your Name</Label>
          <Input 
            id="name" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1"
            placeholder="Enter your full name"
            disabled={!isConnected || loading}
          />
        </div>
        
        <div>
          <Label htmlFor="phone" className="text-gray-700">Phone Number</Label>
          <Input 
            id="phone" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)}
            required
            className="mt-1"
            placeholder="+91 12345 67890"
            disabled={!isConnected || loading}
          />
        </div>
        
        <div>
          <Label htmlFor="eventDetails" className="text-gray-700">Event Details (Optional)</Label>
          <Textarea 
            id="eventDetails" 
            value={eventDetails} 
            onChange={(e) => setEventDetails(e.target.value)}
            className="mt-1 min-h-[100px]"
            placeholder="Tell us more about your event type, expected date, location, and any specific requirements"
            disabled={!isConnected || loading}
          />
        </div>
        
        <div className="flex space-x-3 pt-2">
          <Button 
            type="submit" 
            className="bg-accent hover:bg-accent/90 text-white"
            disabled={!isConnected || loading}
          >
            {loading ? 'Submitting...' : 'Get Free Expert Advice'}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={loading}
          >
            No, Thanks
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FreeOfferForm; 