-- Function to get vote count for a post
CREATE OR REPLACE FUNCTION get_vote_count(post_uuid UUID)
RETURNS INTEGER AS $$
    SELECT COUNT(*)::INTEGER FROM votes WHERE post_id = post_uuid;
$$ LANGUAGE SQL STABLE;

-- Function to get current participant count for a meeting
CREATE OR REPLACE FUNCTION get_participant_count(meeting_uuid UUID)
RETURNS INTEGER AS $$
    SELECT COUNT(*)::INTEGER
    FROM meeting_participants
    WHERE meeting_id = meeting_uuid AND cancelled_at IS NULL;
$$ LANGUAGE SQL STABLE;

-- Function to check if user has voted for a post
CREATE OR REPLACE FUNCTION user_voted_for_post(user_uuid UUID, post_uuid UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS(
        SELECT 1 FROM votes
        WHERE user_id = user_uuid AND post_id = post_uuid
    );
$$ LANGUAGE SQL STABLE;

-- Function to get user's vote count for a post (since duplicate votes are allowed)
CREATE OR REPLACE FUNCTION user_vote_count_for_post(user_uuid UUID, post_uuid UUID)
RETURNS INTEGER AS $$
    SELECT COUNT(*)::INTEGER FROM votes
    WHERE user_id = user_uuid AND post_id = post_uuid;
$$ LANGUAGE SQL STABLE;

-- Function to generate random invitation code
CREATE OR REPLACE FUNCTION generate_invitation_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..6 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to assign anonymous name to meeting participant
CREATE OR REPLACE FUNCTION assign_anonymous_name(meeting_uuid UUID, user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    participant_number INTEGER;
BEGIN
    SELECT COUNT(*) + 1 INTO participant_number
    FROM meeting_participants
    WHERE meeting_id = meeting_uuid AND cancelled_at IS NULL;

    RETURN '참가자' || participant_number;
END;
$$ LANGUAGE plpgsql;

-- Function to check if meeting is full
CREATE OR REPLACE FUNCTION is_meeting_full(meeting_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_count INTEGER;
    max_count INTEGER;
BEGIN
    SELECT get_participant_count(meeting_uuid) INTO current_count;
    SELECT max_participants INTO max_count FROM offline_meetings WHERE id = meeting_uuid;

    RETURN current_count >= max_count;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-close meeting when full
CREATE OR REPLACE FUNCTION close_meeting_if_full()
RETURNS TRIGGER AS $$
BEGIN
    IF is_meeting_full(NEW.meeting_id) THEN
        UPDATE offline_meetings
        SET status = 'closed'
        WHERE id = NEW.meeting_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_close_meeting_if_full
AFTER INSERT ON meeting_participants
FOR EACH ROW
EXECUTE FUNCTION close_meeting_if_full();

-- Function to validate invitation code
CREATE OR REPLACE FUNCTION validate_invitation_code(code_text TEXT)
RETURNS BOOLEAN AS $$
    SELECT EXISTS(
        SELECT 1 FROM invitation_codes
        WHERE code = code_text
        AND NOT is_used
        AND expires_at > NOW()
    );
$$ LANGUAGE SQL STABLE;

-- Function to mark invitation code as used
CREATE OR REPLACE FUNCTION use_invitation_code(code_text TEXT, user_uuid UUID)
RETURNS BOOLEAN AS $$
    UPDATE invitation_codes
    SET is_used = true, used_by = user_uuid
    WHERE code = code_text AND NOT is_used AND expires_at > NOW()
    RETURNING true;
$$ LANGUAGE SQL;
