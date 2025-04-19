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
    const handleCallback = async () => {
      try {
        // Get the code from URL
        const code = new URLSearchParams(location.search).get('code');
        if (!code) {
          throw new Error('No code parameter found in URL');
        }

        // Exchange code for session
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (error) throw error;
        
        if (data.session) {
          console.log('User authenticated:', data.session.user);
          toast({
            title: "Authentication Successful",
            description: "You have been successfully logged in",
          });
          navigate('/');
        } else {
          throw new Error('No session data received');
        }
      } catch (err) {
        console.error('Error in auth callback:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        toast({
          title: "Authentication Error",
          description: "There was a problem logging you in. Please try again.",
          variant: "destructive",
        });
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [navigate, location, toast]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md w-full">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Authentication Error</h2>
          <p className="text-red-600">{error}</p>
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