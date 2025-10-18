/*
  # 添加日志到用户资料触发器
  
  1. 修改
    - 更新 handle_new_user 触发器函数，添加详细日志
    - 使用 RAISE NOTICE 打印调试信息
    
  2. 目的
    - 诊断 user_metadata 是否正确传递
    - 检查触发器是否被正确调用
*/

-- 删除现有触发器和函数
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- 创建带日志的新函数
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_full_name TEXT;
  v_phone TEXT;
BEGIN
  -- 打印原始 metadata
  RAISE NOTICE '=== 新用户触发器被调用 ===';
  RAISE NOTICE 'User ID: %', NEW.id;
  RAISE NOTICE 'Email: %', NEW.email;
  RAISE NOTICE 'Raw user metadata: %', NEW.raw_user_meta_data;
  
  -- 从 metadata 提取数据
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', 'User');
  v_phone := NEW.raw_user_meta_data->>'phone';
  
  RAISE NOTICE '提取的 full_name: %', v_full_name;
  RAISE NOTICE '提取的 phone: %', v_phone;
  
  -- 插入用户资料
  INSERT INTO public.user_profiles (
    id,
    full_name,
    phone,
    role,
    membership_type
  ) VALUES (
    NEW.id,
    v_full_name,
    v_phone,
    'member',
    'standard'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone;
  
  RAISE NOTICE '用户资料已创建/更新';
  RAISE NOTICE '===========================';
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING '创建用户资料时出错: % %', SQLERRM, SQLSTATE;
  RETURN NEW;
END;
$$;

-- 重新创建触发器
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
