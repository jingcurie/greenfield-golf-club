# Golf Club Management System

这是一个高尔夫俱乐部管理系统，使用 React + TypeScript + Supabase 构建。

## 安装和运行

1. 安装依赖：
   ```bash
   npm install
   ```

2. 配置环境变量：
   - 复制 `.env.example` 为 `.env`
   - 填入你的 Supabase 项目配置

3. 运行开发服务器：
   ```bash
   npm run dev
   ```

## 数据库设置

1. 在 Supabase 中创建新项目
2. 运行 `supabase/migrations/` 目录下的所有迁移文件
3. 更新 `.env` 文件中的数据库连接信息

## 功能特性

- 用户注册和登录
- 会员管理
- 球场预订
- 管理员面板
- 响应式设计

## 技术栈

- React 18
- TypeScript
- Tailwind CSS
- Supabase
- Vite
