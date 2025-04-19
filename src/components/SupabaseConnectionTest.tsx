import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { supabaseProxy } from '../lib/supabase-proxy';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

export function SupabaseConnectionTest() {
  const [directStatus, setDirectStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [proxyStatus, setProxyStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [directError, setDirectError] = useState<string>('');
  const [proxyError, setProxyError] = useState<string>('');
  const [detailedError, setDetailedError] = useState<string>('');

  useEffect(() => {
    testDirectConnection();
  }, []);

  const testDirectConnection = async () => {
    try {
      setDirectStatus('checking');
      setDirectError('');
      setDetailedError('');
      
      console.log('Testing Supabase connection...');
      console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
      
      // Try to fetch vendors
      const { data, error, status } = await supabase
        .from('vendors')
        .select('count', { count: 'exact', head: true });

      console.log('Response status:', status);
      console.log('Response data:', data);
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      setDirectStatus('success');
    } catch (error) {
      console.error('Direct connection test failed:', error);
      setDirectStatus('error');
      
      if (error instanceof Error) {
        setDirectError(error.message);
        setDetailedError(JSON.stringify(error, null, 2));
      } else {
        setDirectError('Unknown error occurred');
        setDetailedError(JSON.stringify(error, null, 2));
      }
    }
  };

  const testProxyConnection = async () => {
    try {
      setProxyStatus('checking');
      setProxyError('');
      
      // Try to fetch vendors through proxy
      const { error } = await supabaseProxy
        .from('vendors')
        .select('count', { count: 'exact', head: true });

      if (error) throw error;
      
      setProxyStatus('success');
    } catch (error) {
      console.error('Proxy connection test failed:', error);
      setProxyStatus('error');
      setProxyError(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Direct Connection Test</CardTitle>
          <CardDescription>
            Tests connection directly to Supabase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className={`p-4 rounded-md ${
            directStatus === 'checking' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
            directStatus === 'success' ? 'bg-green-50 text-green-700 border-green-100' :
            'bg-red-50 text-red-700 border-red-100'
          } border`}>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={
                directStatus === 'checking' ? 'bg-yellow-500' :
                directStatus === 'success' ? 'bg-green-500' : 
                'bg-red-500'
              }>
                {directStatus === 'checking' ? 'Checking...' : 
                 directStatus === 'success' ? 'Success' : 'Failed'}
              </Badge>
            </div>
            {directStatus === 'error' && (
              <>
                <p className="text-sm font-medium mb-2">{directError}</p>
                {detailedError && (
                  <div className="mt-2 p-2 bg-red-100 rounded text-xs font-mono whitespace-pre-wrap">
                    {detailedError}
                  </div>
                )}
              </>
            )}
            {directStatus === 'success' && (
              <p className="text-sm">Successfully connected to Supabase directly</p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={testDirectConnection} variant="default">
            Test Direct Connection
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Proxy Connection Test</CardTitle>
          <CardDescription>
            Tests connection through API Proxy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className={`p-4 rounded-md ${
            proxyStatus === 'checking' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
            proxyStatus === 'success' ? 'bg-green-50 text-green-700 border-green-100' :
            'bg-red-50 text-red-700 border-red-100'
          } border`}>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={
                proxyStatus === 'checking' ? 'bg-yellow-500' :
                proxyStatus === 'success' ? 'bg-green-500' : 
                'bg-red-500'
              }>
                {proxyStatus === 'checking' ? 'Not Tested' : 
                 proxyStatus === 'success' ? 'Success' : 'Failed'}
              </Badge>
            </div>
            {proxyStatus === 'error' && (
              <p className="text-sm">{proxyError}</p>
            )}
            {proxyStatus === 'success' && (
              <p className="text-sm">Successfully connected through proxy</p>
            )}
            <p className="text-sm mt-2 text-amber-600">Proxy connection is disabled in favor of direct connection</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={testProxyConnection} variant="outline">
            Test Proxy Connection
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 