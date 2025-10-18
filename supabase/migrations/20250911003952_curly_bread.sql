/*
  # 添加管理员系统

  1. 新增功能
    - 为用户添加角色字段 (role)
    - 创建管理员策略
    - 添加管理员专用函数

  2. 角色类型
    - admin: 管理员
    - member: 普通会员

  3. 管理员权限
    - 查看所有用户
    - 管理球场信息
    - 管理预订
    - 查看统计数据
*/

-- 1. 为用户资料表添加角色字段
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member' 
CHECK (role IN ('admin', 'member'));

-- 2. 创建管理员策略 - 管理员可以查看所有用户资料
CREATE POLICY "Admins can view all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 3. 管理员可以更新所有用户资料
CREATE POLICY "Admins can update all profiles"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 4. 管理员可以查看所有预订
CREATE POLICY "Admins can view all bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 5. 管理员可以更新所有预订
CREATE POLICY "Admins can update all bookings"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 6. 管理员可以管理球场
CREATE POLICY "Admins can manage courses"
  ON courses
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 7. 创建检查用户是否为管理员的函数
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

-- 8. 创建获取所有用户的函数（仅管理员）
CREATE OR REPLACE FUNCTION get_all_users()
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  membership_type TEXT,
  role TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 检查是否为管理员
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  RETURN QUERY
  SELECT 
    up.id,
    au.email::TEXT,
    up.full_name,
    up.phone,
    up.membership_type,
    up.role,
    up.created_at
  FROM user_profiles up
  JOIN auth.users au ON up.id = au.id
  ORDER BY up.created_at DESC;
END;
$$;

-- 9. 授权函数执行权限
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_users() TO authenticated;

-- 10. 设置第一个用户为管理员（假设是你）
-- 注意：这里需要替换为实际的用户ID
-- UPDATE user_profiles SET role = 'admin' WHERE id = 'your-user-id-here';

-- 11. 创建管理员统计函数
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- 检查是否为管理员
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  SELECT json_build_object(
    'total_members', (SELECT COUNT(*) FROM user_profiles),
    'total_bookings', (SELECT COUNT(*) FROM bookings),
    'active_courses', (SELECT COUNT(*) FROM courses WHERE is_active = true),
    'pending_bookings', (SELECT COUNT(*) FROM bookings WHERE status = 'pending'),
    'confirmed_bookings', (SELECT COUNT(*) FROM bookings WHERE status = 'confirmed')
  ) INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION get_admin_stats() TO authenticated;