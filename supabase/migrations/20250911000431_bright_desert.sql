/*
  # 添加真实姓名字段

  1. 表结构更新
    - 在 `user_profiles` 表中添加 `real_name` 字段
    - 字段为可选，允许为空
    - 用于存储用户的真实姓名（可选填写）

  2. 字段说明
    - `full_name`: 用户昵称（必填，显示用）
    - `real_name`: 真实姓名（可选，正式场合用）
*/

-- 添加真实姓名字段到用户资料表
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'real_name'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN real_name text;
  END IF;
END $$;