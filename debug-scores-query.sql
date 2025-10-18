-- 调试成绩管理数据查询
-- 请依次执行以下查询来检查数据情况

-- 1. 检查 scores 表的数据
SELECT 
  id,
  user_id,
  competition_name,
  competition_date,
  total_strokes,
  rank,
  created_at
FROM scores
ORDER BY created_at DESC
LIMIT 10;

-- 2. 检查 user_profiles 表的数据
SELECT 
  id,
  full_name,
  created_at
FROM user_profiles
ORDER BY created_at DESC
LIMIT 10;

-- 3. 检查 scores 和 user_profiles 的关联情况
SELECT 
  s.id as score_id,
  s.user_id,
  s.competition_name,
  s.total_strokes,
  s.rank,
  up.id as profile_id,
  up.full_name,
  CASE 
    WHEN up.id IS NULL THEN '❌ 找不到用户信息'
    ELSE '✅ 找到用户信息'
  END as status
FROM scores s
LEFT JOIN user_profiles up ON s.user_id = up.id
ORDER BY s.created_at DESC
LIMIT 10;

-- 4. 检查是否有 user_id 不匹配的情况
SELECT 
  s.user_id as score_user_id,
  up.id as profile_id,
  COUNT(*) as count
FROM scores s
LEFT JOIN user_profiles up ON s.user_id = up.id
GROUP BY s.user_id, up.id
HAVING up.id IS NULL
ORDER BY count DESC;

-- 5. 检查所有不匹配的 user_id
SELECT DISTINCT
  s.user_id,
  '❌ 在 user_profiles 中找不到' as status
FROM scores s
LEFT JOIN user_profiles up ON s.user_id = up.id
WHERE up.id IS NULL;

-- 6. 检查 user_profiles 中是否有对应的用户
SELECT 
  up.id,
  up.full_name,
  '✅ 存在用户信息' as status
FROM user_profiles up
WHERE up.id IN (
  SELECT DISTINCT user_id 
  FROM scores 
  WHERE user_id IS NOT NULL
);
