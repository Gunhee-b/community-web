# Chat Functionality Fix Guide

## Problem

The chat functionality in offline meetings (오프라인 모임) is not working because the RLS (Row Level Security) policies were designed for Supabase Auth (`auth.uid()`), but we're using custom authentication.

## Solution

Run the SQL script `fix_chat_policies.sql` in your Supabase SQL Editor to update the RLS policies to work with custom authentication.

## Steps to Fix

### 1. Open Supabase SQL Editor

Go to: https://supabase.com/dashboard/project/wghrshqnexgaojxrtiit/sql

### 2. Run the Fix Script

Copy and paste the contents of `fix_chat_policies.sql` and click "Run".

This will:
- Update `meeting_chats` policies to allow reading and sending messages
- Update `meeting_participants` policies to allow joining meetings
- Update `offline_meetings` policies to allow creating/managing meetings
- Update other table policies to work without `auth.uid()`

### 3. Test the Chat

1. **Create a meeting**:
   - Go to `/meetings/create`
   - Fill in the meeting details
   - Submit

2. **Join the meeting** (as another user or same user):
   - Go to `/meetings`
   - Click on the meeting
   - Click "모임 참가하기"

3. **Test the chat**:
   - Once you've joined, you'll see the "익명 채팅방" section
   - Type a message and click "전송"
   - The message should appear in the chat

4. **Test real-time updates**:
   - Open the same meeting in another browser/incognito window
   - Join with a different account
   - Send messages from both accounts
   - Messages should appear in real-time

## How It Works

### Anonymous Names
- Participants are automatically assigned anonymous names: "참가자1", "참가자2", etc.
- The order is based on when they joined the meeting

### Real-time Chat
- Uses Supabase Realtime for instant message delivery
- New messages appear automatically without refreshing

### Security Model

Since we're using custom authentication, the security model is:

1. **Application-level auth**: Users must log in to access the app
2. **User ID provided by app**: The application provides the correct `user_id` for all operations
3. **Invitation-only**: Only invited users can create accounts
4. **Permissive RLS policies**: Policies allow operations but trust the application layer

This is acceptable because:
- It's a private community (250 members)
- Invitation-only access
- Application enforces authorization
- Users are already authenticated through custom login

## What the Policies Allow

### meeting_chats
- **SELECT**: Anyone can read chats (app ensures only participants see the page)
- **INSERT**: Anyone can send messages (app provides user_id and anonymous_name)

### meeting_participants
- **SELECT**: Everyone can read participants list
- **INSERT**: Anyone can join (app provides user_id)
- **UPDATE**: Anyone can update participation (app manages cancellations)

### offline_meetings
- **SELECT**: Everyone can read meetings
- **INSERT/UPDATE/DELETE**: Anyone can manage (app checks host_id)

## Troubleshooting

### Messages not sending
- Check browser console for errors
- Verify the SQL script ran successfully
- Refresh the page after running the script

### Messages not appearing in real-time
- Check if Supabase Realtime is enabled for your project
- Verify the subscription is working (check console)

### "Permission denied" errors
- Make sure you ran `fix_chat_policies.sql`
- Clear browser cache and try again

### Can't join meeting
- Verify `meeting_participants` policies are updated
- Check if meeting is still recruiting (not closed)

## Additional Notes

- Chat messages are stored in `meeting_chats` table
- Participants are stored in `meeting_participants` table
- Real-time subscription is set up per meeting
- Messages are ordered by `created_at` timestamp
