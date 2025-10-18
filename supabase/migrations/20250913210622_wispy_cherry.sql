/*
  # 管理员功能扩展

  1. 新增功能
    - 活动统计函数
    - 报名管理函数
    - 管理员权限检查

  2. 安全策略
    - 只有管理员可以访问管理功能
    - 数据统计和报表功能
*/

-- 获取活动统计信息的函数
CREATE OR REPLACE FUNCTION get_event_stats(event_uuid UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  total_reg INTEGER;
  paid_reg INTEGER;
  available_spots INTEGER;
  max_participants INTEGER;
BEGIN
  -- 获取活动的最大参与人数
  SELECT events.max_participants INTO max_participants
  FROM events 
  WHERE events.id = event_uuid;

  -- 获取总报名数
  SELECT COUNT(*) INTO total_reg
  FROM event_registrations 
  WHERE event_id = event_uuid AND status = 'registered';

  -- 获取已支付报名数
  SELECT COUNT(*) INTO paid_reg
  FROM event_registrations 
  WHERE event_id = event_uuid AND status = 'registered' AND payment_status = 'paid';

  -- 计算剩余名额
  available_spots := max_participants - total_reg;

  SELECT json_build_object(
    'total_registrations', total_reg,
    'paid_registrations', paid_reg,
    'available_spots', available_spots
  ) INTO result;

  RETURN result;
END;
$$;

-- 获取所有活动的管理统计
CREATE OR REPLACE FUNCTION get_admin_event_stats()
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
    'total_events', (SELECT COUNT(*) FROM events),
    'active_events', (SELECT COUNT(*) FROM events WHERE status = 'active'),
    'total_registrations', (SELECT COUNT(*) FROM event_registrations WHERE status = 'registered'),
    'paid_registrations', (SELECT COUNT(*) FROM event_registrations WHERE status = 'registered' AND payment_status = 'paid'),
    'pending_payments', (SELECT COUNT(*) FROM event_registrations WHERE status = 'registered' AND payment_status = 'pending'),
    'total_revenue', (
      SELECT COALESCE(SUM(e.fee), 0) 
      FROM event_registrations er 
      JOIN events e ON er.event_id = e.id 
      WHERE er.status = 'registered' AND er.payment_status = 'paid'
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- 获取活动报名详情（管理员专用）
CREATE OR REPLACE FUNCTION get_event_registrations(event_uuid UUID)
RETURNS TABLE (
  id UUID,
  participant_name TEXT,
  member_number TEXT,
  phone TEXT,
  payment_status TEXT,
  registration_time TIMESTAMPTZ,
  notes TEXT,
  user_email TEXT
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
    er.id,
    er.participant_name,
    er.member_number,
    er.phone,
    er.payment_status,
    er.registration_time,
    er.notes,
    au.email::TEXT as user_email
  FROM event_registrations er
  JOIN auth.users au ON er.user_id = au.id
  WHERE er.event_id = event_uuid AND er.status = 'registered'
  ORDER BY er.registration_time DESC;
END;
$$;

-- 授权函数执行权限
GRANT EXECUTE ON FUNCTION get_event_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_event_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_event_registrations(UUID) TO authenticated;