-- 移除 Scores 表中的冗余字段
-- 现在可以安全地删除这些字段，因为我们已经有了正确的 event_id 关联

-- 1. 先验证新关联是否正常工作
SELECT 
  '验证新关联' as test_type,
  COUNT(*) as total_scores,
  COUNT(DISTINCT s.event_id) as unique_events,
  COUNT(DISTINCT e.id) as events_in_events_table
FROM scores s
LEFT JOIN events e ON s.event_id = e.id;

-- 2. 显示冗余字段的当前数据（作为备份参考）
SELECT 
  '冗余字段数据备份' as backup_info,
  competition_name,
  competition_type,
  course_name,
  competition_date,
  total_participants,
  COUNT(*) as record_count
FROM scores 
GROUP BY competition_name, competition_type, course_name, competition_date, total_participants
ORDER BY record_count DESC;

-- 3. 移除冗余字段
-- 注意：这个操作不可逆，请确保已经备份了数据
ALTER TABLE scores DROP COLUMN IF EXISTS competition_name;
ALTER TABLE scores DROP COLUMN IF EXISTS competition_type;
ALTER TABLE scores DROP COLUMN IF EXISTS course_name;
ALTER TABLE scores DROP COLUMN IF EXISTS competition_date;
ALTER TABLE scores DROP COLUMN IF EXISTS total_participants;

-- 4. 验证字段已移除
SELECT 
  '字段移除验证' as status,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'scores' 
  AND table_schema = 'public'
  AND column_name IN (
    'competition_name', 
    'competition_type', 
    'course_name', 
    'competition_date', 
    'total_participants'
  );

-- 5. 显示最终的 scores 表结构
SELECT 
  '最终表结构' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'scores' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. 测试新关联是否仍然正常工作
SELECT 
  '关联测试' as test,
  s.id as score_id,
  s.total_strokes,
  s.rank,
  e.title as event_name,
  e.start_time as event_date,
  up.full_name as user_name
FROM scores s
JOIN events e ON s.event_id = e.id
JOIN user_profiles up ON s.user_id = up.id
LIMIT 5;
