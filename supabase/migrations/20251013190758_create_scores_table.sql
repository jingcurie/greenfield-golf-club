/*
  # 创建成绩管理系统

  1. 新建表
    - `scores` - 存储会员比赛成绩
      - `id` (uuid, 主键)
      - `user_id` (uuid, 外键关联 auth.users)
      - `competition_name` (text, 比赛名称)
      - `competition_type` (text, 比赛类型：个人赛/团队赛/月例赛等)
      - `course_name` (text, 球场名称)
      - `competition_date` (timestamptz, 比赛日期)
      - `total_strokes` (integer, 总杆数)
      - `net_strokes` (integer, 净杆数)
      - `handicap` (integer, 差点)
      - `rank` (integer, 排名)
      - `total_participants` (integer, 总参赛人数)
      - `holes_played` (integer, 洞数：9/18)
      - `notes` (text, 备注)
      - `created_at` (timestamptz, 创建时间)
      - `updated_at` (timestamptz, 更新时间)

  2. 安全性
    - 启用 RLS
    - 会员可以查看自己的成绩
    - 管理员可以添加、修改、删除所有成绩
*/

-- 创建成绩表
CREATE TABLE IF NOT EXISTS scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  competition_name text NOT NULL,
  competition_type text NOT NULL DEFAULT 'individual',
  course_name text NOT NULL,
  competition_date timestamptz NOT NULL,
  total_strokes integer NOT NULL,
  net_strokes integer,
  handicap integer DEFAULT 0,
  rank integer,
  total_participants integer,
  holes_played integer NOT NULL DEFAULT 18,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 启用 RLS
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- 会员可以查看自己的成绩
CREATE POLICY "Users can view own scores"
  ON scores
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 管理员可以查看所有成绩
CREATE POLICY "Admins can view all scores"
  ON scores
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- 管理员可以添加成绩
CREATE POLICY "Admins can insert scores"
  ON scores
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- 管理员可以更新成绩
CREATE POLICY "Admins can update scores"
  ON scores
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

-- 管理员可以删除成绩
CREATE POLICY "Admins can delete scores"
  ON scores
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_scores_user_id ON scores(user_id);
CREATE INDEX IF NOT EXISTS idx_scores_competition_date ON scores(competition_date DESC);
CREATE INDEX IF NOT EXISTS idx_scores_competition_type ON scores(competition_type);
CREATE INDEX IF NOT EXISTS idx_scores_course_name ON scores(course_name);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_scores_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER scores_updated_at
  BEFORE UPDATE ON scores
  FOR EACH ROW
  EXECUTE FUNCTION update_scores_updated_at();