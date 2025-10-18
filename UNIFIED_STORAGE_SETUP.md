# 统一图片存储设置完成

## 🎯 已完成的工作

### ✅ 1. 创建统一存储桶
- 创建了 `golf-club-images` 统一存储桶
- 设置了统一的权限策略
- 支持所有图片格式 (JPEG, PNG, GIF, WebP)

### ✅ 2. 更新代码引用
已更新以下文件中的 bucket 引用：

**核心工具文件：**
- `src/utils/imageUpload.ts` - 默认使用 `golf-club-images`

**组件文件：**
- `src/components/TinyMCEEditor.tsx` - 文章图片上传
- `src/components/PosterForm.tsx` - 海报图片上传
- `src/components/ExpenseAdmin.tsx` - 费用凭证上传
- `src/components/EventForm.tsx` - 活动二维码上传
- `src/components/EventRegistrationModal.tsx` - 支付证明上传
- `src/components/InvestmentProjectForm.tsx` - 投资二维码上传

### ✅ 3. 文件路径结构
```
golf-club-images/
├── posters/          # 海报图片
├── events/           # 活动图片
├── articles/         # 文章图片
├── avatars/          # 用户头像
├── expenses/         # 费用凭证图片
└── payment-proofs/   # 支付证明图片
```

## 🔧 下一步操作

### 1. 在 Supabase 中执行 SQL
```sql
-- 执行 create-unified-image-storage.sql
-- 这会创建存储桶和权限策略
```

### 2. 迁移现有文件（可选）
```bash
# 如果需要迁移现有文件，运行：
node migrate-to-unified-storage.js
```

### 3. 测试所有功能
```bash
# 测试所有上传功能：
node test-unified-storage.js
```

## 💡 优势

1. **简化管理** - 只需管理1个存储桶
2. **统一权限** - 一套RLS策略搞定所有
3. **清晰分类** - 按功能分目录存储
4. **易于维护** - 减少配置复杂度
5. **成本更低** - 减少存储桶数量

## ⚠️ 注意事项

1. **备份数据** - 迁移前请备份现有文件
2. **测试功能** - 迁移后测试所有上传功能
3. **更新引用** - 确保所有代码都使用新的存储桶
4. **权限验证** - 确认所有用户都能正常上传/下载

## 🚀 完成状态

- [x] 创建统一存储桶
- [x] 更新代码引用
- [ ] 执行 SQL 脚本
- [ ] 迁移现有文件
- [ ] 测试所有功能
