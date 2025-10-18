# Supabase 存储桶设置指南

## 问题描述
海报保存时出现 "Bucket not found" 错误，这是因为 Supabase 存储桶 `poster-images` 还没有创建。

## 解决方案

### 方法1：通过 Supabase 仪表板创建（推荐）

1. **登录 Supabase 仪表板**
   - 访问：https://supabase.com/dashboard
   - 选择您的项目：`mypglmtsgfgojtnpmkbc`

2. **创建存储桶**
   - 在左侧菜单中点击 "Storage"
   - 点击 "New bucket" 按钮
   - 填写以下信息：
     - **Name**: `poster-images`
     - **Public bucket**: ✅ 勾选（允许公开访问）
     - **File size limit**: `5 MB`
     - **Allowed MIME types**: `image/jpeg,image/png,image/gif,image/webp`

3. **设置访问策略**
   - 在存储桶创建后，点击 "Policies" 标签
   - 点击 "New policy" 创建以下策略：

   **策略1：允许所有人查看图片**
   ```sql
   CREATE POLICY "Public can view poster images"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'poster-images');
   ```

   **策略2：允许认证用户上传图片**
   ```sql
   CREATE POLICY "Authenticated users can upload poster images"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'poster-images');
   ```

   **策略3：允许认证用户更新图片**
   ```sql
   CREATE POLICY "Authenticated users can update poster images"
   ON storage.objects FOR UPDATE
   TO authenticated
   USING (bucket_id = 'poster-images');
   ```

   **策略4：允许认证用户删除图片**
   ```sql
   CREATE POLICY "Authenticated users can delete poster images"
   ON storage.objects FOR DELETE
   TO authenticated
   USING (bucket_id = 'poster-images');
   ```

### 方法2：通过 SQL 编辑器创建

1. **打开 SQL 编辑器**
   - 在 Supabase 仪表板中点击 "SQL Editor"

2. **执行以下 SQL 代码**
   ```sql
   -- 创建存储桶
   INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
   VALUES ('poster-images', 'poster-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
   ON CONFLICT (id) DO NOTHING;

   -- 设置访问策略
   CREATE POLICY "Public can view poster images"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'poster-images');

   CREATE POLICY "Authenticated users can upload poster images"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'poster-images');

   CREATE POLICY "Authenticated users can update poster images"
   ON storage.objects FOR UPDATE
   TO authenticated
   USING (bucket_id = 'poster-images');

   CREATE POLICY "Authenticated users can delete poster images"
   ON storage.objects FOR DELETE
   TO authenticated
   USING (bucket_id = 'poster-images');
   ```

## 验证设置

设置完成后，您可以：

1. **测试上传功能**
   - 在应用中尝试上传海报图片
   - 检查是否还有 "Bucket not found" 错误

2. **检查存储桶**
   - 在 Supabase 仪表板的 Storage 页面
   - 确认 `poster-images` 存储桶已创建
   - 确认策略已正确设置

## 注意事项

- 存储桶名称必须是 `poster-images`（与代码中的配置一致）
- 必须设置为公开存储桶，否则无法通过 URL 访问图片
- 文件大小限制为 5MB，支持常见的图片格式
- 策略设置后需要等待几分钟才能生效

## 故障排除

如果仍然遇到问题：

1. **检查存储桶是否存在**
   - 在 Supabase 仪表板中查看 Storage 页面

2. **检查策略设置**
   - 确认所有必要的策略都已创建

3. **检查用户权限**
   - 确认用户已登录且具有认证状态

4. **查看错误日志**
   - 在浏览器开发者工具中查看控制台错误
   - 在 Supabase 仪表板中查看日志