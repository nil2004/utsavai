import { supabase } from './supabase';

// Move credentials to environment variables
const DEFAULT_ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@example.com';
const DEFAULT_ADMIN_NAME = 'Admin User';
const DEFAULT_ADMIN_ROLE = 'administrator';

/**
 * Initialize the admin user if it doesn't exist
 * This function would typically be called during first-time app setup
 * or from a protected admin setup endpoint
 */
export const initializeAdminUser = async (): Promise<void> => {
  try {
    // Check if the admin_users table exists
    try {
      const { data: tableExists, error: tableError } = await supabase
        .from('admin_users')
        .select('id')
        .limit(1);
        
      if (tableError && tableError.code === '42P01') { // Table doesn't exist
        console.warn('Admin users table does not exist. Please run migrations first.');
        return;
      }
      
      // Check if admin user exists
      try {
        const { data: existingAdmin, error: adminError } = await supabase
          .from('admin_users')
          .select('id')
          .eq('email', DEFAULT_ADMIN_EMAIL)
          .single();
          
        if (adminError && adminError.code !== 'PGRST116') { // Error other than "no rows returned"
          console.warn('Error checking for existing admin');
          return;
        }
        
        // If admin doesn't exist, create it
        if (!existingAdmin) {
          try {
            const { error: insertError } = await supabase
              .from('admin_users')
              .insert({
                email: DEFAULT_ADMIN_EMAIL,
                name: DEFAULT_ADMIN_NAME,
                role: DEFAULT_ADMIN_ROLE
              });
              
            if (insertError) {
              console.warn('Error creating default admin user');
              return;
            }
            
            console.log('Default admin user created successfully!');
          } catch (insertErr) {
            console.warn('Failed to create admin user');
          }
        } else {
          console.log('Admin user already exists.');
        }
      } catch (adminErr) {
        console.warn('Failed to check for existing admin');
      }
    } catch (tableErr) {
      console.warn('Failed to check admin_users table');
    }
  } catch (error) {
    console.warn('Unexpected error during admin initialization');
  }
};

// Create a SQL migration script for the admin_users table
export const getAdminUsersMigrationSQL = (): string => {
  return `
-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'administrator',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP WITH TIME ZONE
);

-- Add index for email lookups
CREATE INDEX IF NOT EXISTS admin_users_email_idx ON admin_users(email);
  `;
}; 