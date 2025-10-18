-- 验证邮箱和最后登录时间同步结果
-- 检查 user_profiles 表中的认证数据

-- 1. 查看邮箱同步统计
SELECT 
  '邮箱同步统计' as description,
  COUNT(*) as total_profiles,
  COUNT(email) as profiles_with_email,
  COUNT(*) - COUNT(email) as profiles_without_email,
  ROUND(COUNT(email)::numeric / COUNT(*)::numeric * 100, 2) as email_sync_percentage
FROM public.user_profiles;

-- 2. 查看最后登录时间同步统计
SELECT 
  '最后登录时间同步统计' as description,
  COUNT(*) as total_profiles,
  COUNT(last_sign_in_at) as profiles_with_last_signin,
  COUNT(*) - COUNT(last_sign_in_at) as profiles_without_last_signin,
  ROUND(COUNT(last_sign_in_at)::numeric / COUNT(*)::numeric * 100, 2) as signin_sync_percentage
FROM public.user_profiles;

-- 3. 查看没有邮箱的用户
SELECT 
  '缺少邮箱的用户' as description,
  id,
  full_name,
  created_at
FROM public.user_profiles 
WHERE email IS NULL OR email = ''
ORDER BY created_at DESC
LIMIT 10;

-- 4. 查看没有最后登录时间的用户
SELECT 
  '缺少最后登录时间的用户' as description,
  id,
  full_name,
  created_at
FROM public.user_profiles 
WHERE last_sign_in_at IS NULL
ORDER BY created_at DESC
LIMIT 10;

-- 5. 查看认证数据同步示例
SELECT 
  '认证数据同步示例' as description,
  up.id,
  up.full_name,
  up.email as profile_email,
  au.email as auth_email,
  up.last_sign_in_at as profile_last_signin,
  au.last_sign_in_at as auth_last_signin,
  CASE 
    WHEN up.email = au.email AND up.last_sign_in_at = au.last_sign_in_at THEN '✅ 完全同步'
    WHEN up.email = au.email AND up.last_sign_in_at IS NULL AND au.last_sign_in_at IS NULL THEN '✅ 完全同步'
    WHEN up.email IS NULL AND up.last_sign_in_at IS NULL THEN '❌ 未同步'
    ELSE '⚠️ 部分同步'
  END as sync_status
FROM public.user_profiles up
LEFT JOIN auth.users au ON up.id = au.id
ORDER BY up.created_at DESC
LIMIT 10;
