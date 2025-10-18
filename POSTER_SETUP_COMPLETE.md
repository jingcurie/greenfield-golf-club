# 海报功能完整设置指南

## 🚨 **问题诊断**

您遇到 "Bucket not found" 错误是因为：
1. ❌ **存储桶不存在** - `poster-images` 存储桶未创建
2. ❌ **数据表不存在** - `posters` 表未创建

## 🔧 **完整解决方案**

### **步骤1：创建存储桶**

1. **访问 Supabase 仪表板**
   - 打开：https://supabase.com/dashboard
   - 选择项目：`mypglmtsgfgojtnpmkbc`

2. **创建存储桶**
   - 点击左侧 "Storage" 菜单
   - 点击 "New bucket" 按钮
   - 填写信息：
     - **Name**: `poster-images`
     - **Public bucket**: ✅ 勾选
     - **File size limit**: `5 MB`
     - **Allowed MIME types**: `image/jpeg,image/png,image/gif,image/webp`

3. **设置存储桶策略**
   在存储桶的 "Policies" 标签页创建以下策略：

   ```sql
   -- 允许所有人查看图片
   CREATE POLICY "Public can view poster images"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'poster-images');

   -- 允许认证用户上传图片
   CREATE POLICY "Authenticated users can upload poster images"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'poster-images');

   -- 允许认证用户更新图片
   CREATE POLICY "Authenticated users can update poster images"
   ON storage.objects FOR UPDATE
   TO authenticated
   USING (bucket_id = 'poster-images');

   -- 允许认证用户删除图片
   CREATE POLICY "Authenticated users can delete poster images"
   ON storage.objects FOR DELETE
   TO authenticated
   USING (bucket_id = 'poster-images');
   ```

### **步骤2：创建数据表**

1. **打开 SQL 编辑器**
   - 在 Supabase 仪表板中点击 "SQL Editor"

2. **执行表创建脚本**
   - 复制 `create-posters-table.sql` 文件中的内容
   - 粘贴到 SQL 编辑器中
   - 点击 "Run" 执行

### **步骤3：验证设置**

执行以下 SQL 来验证设置：

```sql
-- 检查表是否存在
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'posters' AND table_schema = 'public';

-- 检查存储桶是否存在
SELECT id, name, public FROM storage.buckets WHERE id = 'poster-images';

-- 检查策略是否设置
SELECT policyname FROM pg_policies 
WHERE tablename = 'posters' AND schemaname = 'public';
```

## 📋 **完整检查清单**

### **存储桶设置**
- [ ] 创建 `poster-images` 存储桶
- [ ] 设置为公开存储桶
- [ ] 设置文件大小限制为 5MB
- [ ] 设置允许的 MIME 类型
- [ ] 创建4个访问策略

### **数据表设置**
- [ ] 创建 `posters` 表
- [ ] 启用行级安全 (RLS)
- [ ] 创建访问策略
- [ ] 创建索引
- [ ] 创建触发器

### **功能测试**
- [ ] 测试海报上传
- [ ] 测试海报显示
- [ ] 测试海报编辑
- [ ] 测试海报删除

## 🎯 **预期结果**

设置完成后，您应该能够：
1. ✅ 正常上传海报图片到存储桶
2. ✅ 海报数据保存到 `posters` 表
3. ✅ 在管理面板中查看和管理海报
4. ✅ 在前端页面中显示海报

## 🚨 **常见问题**

### **问题1：仍然报 "Bucket not found"**
- 检查存储桶是否创建成功
- 确认存储桶名称为 `poster-images`
- 等待2-3分钟让设置生效

### **问题2：报 "Table not found"**
- 检查 `posters` 表是否创建成功
- 确认 SQL 脚本执行无错误
- 检查用户权限

### **问题3：无法上传图片**
- 检查存储桶策略设置
- 确认用户已登录
- 检查文件大小和格式

## 📞 **需要帮助？**

如果遇到问题，请提供：
1. 具体的错误信息
2. 在哪个步骤出现问题
3. 浏览器控制台的错误日志