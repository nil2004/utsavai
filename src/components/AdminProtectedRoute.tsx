import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAdminAuth } from "@/lib/admin-auth-context";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const AdminProtectedRoute = () => {
  const { adminUser, loading } = useAdminAuth();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const verifyAdminStatus = async () => {
      try {
        setIsVerifying(true);
        
        // Skip verification if we're already loading or if there's no admin user
        if (loading || !adminUser) {
          setIsAuthorized(false);
          setIsVerifying(false);
          return;
        }

        // Verify with Supabase if the user is actually an admin
        // This adds an extra layer of security beyond localStorage
        if (adminUser.email === 'nil@gmail.com') {
          // Special case for hardcoded admin user
          setIsAuthorized(true);
        } else {
          // Check against database for other admin users
          const { data, error } = await supabase
            .from('admin_users')
            .select('role')
            .eq('id', adminUser.id)
            .eq('email', adminUser.email)
            .single();

          if (error || !data) {
            console.error('Failed to verify admin status:', error);
            setIsAuthorized(false);
          } else {
            // Only allow if role is admin or administrator
            setIsAuthorized(data.role === 'admin' || data.role === 'administrator');
          }
        }
      } catch (error) {
        console.error('Error verifying admin status:', error);
        setIsAuthorized(false);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyAdminStatus();
  }, [adminUser, loading]);

  // Show loading state while checking auth
  if (loading || isVerifying) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-500">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // If not logged in as admin or not authorized, redirect to admin login
  if (!adminUser || !isAuthorized) {
    // Save the location they were trying to access for redirect after login
    localStorage.setItem('adminRedirectPath', location.pathname);
    
    return <Navigate to="/admin/login" replace state={{ from: location, message: "Admin access required" }} />;
  }

  // Render the protected admin routes
  return <Outlet />;
};

export default AdminProtectedRoute; 