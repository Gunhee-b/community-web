-- Check current status column type
SELECT
    table_name,
    column_name,
    data_type,
    udt_name,
    column_default
FROM information_schema.columns
WHERE table_name = 'offline_meetings'
AND column_name = 'status';

-- Check current status values
SELECT DISTINCT status FROM offline_meetings;
