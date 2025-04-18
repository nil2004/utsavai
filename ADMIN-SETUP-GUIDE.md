# Admin Panel Setup Guide

This guide explains how to set up and use the admin panel for the EventBuddy application.

## Setup Instructions

### 1. Configure Supabase

1. Create a Supabase account and project at [https://supabase.com](https://supabase.com)
2. In your Supabase project, go to the SQL Editor
3. Create a new query and paste the contents of the `setup-admin-db.sql` file
4. Run the SQL script to create all necessary tables and sample data

### 2. Configure Environment Variables

Ensure your `.env` file contains the following variables:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Replace these with your actual Supabase project URL and anonymous key.

### 3. Access the Admin Panel

1. Run your application with `npm run dev`
2. Navigate to `/admin/login` in your browser
3. Log in with the default admin credentials:
   - Email: `nil@gmail.com`
   - Password: `nil123`
4. After logging in, you'll be redirected to the admin dashboard

## Admin Features

### Dashboard

The dashboard provides an overview of:
- Total Users
- Total Event Requests
- Total Vendors
- Estimated Revenue
- Recent Event Requests
- Top Vendors by Rating

### Vendor Management

The Vendors page (`/admin/vendors`) allows you to:
- View all vendors with filtering by category and status
- Add new vendors
- Edit existing vendor information
- Delete vendors from the platform

### Event Requests Management

The Event Requests page (`/admin/event-requests`) allows you to:
- View all event requests with filtering by status
- See details of each request including user information and selected vendors
- Update the status of requests (pending, in progress, completed, cancelled)

## Troubleshooting

If the admin panel is not working properly:

1. Check browser console for errors
2. Verify that your Supabase project URL and anon key are correct in the `.env` file
3. Ensure that the SQL script was executed successfully in Supabase
4. Try logging in with the default admin credentials
5. If tables exist but are empty, run the sample data insertion queries again

## Security Considerations

The current setup includes:
- Basic Row Level Security (RLS) policies in Supabase
- Simple admin authentication

For production use, consider:
- Implementing more restricted RLS policies
- Using proper password hashing (bcrypt) on the server side
- Adding two-factor authentication for admin users
- Setting up proper role-based access control 