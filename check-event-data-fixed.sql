-- 检查活动数据情况（修复版）

-- 1. 查看所有活动
SELECT 
  id,
  title,
  start_time,
  status
FROM events
ORDER BY created_at DESC;

-- 2. 查看所有报名记录
SELECT 
  er.id,
  er.event_id,
  er.user_id,
  er.payment_status,
  er.status,
  e.title as event_title
FROM event_registrations er
LEFT JOIN events e ON er.event_id = e.id
ORDER BY e.created_at DESC;

-- 3. 查看特定活动的报名情况（请将 YOUR_EVENT_ID 替换为实际的活动ID）
-- SELECT 
--   er.id,
--   er.user_id,
--   er.payment_status,
--   er.status,
--   up.full_name
-- FROM event_registrations er
-- LEFT JOIN user_profiles up ON er.user_id = up.id
-- WHERE er.event_id = 'YOUR_EVENT_ID';

-- 4. 统计每个活动的报名情况
SELECT 
  e.id,
  e.title,
  COUNT(er.id) as total_registrations,
  COUNT(CASE WHEN er.payment_status = 'paid' THEN 1 END) as paid_registrations,
  COUNT(CASE WHEN er.payment_status = 'pending' THEN 1 END) as pending_registrations,
  COUNT(CASE WHEN er.payment_status = 'failed' THEN 1 END) as failed_registrations
FROM events e
LEFT JOIN event_registrations er ON e.id = er.event_id
GROUP BY e.id, e.title
ORDER BY e.created_at DESC;

-- 5. 检查是否有报名记录但支付状态不是 'paid'
SELECT 
  er.event_id,
  e.title,
  er.payment_status,
  COUNT(*) as count
FROM event_registrations er
LEFT JOIN events e ON er.event_id = e.id
GROUP BY er.event_id, e.title, er.payment_status
ORDER BY e.created_at DESC;



