import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, PlusCircle, Loader2 } from 'lucide-react';

interface TableInfo {
  name: string;
  rowCount: number;
  exists: boolean;
}

export const SupabaseConnectionTest = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [testVendorResult, setTestVendorResult] = useState<string | null>(null);
  const [isCreatingVendor, setIsCreatingVendor] = useState(false);

  const requiredTables = [
    'admin_users',
    'vendors',
    'event_requests',
    'user_details',
    'event_vendors'
  ];

  const checkTables = async () => {
    console.log('Checking tables status...');
    const tableInfoPromises = requiredTables.map(async (tableName) => {
      try {
        const { count, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
          
        if (error) {
          console.error(`Error checking table ${tableName}:`, error);
          return {
            name: tableName,
            rowCount: 0,
            exists: false
          };
        }
        
        return {
          name: tableName,
          rowCount: count || 0,
          exists: true
        };
      } catch (err) {
        console.error(`Error checking table ${tableName}:`, err);
        return {
          name: tableName,
          rowCount: 0,
          exists: false
        };
      }
    });
    
    try {
      const tableResults = await Promise.all(tableInfoPromises);
      console.log('Table check results:', tableResults);
      setTables(tableResults);
    } catch (err) {
      console.error('Error checking tables:', err);
      setError('Failed to check table status');
    }
  };

  const testConnection = async () => {
    setStatus('loading');
    setError(null);
    setIsLoading(true);
    
    try {
      // Test basic connection
      const { count, error: countError } = await supabase
        .from('vendors')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        throw countError;
      }

      setStatus('success');
      
      // After successful connection, check tables
      await checkTables();
      
    } catch (err) {
      console.error('Connection test failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error during test connection');
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial connection test
  useEffect(() => {
    testConnection();
  }, []);

  const getStatusIcon = (status: boolean | null) => {
    if (status === null) return <AlertCircle className="h-5 w-5 text-gray-400" />;
    if (status) return <CheckCircle className="h-5 w-5 text-green-500" />;
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  // Test vendor creation directly
  const testVendorCreation = async () => {
    setIsCreatingVendor(true);
    setTestVendorResult(null);
    
    try {
      // Create minimal test vendor
      const testVendor = {
        name: "Test Vendor " + new Date().toISOString(),
        category: "Other",
        city: "Test City",
        price: 1000,
        description: "This is a test vendor created from the connection test component",
        contact_email: "test@example.com",
        contact_phone: "+91 1234567890",
        status: "pending"
      };
      
      console.log('Attempting to create test vendor:', testVendor);
      
      const { data, error } = await supabase
        .from('vendors')
        .insert(testVendor)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating test vendor:', error);
        setTestVendorResult(`Error: ${error.message}`);
        return;
      }
      
      console.log('Successfully created test vendor:', data);
      setTestVendorResult(`Success! Created vendor ID: ${data.id}`);
    } catch (err) {
      console.error('Unexpected error creating test vendor:', err);
      setTestVendorResult(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsCreatingVendor(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Supabase Connection Test</CardTitle>
        <CardDescription>
          Check the connection to your Supabase database and verify required tables
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* Connection Status */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
            <div>
              <h3 className="font-medium">Connection Status</h3>
              <p className="text-sm text-muted-foreground">
                {status === 'loading' ? 'Testing database connection...' : 
                  status === 'success' ? 'Connected to Supabase' : 'Failed to connect to Supabase'}
              </p>
              {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
            </div>
            <div>
              {status === 'loading' ? 
                <Loader2 className="h-5 w-5 animate-spin" /> : 
                getStatusIcon(status === 'success')}
            </div>
          </div>
          
          {/* Table Status */}
          <div className="space-y-4">
            <h3 className="font-medium">Required Tables Status</h3>
            
            {isLoading ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-2 text-left">Table Name</th>
                      <th className="px-4 py-2 text-center">Exists</th>
                      <th className="px-4 py-2 text-right">Row Count</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {tables.map((table) => (
                      <tr key={table.name} className="hover:bg-gray-50">
                        <td className="px-4 py-3">{table.name}</td>
                        <td className="px-4 py-3 text-center">
                          {getStatusIcon(table.exists)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {table.exists ? table.rowCount : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {/* Add test vendor creation section */}
          <div className="border rounded-lg p-4 mt-4">
            <h3 className="font-medium mb-2">Test Vendor Creation</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create a test vendor to verify database write access
            </p>
            
            {testVendorResult && (
              <div className={`p-3 rounded-md mb-4 ${
                testVendorResult.startsWith('Success') 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {testVendorResult}
              </div>
            )}
            
            <Button 
              onClick={testVendorCreation} 
              disabled={isCreatingVendor || status !== 'success'}
              className="w-full"
            >
              {isCreatingVendor ? (
                <>
                  <div className="h-4 w-4 border-2 border-t-current animate-spin rounded-full mr-2" />
                  Creating Test Vendor...
                </>
              ) : (
                <>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Test Vendor
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          Database: <code className="bg-gray-100 px-1 py-0.5 rounded">Supabase Project</code>
        </div>
        <Button 
          onClick={testConnection} 
          disabled={isLoading}
          variant="outline"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Check
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}; 