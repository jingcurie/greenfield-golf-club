-- 修复events表的status约束问题
-- 检查当前约束
SELECT conname, contype FROM pg_constraint WHERE conname = 'events_status_check';

-- 删除现有约束（如果存在）
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_status_check;

-- 重新创建约束，确保包含所有状态
ALTER TABLE events ADD CONSTRAINT events_status_check 
CHECK (status IN ('upcoming', 'active', 'cancelled', 'completed'));

-- 验证约束已创建
SELECT conname, contype FROM pg_constraint WHERE conname = 'events_status_check';

-- 测试插入upcoming状态
INSERT INTO events (title, start_time, end_time, location, fee, max_participants, registration_deadline, status)
VALUES ('测试活动', NOW(), NOW() + INTERVAL '1 day', '测试地点', 0, 10, NOW() + INTERVAL '1 day', 'upcoming');

-- 如果测试成功，删除测试数据
DELETE FROM events WHERE title = '测试活动';
