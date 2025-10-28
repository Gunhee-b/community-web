-- question_answers 테이블의 현재 컬럼 확인
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM
    information_schema.columns
WHERE
    table_name = 'question_answers'
ORDER BY
    ordinal_position;
