/*
  # 创建海报展示表

  ## 功能说明
  创建海报展示系统的数据库表和相关功能，支持海报上传、展示、排序和时间筛选。

  ## 1. 新建表
    - `posters` 表
      - `id` (uuid, 主键) - 海报唯一标识
      - `title` (text) - 海报标题
      - `description` (text) - 海报描述/活动介绍
      - `image_url` (text) - 海报图片URL
      - `display_order` (integer) - 显示排序（数字越小越靠前）
      - `event_date` (timestamptz) - 活动日期（用于时间筛选）
      - `status` (text) - 状态：active（显示）、hidden（隐藏）
      - `created_at` (timestamptz) - 创建时间
      - `updated_at` (timestamptz) - 更新时间

  ## 2. 安全设置
    - 启用 RLS
    - 所有人可查看 active 状态的海报
    - 只有管理员可以创建、更新、删除海报

  ## 3. 索引
    - 按 display_order 和 event_date 创建索引以优化查询性能
*/

-- 创建海报表
CREATE TABLE IF NOT EXISTS posters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  image_url text NOT NULL,
  display_order integer DEFAULT 0,
  event_date timestamptz NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'hidden')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 启用 RLS
ALTER TABLE posters ENABLE ROW LEVEL SECURITY;

-- 所有人可以查看 active 状态的海报
CREATE POLICY "Anyone can view active posters"
  ON posters
  FOR SELECT
  USING (status = 'active');

-- 管理员可以查看所有海报
CREATE POLICY "Admins can view all posters"
  ON posters
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- 管理员可以创建海报
CREATE POLICY "Admins can create posters"
  ON posters
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- 管理员可以更新海报
CREATE POLICY "Admins can update posters"
  ON posters
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- 管理员可以删除海报
CREATE POLICY "Admins can delete posters"
  ON posters
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- 创建索引以优化查询
CREATE INDEX IF NOT EXISTS idx_posters_display_order ON posters(display_order);
CREATE INDEX IF NOT EXISTS idx_posters_event_date ON posters(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_posters_status ON posters(status);

-- 自动更新 updated_at 触发器
CREATE OR REPLACE FUNCTION update_posters_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_posters_updated_at
  BEFORE UPDATE ON posters
  FOR EACH ROW
  EXECUTE FUNCTION update_posters_updated_at();