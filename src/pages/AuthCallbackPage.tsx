import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useToast } from '@/components/ui/use-toast';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Extract hash params and search params
    const hashParams = new URLSearchParams(location.hash.substring(1));
    const searchParams = new URLSearchParams(location.search);
    
    // Check for errors in URL
    const errorParam = hashParams.get('error') || searchParams.get('error');
    const errorDescription = hashParams.get('error_description') || searchParams.get('error_description');
    
    if (errorParam || errorDescription) {
      console.error('Auth error from URL:', { errorParam, errorDescription });
      setError(errorDescription || errorParam || 'Authentication failed');
      
      // Show error toast
      toast({
        title: "Authentication Error",
        description: (errorDescription || 'Authentication failed').replace(/\+/g, ' '),
        variant: "destructive",
      });
      
      // Redirect to login after delay
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    // If no error in URL, check session
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (data.session) {
          console.log('User authenticated:', data.session.user);
          toast({
            title: "Authentication Successful",
            description: "You have been successfully logged in",
          });
          navigate('/');
        } else {
          // No session found but also no error in URL - strange case
          console.warn('No session found but no error in callback URL');
          navigate('/login');
        }
      } catch (err) {
        console.error('Error checking session:', err);
        setError('Error verifying your login. Please try again.');
        toast({
          title: "Authentication Error",
          description: "There was a problem logging you in. Please try again.",
          variant: "destructive",
        });
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    checkSession();
  }, [navigate, location, toast]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md w-full">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Authentication Error</h2>
          <p className="text-red-600">{error.replace(/\+/g, ' ')}</p>
          <p className="text-sm text-gray-500 mt-2">Redirecting you back to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Completing your login...</h2>
        <p className="text-gray-600">Please wait while we authenticate your account.</p>
      </div>
    </div>
  );
} 