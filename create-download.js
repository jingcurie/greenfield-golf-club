import fs from 'fs';
import path from 'path';

// 要包含的文件和目录
const filesToInclude = [
  'package.json',
  'vite.config.js',
  'tailwind.config.js',
  'postcss.config.js',
  'index.html',
  '.env.example',
  'src/',
  'supabase/'
];

// 要排除的文件和目录
const excludePatterns = [
  'node_modules',
  'dist',
  '.git',
  '*.log',
  '.env'
];

function shouldExclude(filePath) {
  return excludePatterns.some(pattern => {
    if (pattern.includes('*')) {
      return filePath.includes(pattern.replace('*', ''));
    }
    return filePath.includes(pattern);
  });
}

function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (shouldExclude(srcPath)) {
      continue;
    }

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function copyFile(src, dest) {
  if (fs.existsSync(src) && !shouldExclude(src)) {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
  }
}

// 创建下载目录
const downloadDir = 'golf-club-download';
if (fs.existsSync(downloadDir)) {
  fs.rmSync(downloadDir, { recursive: true });
}
fs.mkdirSync(downloadDir);

console.log('正在准备项目文件...');

// 复制文件和目录
filesToInclude.forEach(item => {
  const srcPath = path.join('.', item);
  const destPath = path.join(downloadDir, item);

  if (fs.existsSync(srcPath)) {
    const stat = fs.statSync(srcPath);
    if (stat.isDirectory()) {
      copyDirectory(srcPath, destPath);
      console.log(`✓ 复制目录: ${item}`);
    } else {
      copyFile(srcPath, destPath);
      console.log(`✓ 复制文件: ${item}`);
    }
  } else {
    console.log(`⚠ 文件不存在: ${item}`);
  }
});

// 创建 README 文件
const readmeContent = `# Golf Club Management System

这是一个高尔夫俱乐部管理系统，使用 React + TypeScript + Supabase 构建。

## 安装和运行

1. 安装依赖：
   \`\`\`bash
   npm install
   \`\`\`

2. 配置环境变量：
   - 复制 \`.env.example\` 为 \`.env\`
   - 填入你的 Supabase 项目配置

3. 运行开发服务器：
   \`\`\`bash
   npm run dev
   \`\`\`

## 数据库设置

1. 在 Supabase 中创建新项目
2. 运行 \`supabase/migrations/\` 目录下的所有迁移文件
3. 更新 \`.env\` 文件中的数据库连接信息

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
`;

fs.writeFileSync(path.join(downloadDir, 'README.md'), readmeContent);

console.log('\n✅ 项目文件准备完成！');
console.log(`📁 文件位置: ${downloadDir}/`);
console.log('\n你现在可以：');
console.log('1. 下载整个 golf-club-download 文件夹');
console.log('2. 在本地运行 npm install');
console.log('3. 用 Cursor 打开项目继续开发');