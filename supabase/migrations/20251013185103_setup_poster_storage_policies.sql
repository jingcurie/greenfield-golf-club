/*
  # 设置海报图片存储策略

  ## 功能说明
  为 poster-images storage bucket 设置访问策略

  ## 策略
    1. 所有人可以查看海报图片
    2. 只有管理员可以上传、更新、删除海报图片
*/

-- 允许所有人查看 poster-images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Public can view poster images'
  ) THEN
    CREATE POLICY "Public can view poster images"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'poster-images');
  END IF;
END $$;

-- 只有管理员可以上传 poster-images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Admins can upload poster images'
  ) THEN
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
  END IF;
END $$;

-- 只有管理员可以更新 poster-images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Admins can update poster images'
  ) THEN
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
  END IF;
END $$;

-- 只有管理员可以删除 poster-images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Admins can delete poster images'
  ) THEN
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
  END IF;
END $$;