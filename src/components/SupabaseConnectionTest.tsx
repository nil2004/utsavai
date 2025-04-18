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

  useEffect(() => {
    testDirectConnection();
    testProxyConnection();
  }, []);

  const testDirectConnection = async () => {
    try {
      setDirectStatus('checking');
      setDirectError('');
      
      // Try to fetch vendors
      const { error } = await supabase
        .from('vendors')
        .select('count', { count: 'exact', head: true });

      if (error) throw error;
      
      setDirectStatus('success');
    } catch (error) {
      console.error('Direct connection test failed:', error);
      setDirectStatus('error');
      setDirectError(error instanceof Error ? error.message : 'Unknown error occurred');
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
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Supabase Connection Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Direct Connection */}
        <Card>
          <CardHeader>
            <CardTitle>Direct Connection</CardTitle>
            <CardDescription>Tests connection directly to Supabase</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-2">
              <span>Status:</span>
              {directStatus === 'checking' && <Badge variant="outline">Checking...</Badge>}
              {directStatus === 'success' && <Badge className="bg-green-500">Connected</Badge>}
              {directStatus === 'error' && <Badge variant="destructive">Error</Badge>}
            </div>
            {directError && (
              <div className="text-red-500 text-sm mt-2 p-2 bg-red-50 rounded">
                {directError}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={testDirectConnection} variant="outline">
              Test Direct Connection
            </Button>
          </CardFooter>
        </Card>

        {/* Proxy Connection */}
        <Card>
          <CardHeader>
            <CardTitle>Proxy Connection</CardTitle>
            <CardDescription>Tests connection through API Proxy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-2">
              <span>Status:</span>
              {proxyStatus === 'checking' && <Badge variant="outline">Checking...</Badge>}
              {proxyStatus === 'success' && <Badge className="bg-green-500">Connected</Badge>}
              {proxyStatus === 'error' && <Badge variant="destructive">Error</Badge>}
            </div>
            {proxyError && (
              <div className="text-red-500 text-sm mt-2 p-2 bg-red-50 rounded">
                {proxyError}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={testProxyConnection} variant="outline">
              Test Proxy Connection
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Separator className="my-8" />
      
      <div className="bg-gray-50 p-4 rounded">
        <h3 className="text-lg font-medium mb-2">Troubleshooting Tips:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Make sure your Supabase URL and anon key are correctly set in the environment variables.</li>
          <li>If direct connection works but proxy doesn't, the API proxy configuration may be incorrect.</li>
          <li>Check browser console for detailed error messages.</li>
          <li>Verify that the API proxy endpoint is deployed and accessible.</li>
          <li>If you're experiencing CORS errors, the proxy should help resolve these issues.</li>
        </ul>
      </div>
    </div>
  );
} 