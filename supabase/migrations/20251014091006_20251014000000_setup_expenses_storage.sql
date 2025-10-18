/*
  # 设置费用凭证存储

  1. 创建存储桶
    - 创建 `expenses` bucket 用于存储费用凭证
    - 设置为公开访问（用于查看凭证）

  2. 安全策略
    - 所有人可以查看凭证（SELECT）
    - 只有管理员可以上传凭证（INSERT）
    - 只有管理员可以更新凭证（UPDATE）
    - 只有管理员可以删除凭证（DELETE）
*/

-- 创建 expenses bucket（如果不存在）
INSERT INTO storage.buckets (id, name, public)
VALUES ('expenses', 'expenses', true)
ON CONFLICT (id) DO NOTHING;

-- 允许所有人查看费用凭证
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
    AND tablename = 'objects'
    AND policyname = 'Public can view expense receipts'
  ) THEN
    CREATE POLICY "Public can view expense receipts"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'expenses');
  END IF;
END $$;

-- 只有管理员可以上传费用凭证
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
    AND tablename = 'objects'
    AND policyname = 'Admins can upload expense receipts'
  ) THEN
    CREATE POLICY "Admins can upload expense receipts"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'expenses' AND
        EXISTS (
          SELECT 1 FROM user_profiles
          WHERE user_profiles.id = auth.uid()
          AND user_profiles.role = 'admin'
        )
      );
  END IF;
END $$;

-- 只有管理员可以更新费用凭证
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
    AND tablename = 'objects'
    AND policyname = 'Admins can update expense receipts'
  ) THEN
    CREATE POLICY "Admins can update expense receipts"
      ON storage.objects FOR UPDATE
      TO authenticated
      USING (
        bucket_id = 'expenses' AND
        EXISTS (
          SELECT 1 FROM user_profiles
          WHERE user_profiles.id = auth.uid()
          AND user_profiles.role = 'admin'
        )
      );
  END IF;
END $$;

-- 只有管理员可以删除费用凭证
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
    AND tablename = 'objects'
    AND policyname = 'Admins can delete expense receipts'
  ) THEN
    CREATE POLICY "Admins can delete expense receipts"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (
        bucket_id = 'expenses' AND
        EXISTS (
          SELECT 1 FROM user_profiles
          WHERE user_profiles.id = auth.uid()
          AND user_profiles.role = 'admin'
        )
      );
  END IF;
END $$;
