-- 为 user_profiles 表添加头像位置字段

-- 1. 添加头像位置和缩放字段
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS avatar_position_x numeric(5,2) DEFAULT 50;

ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS avatar_position_y numeric(5,2) DEFAULT 50;

ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS avatar_scale numeric(5,2) DEFAULT 100;

-- 2. 添加字段注释
COMMENT ON COLUMN public.user_profiles.avatar_position_x IS '头像水平位置百分比 (0-100)';
COMMENT ON COLUMN public.user_profiles.avatar_position_y IS '头像垂直位置百分比 (0-100)';
COMMENT ON COLUMN public.user_profiles.avatar_scale IS '头像缩放百分比 (50-200)';

-- 3. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_user_profiles_avatar_position 
ON public.user_profiles(avatar_position_x, avatar_position_y);

-- 4. 验证字段添加结果
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name IN ('avatar_position_x', 'avatar_position_y', 'avatar_scale')
ORDER BY column_name;
