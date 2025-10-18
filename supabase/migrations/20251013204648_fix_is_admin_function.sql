/*
  # 修复 is_admin() 函数避免 RLS 死锁

  ## 问题
  is_admin() 函数作为 SECURITY DEFINER 运行，但在查询 user_profiles 时触发 RLS 策略，
  而 RLS 策略又调用 is_admin()，导致循环引用和数据库错误。

  ## 解决方案
  使用 SECURITY DEFINER 并设置 search_path，让函数能够绕过 RLS 直接访问表数据。
*/

-- 重新创建 is_admin 函数，使用更安全的方式
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 确保函数权限正确
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;
