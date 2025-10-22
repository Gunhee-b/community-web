-- Update offline meetings delete policy to allow meeting_host role
-- Drop existing policy
DROP POLICY IF EXISTS "Hosts can delete their meetings" ON offline_meetings;

-- Create new policy allowing hosts, meeting_host role, and admins to delete meetings
CREATE POLICY "Hosts, meeting hosts, and admins can delete meetings" ON offline_meetings
    FOR DELETE USING (
        auth.uid()::text = host_id::text OR
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND (role = 'admin' OR role = 'meeting_host')
        )
    );

-- Update offline meetings update policy to allow meeting_host role
DROP POLICY IF EXISTS "Hosts can update their meetings" ON offline_meetings;

CREATE POLICY "Hosts, meeting hosts, and admins can update meetings" ON offline_meetings
    FOR UPDATE USING (
        auth.uid()::text = host_id::text OR
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND (role = 'admin' OR role = 'meeting_host')
        )
    );
