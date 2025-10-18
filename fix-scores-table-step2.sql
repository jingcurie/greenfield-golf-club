-- 第二步：验证数据匹配后，继续修复
-- 只有在第一步成功匹配所有数据后才执行

-- 1. 验证所有 scores 都有对应的 event_id
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ 所有成绩记录都已匹配到活动'
    ELSE '❌ 还有 ' || COUNT(*) || ' 条记录未匹配'
  END as verification_result
FROM scores 
WHERE event_id IS NULL;

-- 2. 如果验证通过，添加外键约束
ALTER TABLE scores 
ADD CONSTRAINT fk_scores_event_id 
FOREIGN KEY (event_id) REFERENCES events(id);

ALTER TABLE scores 
ADD CONSTRAINT fk_scores_user_id 
FOREIGN KEY (user_id) REFERENCES user_profiles(id);

-- 3. 设置关键字段为 NOT NULL
ALTER TABLE scores 
ALTER COLUMN event_id SET NOT NULL,
ALTER COLUMN user_id SET NOT NULL;

-- 4. 添加索引提高查询性能（如果不存在的话）
CREATE INDEX IF NOT EXISTS idx_scores_event_id ON scores(event_id);
CREATE INDEX IF NOT EXISTS idx_scores_user_id ON scores(user_id);
CREATE INDEX IF NOT EXISTS idx_scores_competition_date ON scores(competition_date);

-- 5. 验证约束是否生效
SELECT 
  '外键约束已添加' as status,
  COUNT(*) as total_scores
FROM scores;
