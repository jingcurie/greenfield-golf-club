/*
  # 修复 RLS 策略无限递归问题

  1. 问题描述
    - 管理员策略直接查询 user_profiles 表导致无限递归
    - 错误：infinite recursion detected in policy for relation "user_profiles"

  2. 解决方案
    - 删除有问题的策略
    - 重新创建使用 is_admin() 函数的策略
    - 合并用户和管理员权限到单个策略中

  3. 策略重构
    - 使用 SECURITY DEFINER 函数绕过 RLS 检查
    - 避免在策略中直接查询受 RLS 保护的表
*/

-- 1. 删除有问题的管理员策略
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can update all bookings" ON bookings;

-- 2. 重新创建用户资料表的策略（合并用户和管理员权限）
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile or admins can view all"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile or admins can update all"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR is_admin());

-- 3. 重新创建预订表的策略（合并用户和管理员权限）
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
CREATE POLICY "Users can view own bookings or admins can view all"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;
CREATE POLICY "Users can update own bookings or admins can update all"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR is_admin());

-- 4. 确保 is_admin() 函数存在且正确
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- 5. 授权函数执行权限
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;