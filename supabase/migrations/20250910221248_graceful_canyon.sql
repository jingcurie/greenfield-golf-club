/*
  # 清空所有用户数据

  1. 清理操作
    - 删除所有预订记录
    - 删除所有用户资料记录
  
  注意：auth.users 表需要在 Supabase 管理面板手动删除
*/

-- 删除所有预订记录
DELETE FROM bookings;

-- 删除所有用户资料记录  
DELETE FROM user_profiles;

-- 注意：auth.users 表是 Supabase 系统表，无法通过 SQL 直接删除
-- 需要在 Supabase 管理面板 → Authentication → Users 中手动删除用户账户