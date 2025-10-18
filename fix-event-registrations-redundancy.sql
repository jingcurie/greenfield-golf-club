-- 修复 event_registrations 表的冗余问题
-- 删除重复的用户信息字段

-- 1. 首先检查当前数据情况
SELECT '=== 检查当前数据情况 ===' as step;

-- 检查 event_registrations 表中的冗余字段数据
SELECT 
    'event_registrations 总记录数:' as check_type,
    COUNT(*) as count
FROM event_registrations;

SELECT 
    '有 participant_name 的记录数:' as check_type,
    COUNT(*) as count
FROM event_registrations 
WHERE participant_name IS NOT NULL;

SELECT 
    '有 member_number 的记录数:' as check_type,
    COUNT(*) as count
FROM event_registrations 
WHERE member_number IS NOT NULL;

SELECT 
    '有 phone 的记录数:' as check_type,
    COUNT(*) as count
FROM event_registrations 
WHERE phone IS NOT NULL;

-- 2. 先为 user_profiles 表添加缺失的字段
SELECT '=== 为 user_profiles 表添加缺失字段 ===' as step;

-- 添加 member_number 字段
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS member_number TEXT;

-- 添加 phone 字段（如果不存在）
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS phone TEXT;

-- 3. 从 event_registrations 更新 user_profiles 表
SELECT '=== 更新 user_profiles 表数据 ===' as step;

-- 更新 user_profiles 中的 member_number
UPDATE user_profiles 
SET member_number = er.member_number
FROM event_registrations er
WHERE user_profiles.id = er.user_id 
    AND user_profiles.member_number IS NULL 
    AND er.member_number IS NOT NULL;

-- 更新 user_profiles 中的 phone
UPDATE user_profiles 
SET phone = er.phone
FROM event_registrations er
WHERE user_profiles.id = er.user_id 
    AND user_profiles.phone IS NULL 
    AND er.phone IS NOT NULL;

-- 4. 删除冗余字段
SELECT '=== 删除冗余字段 ===' as step;

-- 删除 participant_name 字段
ALTER TABLE event_registrations DROP COLUMN IF EXISTS participant_name;

-- 删除 member_number 字段  
ALTER TABLE event_registrations DROP COLUMN IF EXISTS member_number;

-- 删除 phone 字段
ALTER TABLE event_registrations DROP COLUMN IF EXISTS phone;

-- 5. 验证修复结果
SELECT '=== 验证修复结果 ===' as step;

-- 查看修复后的表结构
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'event_registrations' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. 测试查询（确保功能正常）
SELECT '=== 测试关联查询 ===' as step;

-- 测试通过 user_id 获取用户信息的查询
SELECT 
    er.id,
    er.event_id,
    er.user_id,
    up.full_name as participant_name,
    up.member_number,
    up.phone,
    er.payment_status,
    er.registration_time,
    er.status
FROM event_registrations er
JOIN user_profiles up ON er.user_id = up.id
LIMIT 5;

SELECT '=== 修复完成 ===' as result;
