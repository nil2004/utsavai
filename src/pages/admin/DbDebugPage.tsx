import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { testDirectSupabaseConnection } from '@/lib/debug-utils';

export const DbDebugPage = () => {
  const [supabaseUrl, setSupabaseUrl] = useState(import.meta.env.VITE_SUPABASE_URL || '');
  const [supabaseKey, setSupabaseKey] = useState(import.meta.env.VITE_SUPABASE_ANON_KEY || '');
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    timestamp?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testConnection = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      // Log environment variables from import.meta
      console.log("Environment variables from import.meta:");
      console.log("URL:", import.meta.env.VITE_SUPABASE_URL ? "exists" : "missing");
      console.log("KEY:", import.meta.env.VITE_SUPABASE_ANON_KEY ? "exists" : "missing");
      
      // Log process.env values (these may not be available in the browser)
      console.log("Environment variables from process.env:");
      // @ts-ignore - process.env may not be available in the browser
      console.log("URL:", process.env?.VITE_SUPABASE_URL ? "exists" : "missing");
      // @ts-ignore - process.env may not be available in the browser
      console.log("KEY:", process.env?.VITE_SUPABASE_ANON_KEY ? "exists" : "missing");
      
      // Test with direct values
      const result = await testDirectSupabaseConnection(supabaseUrl, supabaseKey);
      setTestResult({
        success: result.success,
        message: result.message,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Database Debug Page</h1>
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Database Connection Debug</CardTitle>
          <CardDescription>
            Test Supabase connection with provided credentials
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
                onClick={testConnection}
                disabled={isLoading || !supabaseUrl || !supabaseKey}
                className="w-full"
              >
                {isLoading ? 'Testing Connection...' : 'Test Connection'}
              </Button>
            </div>
            
            {testResult && (
              <div className={`mt-4 p-4 rounded-md ${
                testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <div className="font-medium mb-1">
                  {testResult.success ? 'Connection Successful' : 'Connection Failed'}
                </div>
                <div className="text-sm">
                  {testResult.message}
                </div>
                {testResult.timestamp && (
                  <div className="text-xs text-gray-500 mt-2">
                    Tested at: {new Date(testResult.timestamp).toLocaleString()}
                  </div>
                )}
              </div>
            )}
            
            <div className="mt-6 space-y-4">
              <h3 className="font-medium">Environment Variables</h3>
              <div className="bg-gray-50 p-4 rounded-md border text-sm">
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
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Using direct connection test with provided credentials
          </div>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DbDebugPage; 