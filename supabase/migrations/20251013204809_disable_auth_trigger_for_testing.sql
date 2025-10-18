/*
  # 临时禁用认证触发器进行测试

  ## 目的
  禁用 on_auth_user_created 触发器以测试是否它导致登录问题
*/

-- 临时删除触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
