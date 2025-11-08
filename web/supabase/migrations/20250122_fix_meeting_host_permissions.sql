-- Fix meeting_host permissions to only allow editing their own meetings
-- meeting_host role should only be able to update/delete their own meetings
-- admin role should be able to update/delete all meetings

-- Drop existing policies
DROP POLICY IF EXISTS "Hosts, meeting hosts, and admins can delete meetings" ON offline_meetings;
DROP POLICY IF EXISTS "Hosts, meeting hosts, and admins can update meetings" ON offline_meetings;

-- Create new DELETE policy
-- Only admins can delete all meetings, meeting_hosts and regular users can only delete their own
CREATE POLICY "Hosts and admins can delete meetings" ON offline_meetings
    FOR DELETE USING (
        -- Host of the meeting can delete it
        auth.uid()::text = host_id::text OR
        -- Only admins can delete any meeting
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND role = 'admin'
        )
    );

-- Create new UPDATE policy
-- Only admins can update all meetings, meeting_hosts and regular users can only update their own
CREATE POLICY "Hosts and admins can update meetings" ON offline_meetings
    FOR UPDATE USING (
        -- Host of the meeting can update it
        auth.uid()::text = host_id::text OR
        -- Only admins can update any meeting
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND role = 'admin'
        )
    );
