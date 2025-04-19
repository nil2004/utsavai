import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';

type AdminUser = {
  id: number;
  email: string;
  name: string;
  role: string;
};

type AdminAuthContextType = {
  adminUser: AdminUser | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// This is a mock bcrypt compare function since we can't use real bcrypt in the browser
// In a real app, this verification would happen server-side
const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  // For demo purposes only - this is NOT secure for production
  // In production, use a server-side API endpoint for password verification
  if (hash === 'nil.ceo.2023_hash' && password === 'nil.ceo.2023') {
    return true;
  }
  return false;
};

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for admin session in localStorage
    const checkAdminSession = () => {
      const adminSession = localStorage.getItem('adminSession');
      if (adminSession) {
        try {
          const parsedSession = JSON.parse(adminSession);
          setAdminUser(parsedSession);
        } catch (e) {
          localStorage.removeItem('adminSession');
        }
      }
      setLoading(false);
    };

    checkAdminSession();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // First check if credentials match our hardcoded defaults
      // This is a fallback in case Supabase isn't connected
      if (email === 'nil@gmail.com' && password === 'nil.ceo.2023') {
        // Create admin user object directly
        const adminUserData: AdminUser = {
          id: 1,
          email: 'nil@gmail.com',
          name: 'Admin User',
          role: 'administrator'
        };
        
        // Save to state and localStorage
        setAdminUser(adminUserData);
        localStorage.setItem('adminSession', JSON.stringify(adminUserData));
        console.log('Admin login successful using fallback authentication');
        return;
      }
      
      // Otherwise try Supabase if hardcoded credentials don't match
      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('*')
          .eq('email', email)
          .single();
          
        if (error) {
          throw new Error('Authentication failed');
        }
        
        if (!data) {
          throw new Error('Admin user not found');
        }
        
        // Verify password
        const isValid = await verifyPassword(password, data.password_hash);
        
        if (!isValid) {
          throw new Error('Invalid email or password');
        }
        
        // Create admin user object without sensitive data
        const adminUserData: AdminUser = {
          id: data.id,
          email: data.email,
          name: data.name,
          role: data.role
        };
        
        // Save to state and localStorage
        setAdminUser(adminUserData);
        localStorage.setItem('adminSession', JSON.stringify(adminUserData));
        
        // Update last login time
        await supabase
          .from('admin_users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', data.id);
      } catch (supabaseError) {
        console.error('Supabase authentication failed, using fallback method:', supabaseError);
        
        // If credentials match our hardcoded defaults but Supabase failed
        if (email === 'nil@gmail.com' && password === 'nil.ceo.2023') {
          // Create admin user object directly
          const adminUserData: AdminUser = {
            id: 1,
            email: 'nil@gmail.com',
            name: 'Admin User',
            role: 'administrator'
          };
          
          // Save to state and localStorage
          setAdminUser(adminUserData);
          localStorage.setItem('adminSession', JSON.stringify(adminUserData));
          console.log('Admin login successful using fallback authentication');
        } else {
          throw new Error('Authentication failed');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    localStorage.removeItem('adminSession');
    setAdminUser(null);
  };

  const value = {
    adminUser,
    loading,
    error,
    signIn,
    signOut,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
} 