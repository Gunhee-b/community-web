-- Phase 1: Add social login support to database schema
-- This migration adds fields for social authentication while maintaining backward compatibility

-- Step 1: Add new columns to users table
ALTER TABLE users
ADD COLUMN email TEXT UNIQUE,
ADD COLUMN provider TEXT DEFAULT 'local', -- 'local', 'google', 'kakao'
ADD COLUMN provider_id TEXT,
ADD COLUMN avatar_url TEXT,
ADD COLUMN nickname_change_count INTEGER DEFAULT 0,
ADD COLUMN last_nickname_change TIMESTAMP WITH TIME ZONE,
ADD COLUMN social_connected_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;

-- Step 2: Make password_hash nullable for social login users
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Step 3: Add constraint to ensure email is required for social login
ALTER TABLE users ADD CONSTRAINT check_email_for_social
CHECK (
  (provider = 'local' AND password_hash IS NOT NULL) OR
  (provider != 'local' AND email IS NOT NULL)
);

-- Step 4: Create social_connections table for managing multiple social accounts
CREATE TABLE IF NOT EXISTS social_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_user_id TEXT NOT NULL,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('Asia/Seoul', NOW()) NOT NULL,
  last_used_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(provider, provider_user_id)
);

-- Step 5: Create index for faster lookups
CREATE INDEX idx_social_connections_user_id ON social_connections(user_id);
CREATE INDEX idx_social_connections_provider ON social_connections(provider, provider_user_id);
CREATE INDEX idx_users_email ON users(email) WHERE email IS NOT NULL;
CREATE INDEX idx_users_provider_id ON users(provider, provider_id) WHERE provider != 'local';

-- Step 6: Set admin role for specified emails
-- Note: This will be applied when emails are added to existing users
CREATE OR REPLACE FUNCTION set_admin_by_email()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email IN ('gflying11@gmail.com', 'rebranding96@gmail.com') THEN
    NEW.role := 'admin';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_admin_by_email
BEFORE INSERT OR UPDATE OF email ON users
FOR EACH ROW
WHEN (NEW.email IS NOT NULL)
EXECUTE FUNCTION set_admin_by_email();

-- Step 7: Create function to link social account to existing user
CREATE OR REPLACE FUNCTION link_social_account(
  p_user_id UUID,
  p_provider TEXT,
  p_provider_user_id TEXT,
  p_email TEXT,
  p_display_name TEXT DEFAULT NULL,
  p_avatar_url TEXT DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_existing_connection social_connections;
  v_result jsonb;
BEGIN
  -- Check if this social account is already linked to another user
  SELECT * INTO v_existing_connection
  FROM social_connections
  WHERE provider = p_provider AND provider_user_id = p_provider_user_id;

  IF FOUND AND v_existing_connection.user_id != p_user_id THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'This social account is already linked to another user'
    );
  END IF;

  -- Link the social account
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
    p_user_id,
    p_provider,
    p_provider_user_id,
    p_email,
    p_display_name,
    p_avatar_url,
    NOW()
  )
  ON CONFLICT (provider, provider_user_id)
  DO UPDATE SET
    last_used_at = NOW(),
    email = EXCLUDED.email,
    display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url;

  -- Update user table with social info if not set
  UPDATE users
  SET
    email = COALESCE(users.email, p_email),
    avatar_url = COALESCE(users.avatar_url, p_avatar_url),
    social_connected_at = COALESCE(users.social_connected_at, NOW())
  WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Social account linked successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Create function to find or create user from social login
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
    -- Update last_used_at
    UPDATE social_connections
    SET last_used_at = NOW()
    WHERE id = v_connection.id;

    -- Get user record
    SELECT * INTO v_user_record
    FROM users
    WHERE id = v_connection.user_id;

    -- Update last_login
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
      );

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
  -- Generate username from email or display name
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
    );

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

-- Step 9: Create function to handle nickname change (with rate limiting)
CREATE OR REPLACE FUNCTION update_username_with_limit(
  p_user_id UUID,
  p_new_username TEXT
)
RETURNS jsonb AS $$
DECLARE
  v_user users;
  v_days_since_last_change INTEGER;
BEGIN
  -- Get user
  SELECT * INTO v_user FROM users WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  -- Check if username is already taken
  IF EXISTS (SELECT 1 FROM users WHERE username = p_new_username AND id != p_user_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Username already taken');
  END IF;

  -- Check rate limit (allow change once per 30 days, or 3 times total for social users)
  IF v_user.last_nickname_change IS NOT NULL THEN
    v_days_since_last_change := EXTRACT(DAY FROM NOW() - v_user.last_nickname_change);

    IF v_days_since_last_change < 30 THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', format('You can change your username again in %s days', 30 - v_days_since_last_change)
      );
    END IF;
  END IF;

  IF v_user.nickname_change_count >= 3 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'You have reached the maximum number of username changes (3)'
    );
  END IF;

  -- Update username
  UPDATE users
  SET
    username = p_new_username,
    nickname_change_count = v_user.nickname_change_count + 1,
    last_nickname_change = NOW()
  WHERE id = p_user_id;

  RETURN jsonb_build_object('success', true, 'message', 'Username updated successfully');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 10: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON social_connections TO anon, authenticated;

-- Step 11: Add RLS policies for social_connections
ALTER TABLE social_connections ENABLE ROW LEVEL SECURITY;

-- Users can view their own connections
CREATE POLICY "Users can view own social connections"
ON social_connections FOR SELECT
USING (auth.uid()::uuid = user_id OR user_id IN (SELECT id FROM users WHERE id = auth.uid()::uuid));

-- Users can insert their own connections
CREATE POLICY "Users can insert own social connections"
ON social_connections FOR INSERT
WITH CHECK (auth.uid()::uuid = user_id OR user_id IN (SELECT id FROM users WHERE id = auth.uid()::uuid));

-- Users can update their own connections
CREATE POLICY "Users can update own social connections"
ON social_connections FOR UPDATE
USING (auth.uid()::uuid = user_id OR user_id IN (SELECT id FROM users WHERE id = auth.uid()::uuid));

-- Admin can view all connections
CREATE POLICY "Admin can view all social connections"
ON social_connections FOR SELECT
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'admin'));
