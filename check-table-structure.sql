-- 检查表结构的SQL脚本

-- 1. 检查user_profiles表的结构
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- 2. 检查event_registrations表的结构
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'event_registrations' 
ORDER BY ordinal_position;

-- 3. 检查events表的结构
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'events' 
ORDER BY ordinal_position;

-- 4. 查看所有用户
SELECT 
  id,
  full_name,
  email,
  membership_type,
  role
FROM user_profiles
ORDER BY id;

-- 5. 查看所有活动
SELECT 
  id,
  title,
  start_time,
  status
FROM events
ORDER BY id;

-- 6. 查看现有报名情况
SELECT 
  e.title as 活动名称,
  COUNT(er.id) as 报名人数
FROM events e
LEFT JOIN event_registrations er ON e.id = er.event_id
GROUP BY e.id, e.title
ORDER BY e.id;