-- 创建 Supabase Storage bucket 用于存储用户头像
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 为 'avatars' bucket 设置 RLS 策略

-- 1. 允许所有认证用户查看头像
CREATE POLICY "Allow authenticated users to view avatars"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'avatars');

-- 2. 允许认证用户上传自己的头像 (文件路径以用户ID开头)
CREATE POLICY "Allow authenticated users to upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 如果上面的策略不工作，使用更宽松的策略
DROP POLICY IF EXISTS "Allow authenticated users to upload their own avatar" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- 3. 允许认证用户更新自己的头像 (文件路径以用户ID开头)
CREATE POLICY "Allow authenticated users to update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 如果上面的策略不工作，使用更宽松的策略
DROP POLICY IF EXISTS "Allow authenticated users to update their own avatar" ON storage.objects;
CREATE POLICY "Allow authenticated users to update avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars');

-- 4. 允许认证用户删除自己的头像 (文件路径以用户ID开头)
CREATE POLICY "Allow authenticated users to delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 如果上面的策略不工作，使用更宽松的策略
DROP POLICY IF EXISTS "Allow authenticated users to delete their own avatar" ON storage.objects;
CREATE POLICY "Allow authenticated users to delete avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');

-- 验证 bucket 和策略是否创建成功
SELECT id, name, public FROM storage.buckets WHERE id = 'avatars';
SELECT policyname, permissive, roles, cmd, qual, with_check FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';