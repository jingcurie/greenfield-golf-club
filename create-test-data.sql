-- 创建测试用户和活动报名数据
-- 这个SQL脚本可以直接在Supabase SQL编辑器中运行

-- 1. 首先创建测试用户资料
INSERT INTO user_profiles (id, full_name, email, phone, membership_type, role) VALUES
('11111111-1111-1111-1111-111111111111', '测试用户1', 'user1@test.com', '13800001001', 'standard', 'member'),
('22222222-2222-2222-2222-222222222222', '测试用户2', 'user2@test.com', '13800001002', 'standard', 'member'),
('33333333-3333-3333-3333-333333333333', '测试用户3', 'user3@test.com', '13800001003', 'standard', 'member'),
('44444444-4444-4444-4444-444444444444', '测试用户4', 'user4@test.com', '13800001004', 'standard', 'member'),
('55555555-5555-5555-5555-555555555555', '测试用户5', 'user5@test.com', '13800001005', 'standard', 'member'),
('66666666-6666-6666-6666-666666666666', '测试用户6', 'user6@test.com', '13800001006', 'standard', 'member')
ON CONFLICT (id) DO NOTHING;

-- 2. 创建活动报名记录
-- 活动1: 春季高尔夫锦标赛 (cb3f79e4-5d9d-4c86-ac4f-dd66e59e8a67) - 分配 user1, user2, user3
INSERT INTO event_registrations (event_id, user_id, participant_name, member_number, phone, payment_status, notes) VALUES
('cb3f79e4-5d9d-4c86-ac4f-dd66e59e8a67', '11111111-1111-1111-1111-111111111111', '测试用户1', 'M001', '13800001001', 'paid', '测试报名记录'),
('cb3f79e4-5d9d-4c86-ac4f-dd66e59e8a67', '22222222-2222-2222-2222-222222222222', '测试用户2', 'M002', '13800001002', 'paid', '测试报名记录'),
('cb3f79e4-5d9d-4c86-ac4f-dd66e59e8a67', '33333333-3333-3333-3333-333333333333', '测试用户3', 'M003', '13800001003', 'paid', '测试报名记录');

-- 活动2: 会员友谊赛 (60d5fd31-6485-4c67-8e73-168623184e2d) - 分配 user2, user3, user4
INSERT INTO event_registrations (event_id, user_id, participant_name, member_number, phone, payment_status, notes) VALUES
('60d5fd31-6485-4c67-8e73-168623184e2d', '22222222-2222-2222-2222-222222222222', '测试用户2', 'M002', '13800001002', 'paid', '测试报名记录'),
('60d5fd31-6485-4c67-8e73-168623184e2d', '33333333-3333-3333-3333-333333333333', '测试用户3', 'M003', '13800001003', 'paid', '测试报名记录'),
('60d5fd31-6485-4c67-8e73-168623184e2d', '44444444-4444-4444-4444-444444444444', '测试用户4', 'M004', '13800001004', 'paid', '测试报名记录');

-- 活动3: VIP会员专场 (321245e7-41d6-4f19-90d3-ede80b5c72b3) - 分配 user3, user4, user5
INSERT INTO event_registrations (event_id, user_id, participant_name, member_number, phone, payment_status, notes) VALUES
('321245e7-41d6-4f19-90d3-ede80b5c72b3', '33333333-3333-3333-3333-333333333333', '测试用户3', 'M003', '13800001003', 'paid', '测试报名记录'),
('321245e7-41d6-4f19-90d3-ede80b5c72b3', '44444444-4444-4444-4444-444444444444', '测试用户4', 'M004', '13800001004', 'paid', '测试报名记录'),
('321245e7-41d6-4f19-90d3-ede80b5c72b3', '55555555-5555-5555-5555-555555555555', '测试用户5', 'M005', '13800001005', 'paid', '测试报名记录');

-- 活动4: 活动哦 (0e57ecff-e39e-46d2-b113-748f8ed5f097) - 分配 user4, user5, user6
INSERT INTO event_registrations (event_id, user_id, participant_name, member_number, phone, payment_status, notes) VALUES
('0e57ecff-e39e-46d2-b113-748f8ed5f097', '44444444-4444-4444-4444-444444444444', '测试用户4', 'M004', '13800001004', 'paid', '测试报名记录'),
('0e57ecff-e39e-46d2-b113-748f8ed5f097', '55555555-5555-5555-5555-555555555555', '测试用户5', 'M005', '13800001005', 'paid', '测试报名记录'),
('0e57ecff-e39e-46d2-b113-748f8ed5f097', '66666666-6666-6666-6666-666666666666', '测试用户6', 'M006', '13800001006', 'paid', '测试报名记录');

-- 3. 验证数据
SELECT 
  e.title as 活动名称,
  COUNT(er.id) as 报名人数,
  STRING_AGG(er.participant_name, ', ') as 参与者名单
FROM events e
LEFT JOIN event_registrations er ON e.id = er.event_id
GROUP BY e.id, e.title
ORDER BY e.title;