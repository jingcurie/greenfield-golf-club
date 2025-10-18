/*
  # 创建会员数量查询功能

  1. 新增功能
    - `get_member_count()` 函数：返回用户资料总数
    - `member_count_view` 视图：提供会员总数查询

  2. 权限设置
    - 允许认证用户和匿名用户查询会员总数
    - 不暴露个人用户信息，只返回统计数据
*/

-- 创建获取会员数量的函数
CREATE OR REPLACE FUNCTION public.get_member_count()
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    member_count bigint;
BEGIN
    SELECT COUNT(*) INTO member_count FROM public.user_profiles;
    RETURN member_count;
END;
$$;

-- 为函数设置权限
GRANT EXECUTE ON FUNCTION public.get_member_count() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_member_count() TO anon;

-- 创建会员数量视图
CREATE OR REPLACE VIEW public.member_count_view AS
SELECT COUNT(*) AS total_members
FROM public.user_profiles;

-- 为视图设置权限
GRANT SELECT ON public.member_count_view TO authenticated;
GRANT SELECT ON public.member_count_view TO anon;