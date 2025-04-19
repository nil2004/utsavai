# Database Seeding Instructions for UtsavAI

This document explains how to populate your Supabase database with test data to see vendors in the marketplace, test vendor details, and explore the application's full functionality.

## Prerequisites

1. Node.js installed on your computer
2. Access to Supabase credentials (URL and API key)
3. Basic understanding of terminal/command line usage

## Setup

1. **Install dependencies**

   Make sure you've installed the necessary dependencies by running:

   ```
   npm install dotenv @supabase/supabase-js
   ```

2. **Create .env file**

   Copy the `.env.example` file to a new file named `.env`:

   ```
   cp .env.example .env
   ```

   Then edit the `.env` file to add your Supabase credentials:

   ```
   VITE_SUPABASE_URL=https://kjahicdvhulwvutldaan.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_KEY=your-service-key-here
   ```

   You can use either the anon key or the service key for seeding.

## Running the Seed Script

To populate the database with sample vendors, run:

```
node scripts/seed-vendors.js
```

This will:
1. Check if there are any existing vendors in the database
2. If no vendors exist, it will add 12 sample vendors across different categories
3. If vendors exist, it will warn you and exit without making changes

## Forcing a Reset

If you want to clear all existing vendors and re-seed the database, use the `--force` flag:

```
node scripts/seed-vendors.js --force
```

**⚠️ Warning**: This will delete all existing vendors in your database and replace them with the sample data.

## Verifying the Data

After seeding, you can:

1. Visit the marketplace page to see all vendors
2. Check the category filters to see vendors in different categories
3. View vendor details by clicking on any vendor
4. Test search functionality with vendor names or categories

## Troubleshooting

If you encounter errors:

1. **Authentication errors**: Check your Supabase credentials in the `.env` file
2. **Permission errors**: Make sure your API key has permission to write to the `vendors` table
3. **Table not found**: Ensure your Supabase database has a `vendors` table with the correct schema

## Table Schema

The `vendors` table should have the following columns:

- `id` (auto-incrementing)
- `name` (string)
- `category` (string)
- `city` (string)
- `price` (number)
- `rating` (number)
- `description` (text)
- `contact_email` (string)
- `contact_phone` (string)
- `image_url` (string)
- `status` (string)
- `portfolio_images` (array)
- `portfolio_description` (text)
- `portfolio_events` (array)
- `created_at` (timestamp)

If your table structure is different, you may need to modify the seed script accordingly. 