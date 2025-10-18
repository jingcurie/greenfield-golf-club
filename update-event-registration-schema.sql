-- 更新活动报名表，添加审批流程字段
-- 1. 添加审批状态字段
ALTER TABLE event_registrations 
ADD COLUMN IF NOT EXISTS approval_status text DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected'));

-- 2. 添加审批时间字段
ALTER TABLE event_registrations 
ADD COLUMN IF NOT EXISTS approval_time timestamptz;

-- 3. 添加审批人字段
ALTER TABLE event_registrations 
ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES auth.users(id);

-- 4. 添加审批备注字段
ALTER TABLE event_registrations 
ADD COLUMN IF NOT EXISTS approval_notes text;

-- 5. 更新现有的报名记录，将已支付的记录设为已审批
UPDATE event_registrations 
SET approval_status = 'approved', 
    approval_time = registration_time,
    approved_by = (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)
WHERE payment_status = 'paid' AND approval_status = 'pending';

-- 6. 更新现有的未支付记录，设为待审批
UPDATE event_registrations 
SET approval_status = 'pending'
WHERE payment_status = 'pending' AND approval_status IS NULL;

-- 7. 添加索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_event_registrations_approval_status 
ON event_registrations(approval_status);

CREATE INDEX IF NOT EXISTS idx_event_registrations_event_approval 
ON event_registrations(event_id, approval_status);

-- 8. 删除旧的RLS策略（如果存在）
DROP POLICY IF EXISTS "Admins can view all registrations with approval info" ON event_registrations;
DROP POLICY IF EXISTS "Admins can update approval status" ON event_registrations;
DROP POLICY IF EXISTS "Users can cancel pending registrations" ON event_registrations;

-- 9. 创建新的RLS策略
CREATE POLICY "Admins can view all registrations with approval info"
  ON event_registrations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update approval status"
  ON event_registrations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can cancel pending registrations"
  ON event_registrations
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id 
    AND approval_status = 'pending'
    AND status = 'registered'
  );

-- 添加注释
COMMENT ON COLUMN event_registrations.approval_status IS '审批状态: pending(待审批), approved(已通过), rejected(已拒绝)';
COMMENT ON COLUMN event_registrations.approval_time IS '审批时间';
COMMENT ON COLUMN event_registrations.approved_by IS '审批人ID';
COMMENT ON COLUMN event_registrations.approval_notes IS '审批备注';

-- 为活动表添加支付相关字段
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS payment_qr_code text,
ADD COLUMN IF NOT EXISTS payment_emt_email text,
ADD COLUMN IF NOT EXISTS payment_instructions text;

-- 添加注释
COMMENT ON COLUMN events.payment_qr_code IS '缴费二维码图片URL';
COMMENT ON COLUMN events.payment_emt_email IS 'EMT邮箱地址';
COMMENT ON COLUMN events.payment_instructions IS '支付说明';
