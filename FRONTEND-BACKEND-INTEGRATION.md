# Frontend-Backend Integration Guide

This guide explains how to connect the UtsavAI Event Buddy chat frontend to the Supabase backend database.

## Overview

The integration between frontend and backend has been implemented using Supabase's JavaScript client. The key components are:

1. **Supabase Client Setup**: Configured in `src/lib/supabase.ts`
2. **Database Helpers**: Functions to interact with Supabase in `src/lib/databaseHelpers.ts`
3. **Vendor Services**: Vendor-specific database operations in `src/lib/vendor-service.ts`
4. **Frontend Integration**: Implemented in `src/pages/ChatPage.tsx`

## Environment Variables

Make sure your `.env` file contains the Supabase URL and anon key:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Key Integration Points

### 1. Fetching Vendors from Supabase

We've replaced the hardcoded sample data with real database queries:

```typescript
// In ChatPage.tsx

// Get vendors from Supabase
const supabaseVendors = await getFrontendVendors({
  city: location,
  maxPrice: parseInt(budget) || undefined
});

// Map to UI format
availableVendors = supabaseVendors.map(vendor => ({
  id: vendor.id,
  name: vendor.name,
  category: vendor.category,
  rating: vendor.rating,
  reviewCount: Math.floor(Math.random() * 100) + 50,
  priceRange: `₹${(vendor.price * 0.7).toLocaleString()} - ₹${(vendor.price * 1.3).toLocaleString()}`,
  price: vendor.price,
  image: vendor.image_url || "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=2070",
  city: vendor.city
}));
```

### 2. Creating Event Requests

When a user submits an interest form, the data is saved to Supabase:

```typescript
// In ChatPage.tsx

const result = await saveCompleteEventRequest(
  selectedEvent || 'custom',
  location,
  budget,
  name,
  phone,
  specialRequests,
  selectedVendors
);
```

### 3. Admin Panel Integration

The admin panel connects to the same Supabase database to manage vendors and event requests.

## Database Schema

The Supabase database includes the following tables:

1. **vendors**: Store vendor information
2. **event_requests**: Store user event requests
3. **event_vendors**: Junction table connecting events and vendors
4. **user_details**: Store user contact information
5. **admin_users**: Store admin user accounts

## Different Vendor Counts Explained

The difference in vendor counts between admin (13) and frontend (11) is because:

- Admin panel shows all vendors regardless of status
- Frontend only shows vendors with "active" status
- Vendors with "pending" or "inactive" status are hidden from users

## Testing the Integration

1. Visit the `/admin` route to manage vendors
2. Set the status of vendors to "active" to make them visible on the frontend
3. Use the main chat interface to test vendor suggestions based on your selections

## Troubleshooting

If vendors aren't appearing on the frontend:

1. Check that vendors have "active" status in the admin panel
2. Verify that the Supabase URL and anon key are correct in your .env file
3. Look for console errors that might indicate connection problems
4. Test with the `SupabaseConnectionTest` component

## Next Steps

1. Implement real-time updates using Supabase's realtime subscriptions
2. Add user authentication to store user-specific data
3. Enhance the admin dashboard with more detailed analytics 