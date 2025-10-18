/*
  # 删除测试用户数据

  1. 删除用户资料
  2. 删除预订记录
  3. 删除认证用户记录

  注意：这会删除所有在截图中看到的用户ID
*/

-- 删除用户资料记录
DELETE FROM user_profiles 
WHERE id IN (
  '4a7e867b-f643-4a3d-8c4c-56807a7ce7b8',
  '4edd0ffe-5b4a-497b-b37c-dab4c32cb47f',
  '7e1d969d-f53f-4776-b890-d0eb69dc97bf',
  'f6630827-dc45-4bda-9f76-042fb06d686c'
);

-- 删除预订记录
DELETE FROM bookings 
WHERE user_id IN (
  '4a7e867b-f643-4a3d-8c4c-56807a7ce7b8',
  '4edd0ffe-5b4a-497b-b37c-dab4c32cb47f',
  '7e1d969d-f53f-4776-b890-d0eb69dc97bf',
  'f6630827-dc45-4bda-9f76-042fb06d686c'
);

-- 删除认证用户记录（需要管理员权限）
DELETE FROM auth.users 
WHERE id IN (
  '4a7e867b-f643-4a3d-8c4c-56807a7ce7b8',
  '4edd0ffe-5b4a-497b-b37c-dab4c32cb47f',
  '7e1d969d-f53f-4776-b890-d0eb69dc97bf',
  'f6630827-dc45-4bda-9f76-042fb06d686c'
);