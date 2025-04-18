# UtsavAI Vercel Deployment Guide

This guide provides instructions for deploying your UtsavAI application to Vercel, with a focus on properly configuring Supabase environment variables and handling CORS issues.

## 1. Environment Variables Setup

You must add the following environment variables in your Vercel project:

1. Navigate to your project in the Vercel dashboard
2. Go to Settings → Environment Variables
3. Add the following variables:

```
VITE_SUPABASE_URL=https://kjahicdvhulwvutldaan.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-value
```

Make sure to use your actual Supabase anon key value.

## 2. API Proxy for CORS Issues

We've implemented a proxy solution to solve potential CORS issues when accessing Supabase from your custom domain. The proxy is already set up in the code:

1. The `/api/supabase-proxy.js` file works as a serverless function that forwards requests to Supabase
2. The `src/lib/supabase-proxy.ts` file provides a Supabase client that routes requests through the proxy

When deploying to Vercel, these files will be automatically recognized and deployed as serverless functions. No additional configuration is needed.

To test if the proxy is working:
- Navigate to `/supabase-status` on your deployed site
- Check if both direct and proxy connections show as successful

If the direct connection works but the proxy doesn't, check your Vercel function logs for errors.

## 3. Deploying the Application

### Option 1: Deploy from Git Repository

1. Login to Vercel (https://vercel.com)
2. Click "Add New..." → "Project"
3. Import your repository
4. Select "Vite" as the framework preset
5. Configure project:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
6. Add the environment variables from Step 1
7. Click "Deploy"

### Option 2: Deploy via Vercel CLI

1. Install Vercel CLI: `npm install -g vercel`
2. Login to Vercel: `vercel login`
3. From your project directory, run: `vercel`
4. Follow the prompts and make sure to add your environment variables

## 4. Verifying the Deployment

After deployment, check:

1. The application loads correctly
2. Authentication with Supabase works
3. Data fetching from Supabase works
4. The CORS proxy is functioning by visiting the `/supabase-status` page

## 5. Troubleshooting

### CORS Issues
If you still encounter CORS issues:

1. Verify the proxy is correctly deployed by checking the Network tab in your browser's developer tools
2. Ensure your environment variables are correctly set in Vercel
3. Try redeploying with `vercel --prod` to ensure latest changes are applied

### Need Help?
- Check Vercel deployment logs for any errors
- Inspect browser console for error messages
- Contact support for further assistance 