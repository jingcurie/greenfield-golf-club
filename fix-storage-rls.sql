-- 临时禁用存储的 RLS 来测试图片上传
-- 注意：这只是临时解决方案，生产环境需要重新启用 RLS

-- 禁用 storage.objects 表的 RLS
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- 或者，如果你想要更安全的方式，可以创建一个宽松的策略
-- 先删除所有现有策略
DROP POLICY IF EXISTS "允许认证用户上传文章图片" ON storage.objects;
DROP POLICY IF EXISTS "允许所有人查看文章图片" ON storage.objects;
DROP POLICY IF EXISTS "允许用户更新自己的文章图片" ON storage.objects;
DROP POLICY IF EXISTS "允许用户删除自己的文章图片" ON storage.objects;

-- 创建宽松的策略
CREATE POLICY "允许所有认证用户操作 event-images" ON storage.objects
FOR ALL USING (
  bucket_id = 'event-images' 
  AND auth.role() = 'authenticated'
);

-- 允许所有人查看 event-images 中的文件
CREATE POLICY "允许所有人查看 event-images" ON storage.objects
FOR SELECT USING (bucket_id = 'event-images');

-- 确保 bucket 存在
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-images',
  'event-images', 
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];