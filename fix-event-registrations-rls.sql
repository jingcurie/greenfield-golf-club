-- 修复 event_registrations 表的 RLS 策略
-- 简化策略，避免循环依赖

-- 删除现有的复杂策略
DROP POLICY IF EXISTS "Users can view own registrations" ON event_registrations;
DROP POLICY IF EXISTS "Users can create own registrations" ON event_registrations;
DROP POLICY IF EXISTS "Users can update own registrations" ON event_registrations;
DROP POLICY IF EXISTS "Admins can view all registrations" ON event_registrations;
DROP POLICY IF EXISTS "Admins can update all registrations" ON event_registrations;

-- 创建简化的策略
-- 允许认证用户查看所有报名记录
CREATE POLICY "Authenticated users can view all registrations" ON event_registrations
  FOR SELECT
  TO authenticated
  USING (true);

-- 允许认证用户创建报名记录
CREATE POLICY "Authenticated users can create registrations" ON event_registrations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 允许认证用户更新报名记录
CREATE POLICY "Authenticated users can update registrations" ON event_registrations
  FOR UPDATE
  TO authenticated
  USING (true);

-- 验证策略
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'event_registrations' ORDER BY policyname;