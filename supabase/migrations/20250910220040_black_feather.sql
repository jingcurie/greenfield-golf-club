/*
  # 修复用户资料表的RLS策略

  1. 问题描述
    - 用户注册时无法创建用户资料
    - RLS策略阻止了INSERT操作
    - 错误：new row violates row-level security policy

  2. 解决方案
    - 更新INSERT策略，允许认证用户插入自己的资料
    - 确保WITH CHECK条件正确设置
    - 使用auth.uid()函数验证用户身份

  3. 安全性
    - 只允许用户创建自己的资料
    - 防止未授权的数据插入
*/

-- 删除现有的INSERT策略（如果存在）
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- 创建新的INSERT策略，允许认证用户插入自己的资料
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 确保RLS已启用
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;