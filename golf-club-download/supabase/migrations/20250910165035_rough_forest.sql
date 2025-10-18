/*
  # 修复用户资料表的RLS策略

  1. 安全策略修复
    - 修复INSERT策略，允许新用户创建自己的资料
    - 确保策略正确使用auth.uid()函数
    - 添加更宽松的INSERT策略用于注册流程

  2. 策略说明
    - INSERT: 允许认证用户创建与自己ID匹配的资料
    - SELECT: 用户只能查看自己的资料
    - UPDATE: 用户只能更新自己的资料
*/

-- 删除现有的INSERT策略
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- 创建新的INSERT策略，允许认证用户创建自己的资料
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 确保其他策略也是正确的
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);