/*
  # 修改用户资料创建触发器 - 改为 UPSERT

  ## 问题
  当前触发器使用 ON CONFLICT DO NOTHING，如果记录已存在则不更新

  ## 解决方案
  改为 ON CONFLICT DO UPDATE，确保姓名和电话号码被正确更新

  ## 变更内容
  1. 更新 handle_new_user() 函数，使用 UPSERT 语义
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
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, user_profiles.full_name),
    phone = COALESCE(EXCLUDED.phone, user_profiles.phone);
  
  RETURN NEW;
END;
$$;
