// 迁移存储文件到统一存储桶
// 需要 Supabase 管理员权限执行

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// 加载环境变量
dotenv.config()

// 配置 Supabase 客户端
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://mypglmtsgfgojtnpmkbc.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY'

if (!supabaseKey || supabaseKey === 'YOUR_SERVICE_ROLE_KEY') {
  console.error('❌ 请设置 SUPABASE_SERVICE_ROLE_KEY 环境变量')
  console.log('在 .env 文件中添加：SUPABASE_SERVICE_ROLE_KEY=your_service_role_key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// 需要迁移的存储桶映射
const migrationMap = {
  'poster-images': 'golf-club-images/posters',
  'event-images': 'golf-club-images/events', 
  'expenses': 'golf-club-images/expenses',
  'avatars': 'golf-club-images/avatars',
  'payment-proofs': 'golf-club-images/payment-proofs'
}

async function migrateStorageFiles() {
  console.log('开始迁移存储文件...')
  
  for (const [oldBucket, newPath] of Object.entries(migrationMap)) {
    try {
      console.log(`\n处理存储桶: ${oldBucket} -> ${newPath}`)
      
      // 列出旧存储桶中的所有文件
      const { data: files, error: listError } = await supabase.storage
        .from(oldBucket)
        .list('', { limit: 1000 })
      
      if (listError) {
        console.error(`列出 ${oldBucket} 文件失败:`, listError)
        continue
      }
      
      if (!files || files.length === 0) {
        console.log(`${oldBucket} 存储桶为空，跳过`)
        continue
      }
      
      console.log(`找到 ${files.length} 个文件需要迁移`)
      
      // 迁移每个文件
      for (const file of files) {
        try {
          console.log(`迁移文件: ${file.name}`)
          
          // 下载文件
          const { data: fileData, error: downloadError } = await supabase.storage
            .from(oldBucket)
            .download(file.name)
          
          if (downloadError) {
            console.error(`下载文件 ${file.name} 失败:`, downloadError)
            continue
          }
          
          // 上传到新位置
          const newFilePath = `${newPath}/${file.name}`
          const { error: uploadError } = await supabase.storage
            .from('golf-club-images')
            .upload(newFilePath, fileData, {
              cacheControl: '3600',
              upsert: true
            })
          
          if (uploadError) {
            console.error(`上传文件 ${newFilePath} 失败:`, uploadError)
            continue
          }
          
          console.log(`✅ 迁移成功: ${file.name} -> ${newFilePath}`)
          
        } catch (error) {
          console.error(`迁移文件 ${file.name} 时出错:`, error)
        }
      }
      
    } catch (error) {
      console.error(`处理存储桶 ${oldBucket} 时出错:`, error)
    }
  }
  
  console.log('\n存储文件迁移完成！')
}

// 执行迁移
migrateStorageFiles().catch(console.error)
