-- 检查 event_registrations 表的结构
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'event_registrations' 
AND table_schema = 'public'
ORDER BY ordinal_position;


