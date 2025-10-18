/*
  # 添加公开会员数量查询策略

  1. 新功能
    - 允许所有认证用户查询会员总数
    - 不暴露个人隐私信息
    - 只允许COUNT查询，不允许查看具体数据

  2. 安全性
    - 保持现有的个人资料隐私保护
    - 只开放统计数据查询
*/

-- 创建一个视图用于统计会员数量
CREATE OR REPLACE VIEW member_count_view AS
SELECT COUNT(*) as total_members
FROM user_profiles;

-- 允许认证用户查看会员统计
ALTER VIEW member_count_view OWNER TO postgres;
GRANT SELECT ON member_count_view TO authenticated;

-- 或者，添加一个允许COUNT查询的策略
CREATE POLICY "Allow member count query"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (false)  -- 不允许查看具体数据
  WITH CHECK (false);

-- 创建一个函数来获取会员总数
CREATE OR REPLACE FUNCTION get_member_count()
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COUNT(*)::INTEGER FROM user_profiles;
$$;

-- 允许认证用户调用这个函数
GRANT EXECUTE ON FUNCTION get_member_count() TO authenticated;