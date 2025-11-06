# Quick Setup Guide

## Step 1: Deploy Database Functions (REQUIRED)

Go to your Supabase SQL Editor and run the following SQL file:

**File:** `setup_auth_functions.sql`

This will:
- Enable pgcrypto extension for server-side password hashing
- Create `register_user()` function
- Create `login_user()` function
- Set up proper RLS policies for user registration
- Grant permissions to anon users

## Step 2: Create an Invitation Code

In Supabase SQL Editor, run:

```sql
INSERT INTO invitation_codes (code, expires_at)
VALUES ('ADMIN123', NOW() + INTERVAL '7 days');
```

## Step 3: Clear Browser Data

Open browser DevTools (F12) and run:

```javascript
localStorage.clear()
```

Then refresh the page.

## Step 4: Start Development Server

```bash
npm run dev
```

## Step 5: Sign Up

1. Go to http://localhost:3000/signup
2. Use invitation code: `ADMIN123`
3. Create your account with:
   - Username: your choice
   - Kakao Nickname: your choice
   - Password: your choice

## Step 6: Make Yourself Admin

In Supabase SQL Editor, run:

```sql
UPDATE users SET role = 'admin' WHERE username = 'YOUR_USERNAME';
```

Replace `YOUR_USERNAME` with the username you just created.

## Step 7: Log Out and Log In Again

Log out from the app and log back in. Your admin role will now be active.

## Step 8: Access Admin Dashboard

Navigate to `/admin/invites` to create more invitation codes via the UI.

## What Changed?

### ✅ Fixed Issues:
1. **Removed bcrypt from client-side** - No more browser compatibility errors
2. **Server-side password hashing** - Using PostgreSQL's pgcrypto extension
3. **Simplified authentication** - Custom session management without Supabase Auth
4. **Fixed RLS policies** - Users can now register without errors
5. **Reduced bundle size** - From 1MB to 390KB (60% reduction)

### 🔒 Security:
- Passwords are hashed with bcrypt (10 rounds) on the server
- RLS policies properly configured
- Functions use `SECURITY DEFINER` for safe execution

## Troubleshooting

### "Function not found" error
- Make sure you ran `setup_auth_functions.sql` in Supabase SQL Editor

### "Invalid invitation code"
- Check that the code exists and hasn't expired:
```sql
SELECT * FROM invitation_codes WHERE code = 'ADMIN123';
```

### Can't access admin pages
- Make sure you updated your user role to 'admin'
- Log out and log back in for the role to take effect

### Session expires too quickly
- Session lasts 7 days by default
- Check `src/store/authStore.js` to adjust expiration
