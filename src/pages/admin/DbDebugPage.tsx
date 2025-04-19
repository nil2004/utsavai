import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { testDirectSupabaseConnection, testProxyConnection } from '@/lib/debug-utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const DbDebugPage = () => {
  const [supabaseUrl, setSupabaseUrl] = useState(import.meta.env.VITE_SUPABASE_URL || '');
  const [supabaseKey, setSupabaseKey] = useState(import.meta.env.VITE_SUPABASE_ANON_KEY || '');
  const [directTestResult, setDirectTestResult] = useState<{
    success: boolean;
    message: string;
    timestamp?: string;
  } | null>(null);
  const [proxyTestResult, setProxyTestResult] = useState<{
    success: boolean;
    message: string;
    timestamp?: string;
  } | null>(null);
  const [isDirectLoading, setIsDirectLoading] = useState(false);
  const [isProxyLoading, setIsProxyLoading] = useState(false);

  const testDirectConnection = async () => {
    setIsDirectLoading(true);
    setDirectTestResult(null);
    
    try {
      // Log environment variables from import.meta
      console.log("Environment variables from import.meta:");
      console.log("URL:", import.meta.env.VITE_SUPABASE_URL ? "exists" : "missing");
      console.log("KEY:", import.meta.env.VITE_SUPABASE_ANON_KEY ? "exists" : "missing");
      
      // Test with direct values
      const result = await testDirectSupabaseConnection(supabaseUrl, supabaseKey);
      setDirectTestResult({
        success: result.success,
        message: result.message,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      setDirectTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsDirectLoading(false);
    }
  };

  const testProxyConnectionHandler = async () => {
    setIsProxyLoading(true);
    setProxyTestResult(null);
    
    try {
      const result = await testProxyConnection();
      setProxyTestResult({
        success: result.success,
        message: result.message,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      setProxyTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsProxyLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Database Debug Page</h1>
      
      <Tabs defaultValue="direct" className="max-w-3xl mx-auto">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="direct">Direct Connection</TabsTrigger>
          <TabsTrigger value="proxy">Proxy Connection</TabsTrigger>
        </TabsList>
        
        <TabsContent value="direct">
          <Card>
            <CardHeader>
              <CardTitle>Test Direct Connection</CardTitle>
              <CardDescription>
                Test connection directly with Supabase credentials
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="supabaseUrl">Supabase URL</Label>
                  <Input
                    id="supabaseUrl"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="https://your-project.supabase.co"
                    className="font-mono text-sm"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="supabaseKey">Supabase Anon Key</Label>
                  <Input
                    id="supabaseKey"
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    placeholder="your-anon-key"
                    className="font-mono text-sm"
                    type="password"
                  />
                </div>
                
                <div className="pt-4">
                  <Button 
                    onClick={testDirectConnection}
                    disabled={isDirectLoading || !supabaseUrl || !supabaseKey}
                    className="w-full"
                  >
                    {isDirectLoading ? 'Testing Direct Connection...' : 'Test Direct Connection'}
                  </Button>
                </div>
                
                {directTestResult && (
                  <div className={`mt-4 p-4 rounded-md ${
                    directTestResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="font-medium mb-1">
                      {directTestResult.success ? 'Connection Successful' : 'Connection Failed'}
                    </div>
                    <div className="text-sm">
                      {directTestResult.message}
                    </div>
                    {directTestResult.timestamp && (
                      <div className="text-xs text-gray-500 mt-2">
                        Tested at: {new Date(directTestResult.timestamp).toLocaleString()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="proxy">
          <Card>
            <CardHeader>
              <CardTitle>Test Proxy Connection</CardTitle>
              <CardDescription>
                Test connection through API proxy (for production environments)
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  This test will use the supabase-proxy adapter to test the connection through the API proxy.
                  This is useful for testing if the proxy configuration works in production environments.
                </p>
                
                <div className="pt-4">
                  <Button 
                    onClick={testProxyConnectionHandler}
                    disabled={isProxyLoading}
                    className="w-full"
                  >
                    {isProxyLoading ? 'Testing Proxy Connection...' : 'Test Proxy Connection'}
                  </Button>
                </div>
                
                {proxyTestResult && (
                  <div className={`mt-4 p-4 rounded-md ${
                    proxyTestResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="font-medium mb-1">
                      {proxyTestResult.success ? 'Proxy Connection Successful' : 'Proxy Connection Failed'}
                    </div>
                    <div className="text-sm">
                      {proxyTestResult.message}
                    </div>
                    {proxyTestResult.timestamp && (
                      <div className="text-xs text-gray-500 mt-2">
                        Tested at: {new Date(proxyTestResult.timestamp).toLocaleString()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="max-w-3xl mx-auto mt-6 bg-gray-50 p-4 rounded-md border text-sm">
        <h3 className="font-medium mb-2">Environment Variables</h3>
        <div className="space-y-1">
          <div>
            <span className="font-mono text-gray-500">VITE_SUPABASE_URL:</span>{' '}
            {import.meta.env.VITE_SUPABASE_URL ? 'Present ✅' : 'Missing ❌'}
          </div>
          <div>
            <span className="font-mono text-gray-500">VITE_SUPABASE_ANON_KEY:</span>{' '}
            {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present ✅' : 'Missing ❌'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DbDebugPage; 