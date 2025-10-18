-- 创建海报展示表
-- 在 Supabase SQL 编辑器中执行此脚本

-- 1. 创建海报表
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

-- 2. 启用 RLS
ALTER TABLE posters ENABLE ROW LEVEL SECURITY;

-- 3. 删除可能存在的旧策略
DROP POLICY IF EXISTS "Anyone can view active posters" ON posters;
DROP POLICY IF EXISTS "Admins can view all posters" ON posters;
DROP POLICY IF EXISTS "Admins can create posters" ON posters;
DROP POLICY IF EXISTS "Admins can update posters" ON posters;
DROP POLICY IF EXISTS "Admins can delete posters" ON posters;

-- 4. 创建访问策略

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

-- 5. 创建索引以优化查询
CREATE INDEX IF NOT EXISTS idx_posters_display_order ON posters(display_order);
CREATE INDEX IF NOT EXISTS idx_posters_event_date ON posters(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_posters_status ON posters(status);

-- 6. 创建自动更新 updated_at 的触发器
CREATE OR REPLACE FUNCTION update_posters_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_posters_updated_at ON posters;
CREATE TRIGGER trigger_update_posters_updated_at
  BEFORE UPDATE ON posters
  FOR EACH ROW
  EXECUTE FUNCTION update_posters_updated_at();

-- 7. 验证表创建
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'posters' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 8. 验证策略创建
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'posters' 
AND schemaname = 'public';