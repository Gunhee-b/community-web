-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE voting_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts_nominations ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitation_codes ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read their own data" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Admins can read all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
        )
    );

-- Voting periods policies
CREATE POLICY "Everyone can read voting periods" ON voting_periods
    FOR SELECT USING (true);

CREATE POLICY "Only admins can manage voting periods" ON voting_periods
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
        )
    );

-- Posts nominations policies
CREATE POLICY "Everyone can read post nominations" ON posts_nominations
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create nominations" ON posts_nominations
    FOR INSERT WITH CHECK (auth.uid()::text = nominator_id::text);

CREATE POLICY "Users can update their own nominations" ON posts_nominations
    FOR UPDATE USING (auth.uid()::text = nominator_id::text);

CREATE POLICY "Users can delete their own nominations" ON posts_nominations
    FOR DELETE USING (auth.uid()::text = nominator_id::text);

-- Votes policies
CREATE POLICY "Everyone can read votes" ON votes
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote" ON votes
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own votes" ON votes
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Post comments policies
CREATE POLICY "Everyone can read comments" ON post_comments
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON post_comments
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own comments" ON post_comments
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own comments" ON post_comments
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Offline meetings policies
CREATE POLICY "Everyone can read meetings" ON offline_meetings
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create meetings" ON offline_meetings
    FOR INSERT WITH CHECK (auth.uid()::text = host_id::text);

CREATE POLICY "Hosts can update their meetings" ON offline_meetings
    FOR UPDATE USING (auth.uid()::text = host_id::text);

CREATE POLICY "Hosts can delete their meetings" ON offline_meetings
    FOR DELETE USING (auth.uid()::text = host_id::text);

-- Meeting participants policies
CREATE POLICY "Everyone can read participants" ON meeting_participants
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can join meetings" ON meeting_participants
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their participation" ON meeting_participants
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Meeting chats policies
CREATE POLICY "Participants can read meeting chats" ON meeting_chats
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM meeting_participants
            WHERE meeting_id = meeting_chats.meeting_id
            AND user_id::text = auth.uid()::text
            AND cancelled_at IS NULL
        )
    );

CREATE POLICY "Participants can send messages" ON meeting_chats
    FOR INSERT WITH CHECK (
        auth.uid()::text = user_id::text AND
        EXISTS (
            SELECT 1 FROM meeting_participants
            WHERE meeting_id = meeting_chats.meeting_id
            AND user_id::text = auth.uid()::text
            AND cancelled_at IS NULL
        )
    );

-- Invitation codes policies
CREATE POLICY "Anyone can read unused invitation codes" ON invitation_codes
    FOR SELECT USING (NOT is_used AND expires_at > NOW());

CREATE POLICY "Only admins can manage invitation codes" ON invitation_codes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
        )
    );
