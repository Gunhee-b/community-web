-- Add meeting_participation_count column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS meeting_participation_count INTEGER DEFAULT 0;

COMMENT ON COLUMN users.meeting_participation_count IS 'Number of meetings the user has attended (approved by host)';

-- Add attended column to meeting_participants table
ALTER TABLE meeting_participants
ADD COLUMN IF NOT EXISTS attended BOOLEAN DEFAULT NULL;

COMMENT ON COLUMN meeting_participants.attended IS 'Whether the participant actually attended the meeting (approved by host)';

-- Create function to mark attendance and increment participation count
CREATE OR REPLACE FUNCTION mark_attendance(
  p_meeting_id UUID,
  p_participant_id UUID,
  p_host_id UUID,
  p_attended BOOLEAN
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_meeting RECORD;
  v_participant RECORD;
  v_old_attended BOOLEAN;
BEGIN
  -- Get meeting info and verify host
  SELECT * INTO v_meeting FROM offline_meetings WHERE id = p_meeting_id;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Meeting not found');
  END IF;

  IF v_meeting.host_id != p_host_id THEN
    RETURN json_build_object('success', false, 'error', 'Only meeting host can mark attendance');
  END IF;

  -- Check if meeting has ended
  IF v_meeting.end_datetime > NOW() THEN
    RETURN json_build_object('success', false, 'error', 'Cannot mark attendance until meeting has ended');
  END IF;

  -- Get participant info and old attended status
  SELECT * INTO v_participant FROM meeting_participants
  WHERE meeting_id = p_meeting_id AND user_id = p_participant_id AND cancelled_at IS NULL;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Participant not found');
  END IF;

  v_old_attended := v_participant.attended;

  -- Update attendance status
  UPDATE meeting_participants
  SET attended = p_attended
  WHERE meeting_id = p_meeting_id AND user_id = p_participant_id;

  -- Update user's participation count
  IF p_attended = true AND (v_old_attended IS NULL OR v_old_attended = false) THEN
    -- Increment count (first time marking as attended or changing from false to true)
    UPDATE users
    SET meeting_participation_count = meeting_participation_count + 1
    WHERE id = p_participant_id;
  ELSIF p_attended = false AND v_old_attended = true THEN
    -- Decrement count (changing from true to false)
    UPDATE users
    SET meeting_participation_count = GREATEST(meeting_participation_count - 1, 0)
    WHERE id = p_participant_id;
  END IF;

  RETURN json_build_object('success', true);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION mark_attendance(UUID, UUID, UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_attendance(UUID, UUID, UUID, BOOLEAN) TO anon;
