-- 检查 user_profiles 表的完整结构

SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default,
  character_maximum_length,
  numeric_precision,
  datetime_precision
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;