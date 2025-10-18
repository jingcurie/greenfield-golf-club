/*
  # 修复用户认证问题 - 自动创建用户资料

  ## 问题
  当用户登录时，RLS策略会查询 user_profiles 表，但如果用户资料不存在会导致认证失败。

  ## 解决方案
  创建触发器，在 auth.users 表中创建新用户时自动在 user_profiles 表中创建对应记录。

  ## 变更内容
  1. 创建函数 handle_new_user() - 自动为新用户创建资料
  2. 创建触发器 on_auth_user_created - 监听 auth.users 表的 INSERT 事件
  3. 为已存在但没有资料的用户补充资料
*/

-- 创建函数：自动为新用户创建资料
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, role, membership_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    'member',
    'standard'
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- 删除旧触发器（如果存在）
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 创建触发器：监听 auth.users 表的 INSERT 事件
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 为已存在但没有资料的用户创建资料
INSERT INTO public.user_profiles (id, full_name, role, membership_type)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data->>'full_name', 'User'),
  'member',
  'standard'
FROM auth.users u
LEFT JOIN public.user_profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
