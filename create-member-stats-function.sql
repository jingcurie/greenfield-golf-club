-- 创建获取会员统计信息的存储过程
CREATE OR REPLACE FUNCTION public.get_member_stats()
RETURNS TABLE (
  total_members bigint,
  standard_members bigint,
  premium_members bigint,
  vip_members bigint,
  active_members bigint,
  new_members_this_month bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 检查调用者是否为管理员
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can access member statistics';
  END IF;

  -- 返回会员统计信息
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM public.user_profiles) as total_members,
    (SELECT COUNT(*) FROM public.user_profiles WHERE membership_type = 'standard') as standard_members,
    (SELECT COUNT(*) FROM public.user_profiles WHERE membership_type = 'premium') as premium_members,
    (SELECT COUNT(*) FROM public.user_profiles WHERE membership_type = 'vip') as vip_members,
    (SELECT COUNT(*) FROM public.user_profiles 
     WHERE last_sign_in_at IS NOT NULL) as active_members,
    (SELECT COUNT(*) FROM public.user_profiles 
     WHERE created_at >= date_trunc('month', CURRENT_DATE)) as new_members_this_month;
END;
$$;

-- 授权认证用户执行此函数
GRANT EXECUTE ON FUNCTION public.get_member_stats() TO authenticated;

-- 添加函数注释
COMMENT ON FUNCTION public.get_member_stats() IS
'Returns member statistics. Only accessible by admins.';
