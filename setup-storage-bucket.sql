-- 创建 poster-images bucket (如果不存在)
INSERT INTO storage.buckets (id, name, public)
VALUES ('poster-images', 'poster-images', true)
ON CONFLICT (id) DO NOTHING;

-- 删除旧的 policies (如果存在)
DROP POLICY IF EXISTS "Public can view poster images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload poster images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update poster images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete poster images" ON storage.objects;

-- 允许所有人查看 poster-images
CREATE POLICY "Public can view poster images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'poster-images');

-- 只有管理员可以上传 poster-images
CREATE POLICY "Admins can upload poster images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'poster-images' AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- 只有管理员可以更新 poster-images
CREATE POLICY "Admins can update poster images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'poster-images' AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- 只有管理员可以删除 poster-images
CREATE POLICY "Admins can delete poster images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'poster-images' AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );
