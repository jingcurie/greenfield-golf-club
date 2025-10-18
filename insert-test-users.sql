-- 插入测试用户数据到 user_profiles 表
-- 请在 Supabase SQL Editor 中运行此脚本

-- 插入6个测试用户
INSERT INTO user_profiles (id, full_name, email, phone, membership_type, role) VALUES
('11111111-1111-1111-1111-111111111111', '测试用户1', 'user1@test.com', '13800001001', 'standard', 'member'),
('22222222-2222-2222-2222-222222222222', '测试用户2', 'user2@test.com', '13800001002', 'standard', 'member'),
('33333333-3333-3333-3333-333333333333', '测试用户3', 'user3@test.com', '13800001003', 'standard', 'member'),
('44444444-4444-4444-4444-444444444444', '测试用户4', 'user4@test.com', '13800001004', 'standard', 'member'),
('55555555-5555-5555-5555-555555555555', '测试用户5', 'user5@test.com', '13800001005', 'standard', 'member'),
('66666666-6666-6666-6666-666666666666', '测试用户6', 'user6@test.com', '13800001006', 'standard', 'member')
ON CONFLICT (id) DO NOTHING;

-- 验证插入结果
SELECT id, full_name, email, phone FROM user_profiles WHERE full_name LIKE '测试用户%' ORDER BY full_name;