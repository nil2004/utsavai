# Vercel Deployment Guide for UtsavAI

This guide will help you successfully deploy your UtsavAI application to Vercel.

## Step 1: Configure Environment Variables

When deploying to Vercel, you must add the following environment variables to your project:

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add the following variables exactly as they appear in your local `.env` file:

```
VITE_SUPABASE_URL=https://kjahicdvhulwvutldaan.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqYWhpY2R2aHVsd3Z1dGxkYWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1MjYxNTEsImV4cCI6MjA2MDEwMjE1MX0.z2kpTrdVD6DVQ2y4YlXC0zNvfxzcB_hvU5JEyeOaGIo
```

Make sure to set the environment variables to be available in all environments (Production, Preview, and Development).

## Step 2: Deploy Your Application

There are two ways to deploy your application to Vercel:

### Option 1: Deploy from Git Repository

1. Connect your GitHub repository to Vercel
2. Select the repository and branch to deploy
3. Vercel will automatically detect your Vite project
4. Make sure the following settings are correct:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### Option 2: Deploy via Vercel CLI

1. Install Vercel CLI globally: `npm i -g vercel`
2. Run `vercel` in your project directory
3. Follow the prompts to log in and configure your project
4. Deploy your application with `vercel --prod`

## Step 3: Verify Your Deployment

After deployment, check the following:

1. Visit your deployed site and verify that the application loads correctly
2. Test the authentication functionality
3. Verify that data is being fetched from Supabase
4. Check the browser console for any errors

## Troubleshooting

If you encounter issues with your deployment:

1. **Blank Screen or 404 Error**: Check if the `vercel.json` file is present with proper SPA routing configuration
2. **Authentication Issues**: Verify that your Supabase environment variables are set correctly
3. **CORS Issues**: Ensure that your Supabase project has the correct CORS configuration
4. **Build Failures**: Check the build logs for specific errors

## Supabase CORS Configuration

If you experience CORS issues, configure your Supabase project:

1. Go to your Supabase dashboard > Project Settings > API
2. Under "CORS Origins", add your Vercel domain (e.g., `https://your-app.vercel.app`)
3. Save your changes

## Need Help?

If you continue to experience issues with your Vercel deployment, please check the Vercel logs or contact support for assistance. 