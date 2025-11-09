-- Fix: Handle deleted user re-login scenario
-- When a user is deleted from our users table, social_connections is also deleted (CASCADE)
-- But Supabase Auth user still exists. When they try to login again, we should:
-- 1. Check if the user exists in our users table
-- 2. If not, create a new user (even if social_connection existed before)

CREATE OR REPLACE FUNCTION find_or_create_social_user(
  p_provider TEXT,
  p_provider_user_id TEXT,
  p_email TEXT,
  p_username TEXT DEFAULT NULL,
  p_avatar_url TEXT DEFAULT NULL,
  p_display_name TEXT DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_user_id UUID;
  v_user_record users;
  v_connection social_connections;
BEGIN
  -- Step 1: Check if social connection already exists
  SELECT * INTO v_connection
  FROM social_connections
  WHERE provider = p_provider AND provider_user_id = p_provider_user_id;

  IF FOUND THEN
    -- Social connection exists, check if user still exists
    SELECT * INTO v_user_record
    FROM users
    WHERE id = v_connection.user_id;

    IF FOUND THEN
      -- User exists, update and return
      UPDATE social_connections
      SET last_used_at = NOW()
      WHERE id = v_connection.id;

      UPDATE users
      SET last_login = NOW()
      WHERE id = v_user_record.id;

      RETURN jsonb_build_object(
        'success', true,
        'user', jsonb_build_object(
          'id', v_user_record.id,
          'username', v_user_record.username,
          'email', v_user_record.email,
          'role', v_user_record.role,
          'avatar_url', v_user_record.avatar_url,
          'is_active', v_user_record.is_active
        ),
        'is_new', false
      );
    ELSE
      -- User was deleted but social_connection still exists (shouldn't happen with CASCADE)
      -- Delete the orphaned connection and proceed to create new user
      DELETE FROM social_connections WHERE id = v_connection.id;
    END IF;
  END IF;

  -- Step 2: Check if email already exists (for account linking)
  IF p_email IS NOT NULL THEN
    SELECT * INTO v_user_record
    FROM users
    WHERE email = p_email;

    IF FOUND THEN
      -- Link social account to existing user
      INSERT INTO social_connections (
        user_id,
        provider,
        provider_user_id,
        email,
        display_name,
        avatar_url,
        last_used_at
      )
      VALUES (
        v_user_record.id,
        p_provider,
        p_provider_user_id,
        p_email,
        p_display_name,
        p_avatar_url,
        NOW()
      )
      ON CONFLICT (provider, provider_user_id) DO UPDATE
      SET
        last_used_at = NOW(),
        email = EXCLUDED.email,
        display_name = EXCLUDED.display_name,
        avatar_url = EXCLUDED.avatar_url;

      -- Update user avatar if not set
      UPDATE users
      SET
        avatar_url = COALESCE(users.avatar_url, p_avatar_url),
        social_connected_at = COALESCE(users.social_connected_at, NOW()),
        last_login = NOW()
      WHERE id = v_user_record.id;

      RETURN jsonb_build_object(
        'success', true,
        'user', jsonb_build_object(
          'id', v_user_record.id,
          'username', v_user_record.username,
          'email', v_user_record.email,
          'role', v_user_record.role,
          'avatar_url', COALESCE(v_user_record.avatar_url, p_avatar_url),
          'is_active', v_user_record.is_active
        ),
        'is_new', false,
        'linked', true
      );
    END IF;
  END IF;

  -- Step 3: Create new user from social login
  DECLARE
    v_base_username TEXT;
    v_final_username TEXT;
    v_counter INTEGER := 0;
  BEGIN
    v_base_username := COALESCE(
      p_username,
      p_display_name,
      SPLIT_PART(p_email, '@', 1)
    );

    -- Ensure username is unique
    v_final_username := v_base_username;
    WHILE EXISTS (SELECT 1 FROM users WHERE username = v_final_username) LOOP
      v_counter := v_counter + 1;
      v_final_username := v_base_username || v_counter;
    END LOOP;

    -- Create user
    INSERT INTO users (
      username,
      email,
      provider,
      provider_id,
      avatar_url,
      password_hash,
      kakao_nickname,
      social_connected_at,
      last_login
    )
    VALUES (
      v_final_username,
      p_email,
      p_provider,
      p_provider_user_id,
      p_avatar_url,
      NULL,
      v_final_username, -- Set kakao_nickname same as username for compatibility
      NOW(),
      NOW()
    )
    RETURNING id INTO v_user_id;

    -- Create social connection
    INSERT INTO social_connections (
      user_id,
      provider,
      provider_user_id,
      email,
      display_name,
      avatar_url,
      last_used_at
    )
    VALUES (
      v_user_id,
      p_provider,
      p_provider_user_id,
      p_email,
      p_display_name,
      p_avatar_url,
      NOW()
    )
    ON CONFLICT (provider, provider_user_id) DO UPDATE
    SET
      user_id = EXCLUDED.user_id,
      last_used_at = NOW(),
      email = EXCLUDED.email,
      display_name = EXCLUDED.display_name,
      avatar_url = EXCLUDED.avatar_url;

    -- Get created user
    SELECT * INTO v_user_record
    FROM users
    WHERE id = v_user_id;

    RETURN jsonb_build_object(
      'success', true,
      'user', jsonb_build_object(
        'id', v_user_record.id,
        'username', v_user_record.username,
        'email', v_user_record.email,
        'role', v_user_record.role,
        'avatar_url', v_user_record.avatar_url,
        'is_active', v_user_record.is_active
      ),
      'is_new', true
    );
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
