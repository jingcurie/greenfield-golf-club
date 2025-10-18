/*
  # 清理测试用户数据

  1. 清理操作
    - 删除测试邮箱的用户资料
    - 删除相关的预订记录
    - 注意：Supabase auth.users 表由系统管理，需要通过管理面板删除

  2. 安全措施
    - 只删除明显的测试数据
    - 保留真实用户数据
*/

-- 删除测试用户的预订记录（如果有的话）
DELETE FROM bookings 
WHERE user_id IN (
  SELECT id FROM user_profiles 
  WHERE full_name LIKE '%测试%' 
  OR full_name LIKE '%test%'
  OR phone LIKE '%123456%'
);

-- 删除测试用户资料
DELETE FROM user_profiles 
WHERE full_name LIKE '%测试%' 
OR full_name LIKE '%test%'
OR phone LIKE '%123456%';

-- 如果你知道具体的测试邮箱，可以这样删除（请替换为实际的测试邮箱）
-- DELETE FROM user_profiles WHERE id IN (
--   SELECT id FROM auth.users WHERE email IN (
--     'test1@example.com',
--     'test2@example.com'
--   )
-- );