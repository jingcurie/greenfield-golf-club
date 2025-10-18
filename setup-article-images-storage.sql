-- 设置文章图片存储
-- 确保 event-images bucket 存在并配置正确的权限

-- 创建 bucket（如果不存在）
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-images',
  'event-images', 
  true,
  5242880, -- 5MB 限制
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- 设置存储策略 - 允许认证用户上传图片
CREATE POLICY "允许认证用户上传文章图片" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'event-images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'articles-images'
);

-- 设置存储策略 - 允许所有人查看图片
CREATE POLICY "允许所有人查看文章图片" ON storage.objects
FOR SELECT USING (bucket_id = 'event-images');

-- 设置存储策略 - 允许认证用户更新自己的图片
CREATE POLICY "允许用户更新自己的文章图片" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'event-images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'articles-images'
);

-- 设置存储策略 - 允许认证用户删除自己的图片
CREATE POLICY "允许用户删除自己的文章图片" ON storage.objects
FOR DELETE USING (
  bucket_id = 'event-images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'articles-images'
);

-- 添加注释
COMMENT ON POLICY "允许认证用户上传文章图片" ON storage.objects IS '允许认证用户上传文章图片到 articles-images 目录';
COMMENT ON POLICY "允许所有人查看文章图片" ON storage.objects IS '允许所有人查看文章图片';
COMMENT ON POLICY "允许用户更新自己的文章图片" ON storage.objects IS '允许用户更新自己的文章图片';
COMMENT ON POLICY "允许用户删除自己的文章图片" ON storage.objects IS '允许用户删除自己的文章图片';
