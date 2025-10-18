-- 创建支付证明存储桶（如果不存在）
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-images', 'event-images', true)
ON CONFLICT (id) DO NOTHING;

-- 删除可能存在的旧策略
DROP POLICY IF EXISTS "Users can upload payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload event images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;

-- 设置存储桶策略，允许认证用户上传支付证明
CREATE POLICY "Authenticated users can upload payment proofs" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'event-images' 
  AND auth.role() = 'authenticated'
);

-- 设置存储桶策略，允许公开读取支付证明
CREATE POLICY "Payment proofs are publicly readable" ON storage.objects
FOR SELECT USING (bucket_id = 'event-images');

-- 设置存储桶策略，允许认证用户删除支付证明
CREATE POLICY "Authenticated users can delete payment proofs" ON storage.objects
FOR DELETE USING (
  bucket_id = 'event-images' 
  AND auth.role() = 'authenticated'
);

-- 验证存储桶和策略
SELECT * FROM storage.buckets WHERE id = 'event-images';
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%payment%';
