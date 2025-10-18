/*
  # 修复用户资料创建 - 支持电话号码

  ## 问题
  当前触发器只从 raw_user_meta_data 读取 full_name，没有读取 phone

  ## 解决方案
  更新 handle_new_user() 函数，同时读取 full_name 和 phone

  ## 变更内容
  1. 更新 handle_new_user() 函数，添加 phone 字段处理
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, phone, role, membership_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.raw_user_meta_data->>'phone',
    'member',
    'standard'
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;
