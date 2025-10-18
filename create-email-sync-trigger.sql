-- 创建触发器函数，自动同步新用户的邮箱和最后登录时间
CREATE OR REPLACE FUNCTION public.sync_user_auth_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 从 auth.users 获取邮箱和最后登录时间并更新到 user_profiles
  UPDATE public.user_profiles 
  SET 
    email = au.email,
    last_sign_in_at = au.last_sign_in_at
  FROM auth.users au
  WHERE user_profiles.id = NEW.id
  AND (au.email IS NOT NULL OR au.last_sign_in_at IS NOT NULL);
  
  RETURN NEW;
END;
$$;

-- 创建触发器，在 user_profiles 插入后自动同步认证数据
DROP TRIGGER IF EXISTS trigger_sync_user_auth_data ON public.user_profiles;
CREATE TRIGGER trigger_sync_user_auth_data
  AFTER INSERT ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_auth_data();

-- 添加注释
COMMENT ON FUNCTION public.sync_user_auth_data() IS '自动同步新用户注册时的邮箱地址和最后登录时间';
