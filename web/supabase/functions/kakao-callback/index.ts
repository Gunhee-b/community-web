import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');

    console.log('Kakao callback received:', { code: code?.substring(0, 10), error });

    // Handle OAuth errors
    if (error) {
      console.error('Kakao OAuth error:', error, errorDescription);

      // Redirect to mobile app with error
      return Response.redirect(
        `rezom://auth/callback?error=${encodeURIComponent(error)}&error_description=${encodeURIComponent(errorDescription || '')}`,
        302
      );
    }

    // Check if authorization code exists
    if (!code) {
      console.error('No authorization code received');
      return Response.redirect(
        `rezom://auth/callback?error=no_code&error_description=${encodeURIComponent('Authorization code not found')}`,
        302
      );
    }

    // Redirect to mobile app with authorization code
    console.log('Redirecting to app with code');
    return Response.redirect(
      `rezom://auth/callback?code=${encodeURIComponent(code)}`,
      302
    );
  } catch (error) {
    console.error('Kakao callback error:', error);

    // Redirect to mobile app with error
    return Response.redirect(
      `rezom://auth/callback?error=callback_error&error_description=${encodeURIComponent(error instanceof Error ? error.message : 'Unknown error')}`,
      302
    );
  }
});
