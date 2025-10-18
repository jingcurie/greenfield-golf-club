-- 完全禁用event-images存储桶的RLS
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- 或者，如果只想对特定存储桶禁用RLS，使用以下方法：
-- 删除所有现有的RLS策略
DROP POLICY IF EXISTS "Authenticated users can upload payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Payment proofs are publicly readable" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload event images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;

-- 创建更宽松的策略
CREATE POLICY "Allow all operations on event-images" ON storage.objects
FOR ALL USING (bucket_id = 'event-images');

-- 验证策略
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%event%' OR policyname LIKE '%payment%';
