import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase-adapter';

export function SupabaseTest() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [testData, setTestData] = useState<any[]>([]);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      // Test 1: Check if we can connect to Supabase
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) throw authError;

      // Test 2: Try to insert a test todo
      const { data: insertData, error: insertError } = await supabase
        .from('todos')
        .insert([{ title: 'Test Connection Todo' }])
        .select();

      if (insertError) throw insertError;

      // Test 3: Try to fetch todos
      const { data: fetchData, error: fetchError } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setTestData(fetchData || []);
      setConnectionStatus('success');
    } catch (error) {
      console.error('Connection test failed:', error);
      setConnectionStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      
      <div className="mb-4 p-4 rounded border">
        <h2 className="text-lg font-semibold mb-2">Connection Status:</h2>
        <div className={`p-2 rounded ${
          connectionStatus === 'checking' ? 'bg-yellow-100 text-yellow-800' :
          connectionStatus === 'success' ? 'bg-green-100 text-green-800' :
          'bg-red-100 text-red-800'
        }`}>
          {connectionStatus === 'checking' && 'Checking connection...'}
          {connectionStatus === 'success' && '✅ Connection successful!'}
          {connectionStatus === 'error' && `❌ Connection failed: ${errorMessage}`}
        </div>
      </div>

      {connectionStatus === 'success' && (
        <div className="mb-4 p-4 rounded border">
          <h2 className="text-lg font-semibold mb-2">Test Data:</h2>
          <pre className="bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(testData, null, 2)}
          </pre>
        </div>
      )}

      <button
        onClick={testConnection}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Test Connection Again
      </button>
    </div>
  );
} 