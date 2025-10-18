/*
  # 创建用户扩展信息表

  1. 新建表
    - `user_profiles` 表用于存储会员的扩展信息
      - `id` (uuid, 主键, 关联 auth.users)
      - `full_name` (text, 会员姓名)
      - `phone` (text, 电话号码)
      - `membership_type` (text, 会员类型)
      - `created_at` (timestamp, 创建时间)

  2. 安全设置
    - 启用 RLS (行级安全)
    - 添加策略让用户只能访问自己的数据
*/

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  membership_type text DEFAULT 'standard' CHECK (membership_type IN ('standard', 'premium', 'vip')),
  created_at timestamptz DEFAULT now()
);

-- 启用行级安全
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 用户只能查看和编辑自己的资料
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);