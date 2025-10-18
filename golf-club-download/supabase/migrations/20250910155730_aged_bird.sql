/*
  # 创建球场和预订系统

  1. 新建表
    - `courses` 球场信息表
      - `id` (uuid, 主键)
      - `name` (text, 球场名称)
      - `description` (text, 球场描述)
      - `holes` (integer, 洞数)
      - `par` (integer, 标准杆数)
      - `difficulty` (text, 难度等级)
      - `price_per_round` (decimal, 每轮价格)
      - `image_url` (text, 球场图片)
      - `is_active` (boolean, 是否开放)
      - `created_at` (timestamp)

    - `bookings` 预订记录表
      - `id` (uuid, 主键)
      - `user_id` (uuid, 外键关联用户)
      - `course_id` (uuid, 外键关联球场)
      - `booking_date` (date, 预订日期)
      - `start_time` (time, 开始时间)
      - `end_time` (time, 结束时间)
      - `players_count` (integer, 球员数量)
      - `status` (text, 预订状态)
      - `total_price` (decimal, 总价格)
      - `created_at` (timestamp)

  2. 安全策略
    - 启用 RLS
    - 用户可以查看所有球场信息
    - 用户只能管理自己的预订记录
*/

-- 创建球场表
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  holes integer NOT NULL DEFAULT 18,
  par integer NOT NULL DEFAULT 72,
  difficulty text NOT NULL DEFAULT 'intermediate' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  price_per_round decimal(10,2) NOT NULL DEFAULT 0,
  image_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 创建预订表
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  booking_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  players_count integer NOT NULL DEFAULT 1 CHECK (players_count >= 1 AND players_count <= 4),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  total_price decimal(10,2) NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- 启用行级安全
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- 球场表的安全策略（所有人都可以查看球场信息）
CREATE POLICY "Anyone can view active courses"
  ON courses
  FOR SELECT
  USING (is_active = true);

-- 预订表的安全策略
CREATE POLICY "Users can view own bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookings"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- 插入示例球场数据
INSERT INTO courses (name, description, holes, par, difficulty, price_per_round, image_url) VALUES
('主球场', '我们的旗舰18洞锦标赛级球场，设计精美，挑战性十足。适合各个水平的球员。', 18, 72, 'intermediate', 680.00, 'https://images.pexels.com/photos/1325735/pexels-photo-1325735.jpeg?auto=compress&cs=tinysrgb&w=800'),
('练习场', '9洞练习球场，适合初学者和想要快速练习的球员。', 9, 36, 'beginner', 280.00, 'https://images.pexels.com/photos/1325735/pexels-photo-1325735.jpeg?auto=compress&cs=tinysrgb&w=800'),
('VIP球场', '私人定制的高端球场，提供最顶级的高尔夫体验。', 18, 72, 'advanced', 1280.00, 'https://images.pexels.com/photos/1325735/pexels-photo-1325735.jpeg?auto=compress&cs=tinysrgb&w=800');