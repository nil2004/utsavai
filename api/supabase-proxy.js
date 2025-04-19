// /api/supabase-proxy.js
export default async function handler(req, res) {
  // Set CORS headers to allow requests from your domain
  res.setHeader('Access-Control-Allow-Origin', '*');  // Temporarily allow all origins for testing
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, apikey, X-Client-Info');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Try both VITE_ and NEXT_PUBLIC_ prefixes for environment variables
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // Debug logging
  console.log('Proxy request received:', {
    url: req.url,
    method: req.method,
    hasAuthHeader: !!req.headers.authorization,
    hasApiKey: !!req.headers.apikey,
    envVars: {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseKey,
      supabaseUrlStart: supabaseUrl ? supabaseUrl.substring(0, 15) + '...' : null
    }
  });
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables in proxy');
    return res.status(500).json({ 
      error: 'Server configuration error: Missing Supabase credentials',
      debug: {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey
      }
    });
  }
  
  try {
    // Forward the request to Supabase
    const targetUrl = `${supabaseUrl}${req.url.replace('/api/supabase-proxy', '')}`;
    console.log(`Forwarding to: ${targetUrl.replace(supabaseKey, '[REDACTED]')}`);
    
    // Copy all original headers
    const headers = {
      ...req.headers,
      'apikey': supabaseKey,
      'Authorization': req.headers.authorization || `Bearer ${supabaseKey}`
    };

    // Remove host-specific headers that can cause issues
    delete headers.host;
    delete headers.connection;
    delete headers['content-length'];
    
    console.log('Request headers:', JSON.stringify(headers, (key, value) => {
      // Don't log sensitive values
      if (key === 'authorization' || key === 'apikey') return '[REDACTED]';
      return value;
    }, 2));
    
    let body = undefined;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      // For non-GET requests, prepare the body
      if (req.body) {
        if (typeof req.body === 'string') {
          body = req.body;
        } else {
          body = JSON.stringify(req.body);
        }
      }
    }
    
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body
    });
    
    if (!response.ok) {
      console.error(`Supabase returned error status: ${response.status}`);
    }
    
    // Get response content type to handle different responses appropriately
    const contentType = response.headers.get('content-type');
    console.log(`Response content type: ${contentType}, status: ${response.status}`);
    
    // Mirror Supabase's response headers
    Object.entries(response.headers.raw()).forEach(([key, value]) => {
      if (key !== 'content-length' && key !== 'connection') {
        res.setHeader(key, value);
      }
    });
    
    // Handle different content types
    if (contentType && contentType.includes('application/json')) {
      try {
        const data = await response.json();
        return res.status(response.status).json(data);
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
        // If JSON parsing fails, fall back to text
        const text = await response.text();
        console.error('Response text starts with:', text.substring(0, 200));
        return res.status(500).json({ 
          error: 'Failed to parse JSON response',
          message: parseError.message
        });
      }
    } else {
      // For non-JSON responses, just return the text
      const text = await response.text();
      return res.status(response.status).send(text);
    }
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ 
      error: 'Failed to proxy request',
      message: error.message 
    });
  }
} 