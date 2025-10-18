/*
  # 创建活动报名系统

  1. 新建表
    - `events` 活动表
      - `id` (uuid, 主键)
      - `title` (text, 活动标题)
      - `description` (text, 活动描述)
      - `start_time` (timestamptz, 开始时间)
      - `end_time` (timestamptz, 结束时间)
      - `location` (text, 活动地点)
      - `fee` (decimal, 报名费用)
      - `max_participants` (integer, 最大参与人数)
      - `registration_deadline` (timestamptz, 报名截止时间)
      - `rules` (text, 活动规则)
      - `image_url` (text, 活动图片)
      - `status` (text, 活动状态)
      - `created_at` (timestamptz, 创建时间)

    - `event_registrations` 报名记录表
      - `id` (uuid, 主键)
      - `event_id` (uuid, 外键关联活动)
      - `user_id` (uuid, 外键关联用户)
      - `participant_name` (text, 参赛者姓名)
      - `member_number` (text, 会员号)
      - `phone` (text, 联系电话)
      - `payment_status` (text, 支付状态)
      - `registration_time` (timestamptz, 报名时间)
      - `notes` (text, 备注)
      - `status` (text, 报名状态)

  2. 安全策略
    - 启用 RLS
    - 用户可以查看所有活动
    - 用户只能管理自己的报名记录
    - 管理员可以管理所有数据
*/

-- 创建活动表
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  location text NOT NULL,
  fee decimal(10,2) NOT NULL DEFAULT 0,
  max_participants integer NOT NULL DEFAULT 50,
  registration_deadline timestamptz NOT NULL,
  rules text,
  image_url text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed')),
  created_at timestamptz DEFAULT now()
);

-- 创建报名记录表
CREATE TABLE IF NOT EXISTS event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_name text NOT NULL,
  member_number text,
  phone text NOT NULL,
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  registration_time timestamptz DEFAULT now(),
  notes text,
  status text NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'cancelled')),
  UNIQUE(event_id, user_id)
);

-- 启用行级安全
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- 活动表的安全策略
CREATE POLICY "Anyone can view active events"
  ON events
  FOR SELECT
  USING (status = 'active');

CREATE POLICY "Admins can manage events"
  ON events
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 报名记录表的安全策略
CREATE POLICY "Users can view own registrations"
  ON event_registrations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own registrations"
  ON event_registrations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own registrations"
  ON event_registrations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all registrations"
  ON event_registrations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all registrations"
  ON event_registrations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 插入示例活动数据
INSERT INTO events (title, description, start_time, end_time, location, fee, max_participants, registration_deadline, rules, image_url) VALUES
(
  '春季高尔夫锦标赛',
  '一年一度的春季锦标赛，欢迎所有会员参加。比赛将采用18洞比杆赛制，按照差点分组进行。',
  '2024-04-15 08:00:00+08',
  '2024-04-15 18:00:00+08',
  '绿茵高尔夫俱乐部主球场',
  680.00,
  80,
  '2024-04-10 23:59:59+08',
  '1. 参赛者必须为俱乐部正式会员\n2. 比赛采用18洞比杆赛制\n3. 按照官方差点分组\n4. 迟到15分钟视为弃权\n5. 比赛期间请遵守球场礼仪',
  'https://images.pexels.com/photos/1325735/pexels-photo-1325735.jpeg?auto=compress&cs=tinysrgb&w=800'
),
(
  '会员友谊赛',
  '轻松愉快的9洞友谊赛，适合各个水平的球员参加。重在交流和娱乐。',
  '2024-04-20 14:00:00+08',
  '2024-04-20 17:00:00+08',
  '绿茵高尔夫俱乐部练习场',
  280.00,
  40,
  '2024-04-18 23:59:59+08',
  '1. 9洞比杆赛制\n2. 不分组，自由组队\n3. 重在参与和交流\n4. 比赛后有茶话会',
  'https://images.pexels.com/photos/1325735/pexels-photo-1325735.jpeg?auto=compress&cs=tinysrgb&w=800'
),
(
  'VIP会员专场',
  '专为VIP会员举办的高端比赛，奖品丰厚，服务一流。',
  '2024-05-01 09:00:00+08',
  '2024-05-01 16:00:00+08',
  '绿茵高尔夫俱乐部VIP球场',
  1280.00,
  20,
  '2024-04-28 23:59:59+08',
  '1. 仅限VIP会员参加\n2. 18洞比杆赛制\n3. 提供专业球童服务\n4. 比赛后有庆祝晚宴\n5. 前三名有丰厚奖品',
  'https://images.pexels.com/photos/1325735/pexels-photo-1325735.jpeg?auto=compress&cs=tinysrgb&w=800'
);

-- 创建获取活动统计的函数
CREATE OR REPLACE FUNCTION get_event_stats(event_uuid uuid)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_registrations', (
      SELECT COUNT(*) FROM event_registrations 
      WHERE event_id = event_uuid AND status = 'registered'
    ),
    'paid_registrations', (
      SELECT COUNT(*) FROM event_registrations 
      WHERE event_id = event_uuid AND status = 'registered' AND payment_status = 'paid'
    ),
    'available_spots', (
      SELECT e.max_participants - COALESCE(
        (SELECT COUNT(*) FROM event_registrations 
         WHERE event_id = event_uuid AND status = 'registered'), 0
      )
      FROM events e WHERE e.id = event_uuid
    )
  ) INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION get_event_stats(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_event_stats(uuid) TO anon;