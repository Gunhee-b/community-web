import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface KakaoTokenResponse {
  access_token: string;
  token_type: string;
  refresh_token?: string;
  expires_in: number;
  scope?: string;
}

interface KakaoUserInfo {
  id: number;
  connected_at?: string;
  kakao_account?: {
    profile_needs_agreement?: boolean;
    profile?: {
      nickname?: string;
      thumbnail_image_url?: string;
      profile_image_url?: string;
    };
    email_needs_agreement?: boolean;
    is_email_valid?: boolean;
    is_email_verified?: boolean;
    email?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { code, redirect_uri } = await req.json();

    if (!code) {
      throw new Error('Authorization code is required');
    }

    // 1. Exchange authorization code for access token
    const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: Deno.env.get('KAKAO_CLIENT_ID') || '',
        client_secret: Deno.env.get('KAKAO_CLIENT_SECRET') || '',
        code: code,
        redirect_uri: redirect_uri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Kakao token exchange error:', errorText);

      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText };
      }

      console.error('Kakao error details:', {
        status: tokenResponse.status,
        error: errorData,
        requestParams: {
          client_id: Deno.env.get('KAKAO_CLIENT_ID')?.substring(0, 10) + '...',
          redirect_uri: redirect_uri,
          code: code?.substring(0, 20) + '...',
        }
      });

      throw new Error(errorData.error_description || errorData.error || 'Failed to exchange authorization code for access token');
    }

    const tokenData: KakaoTokenResponse = await tokenResponse.json();

    // 2. Get user info from Kakao
    const userInfoResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userInfoResponse.ok) {
      const error = await userInfoResponse.text();
      console.error('Kakao user info error:', error);
      throw new Error('Failed to get user info from Kakao');
    }

    const kakaoUser: KakaoUserInfo = await userInfoResponse.json();

    // 3. Create or find user in our database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const providerId = kakaoUser.id.toString();
    const email = kakaoUser.kakao_account?.email || null;
    const username = kakaoUser.kakao_account?.profile?.nickname || `kakao_${providerId}`;
    const avatarUrl = kakaoUser.kakao_account?.profile?.profile_image_url || null;

    // Call find_or_create_social_user RPC function
    const { data: userData, error: userError } = await supabase.rpc(
      'find_or_create_social_user',
      {
        p_provider: 'kakao',
        p_provider_user_id: providerId,
        p_email: email,
        p_username: username,
        p_avatar_url: avatarUrl,
        p_display_name: username,
      }
    );

    if (userError) {
      console.error('User creation error:', userError);
      throw new Error('Failed to create or find user');
    }

    if (!userData || !userData.success) {
      throw new Error(userData?.error || 'Failed to create user');
    }

    // 4. Return success response with user data
    // The mobile app will generate its own JWT token using the user data
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          user: userData.user,
          access_token: `kakao_${tokenData.access_token}`,
          refresh_token: tokenData.refresh_token || null,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Kakao auth error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
