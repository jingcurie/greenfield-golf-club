-- 添加邮箱字段到 user_profiles 表
-- 步骤1: 添加 email 字段
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS email text;

-- 步骤2: 从 auth.users 同步现有用户的邮箱
UPDATE public.user_profiles 
SET email = au.email
FROM auth.users au
WHERE user_profiles.id = au.id
AND au.email IS NOT NULL;

-- 步骤3: 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_user_profiles_email 
ON public.user_profiles(email);

-- 步骤4: 添加注释
COMMENT ON COLUMN public.user_profiles.email IS '用户邮箱地址，从 auth.users 同步';

-- 步骤5: 验证数据同步结果
SELECT 
  COUNT(*) as total_profiles,
  COUNT(email) as profiles_with_email,
  COUNT(*) - COUNT(email) as profiles_without_email
FROM public.user_profiles;