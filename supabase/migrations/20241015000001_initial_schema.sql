-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums
CREATE TYPE user_role AS ENUM ('admin', 'member');
CREATE TYPE voting_period_status AS ENUM ('active', 'ended', 'published');
CREATE TYPE meeting_purpose AS ENUM ('coffee', 'alcohol');
CREATE TYPE meeting_status AS ENUM ('recruiting', 'closed');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    kakao_nickname TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role DEFAULT 'member' NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('Asia/Seoul', NOW()) NOT NULL
);

-- Voting periods table
CREATE TABLE voting_periods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status voting_period_status DEFAULT 'active' NOT NULL,
    winner_post_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('Asia/Seoul', NOW()) NOT NULL
);

-- Posts nominations table
CREATE TABLE posts_nominations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    nominator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    voting_period_id UUID NOT NULL REFERENCES voting_periods(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('Asia/Seoul', NOW()) NOT NULL
);

-- Add foreign key constraint for winner_post_id
ALTER TABLE voting_periods
ADD CONSTRAINT fk_winner_post
FOREIGN KEY (winner_post_id) REFERENCES posts_nominations(id) ON DELETE SET NULL;

-- Votes table (allows duplicate votes)
CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES posts_nominations(id) ON DELETE CASCADE,
    voting_period_id UUID NOT NULL REFERENCES voting_periods(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('Asia/Seoul', NOW()) NOT NULL
);

-- Create index for votes
CREATE INDEX idx_votes_user_post ON votes(user_id, post_id);
CREATE INDEX idx_votes_period ON votes(voting_period_id);

-- Post comments table
CREATE TABLE post_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts_nominations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(content) <= 200),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('Asia/Seoul', NOW()) NOT NULL
);

-- Offline meetings table
CREATE TABLE offline_meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    location TEXT NOT NULL,
    meeting_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    max_participants INTEGER NOT NULL CHECK (max_participants > 0),
    purpose meeting_purpose NOT NULL,
    status meeting_status DEFAULT 'recruiting' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('Asia/Seoul', NOW()) NOT NULL
);

-- Meeting participants table
CREATE TABLE meeting_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES offline_meetings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('Asia/Seoul', NOW()) NOT NULL,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    UNIQUE(meeting_id, user_id)
);

-- Meeting chats table
CREATE TABLE meeting_chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES offline_meetings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    anonymous_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('Asia/Seoul', NOW()) NOT NULL
);

-- Create index for meeting chats (for real-time performance)
CREATE INDEX idx_meeting_chats_meeting ON meeting_chats(meeting_id, created_at DESC);

-- Invitation codes table
CREATE TABLE invitation_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    is_used BOOLEAN DEFAULT false NOT NULL,
    used_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('Asia/Seoul', NOW()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_posts_nominations_period ON posts_nominations(voting_period_id);
CREATE INDEX idx_posts_nominations_nominator ON posts_nominations(nominator_id);
CREATE INDEX idx_post_comments_post ON post_comments(post_id);
CREATE INDEX idx_offline_meetings_status ON offline_meetings(status, meeting_datetime);
CREATE INDEX idx_meeting_participants_meeting ON meeting_participants(meeting_id);
CREATE INDEX idx_invitation_codes_code ON invitation_codes(code) WHERE NOT is_used;
