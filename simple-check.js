// 简单的存储桶检查脚本
const supabaseUrl = 'https://mypglmtsgfgojtnpmkbc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15cGdsbXRzZ2Znb2p0bnBta2JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MTY4NjYsImV4cCI6MjA3MzA5Mjg2Nn0.p3FfvTgzUundtr7WkH6uIlhgkmAs1qPc_V7m2iGoTcU'

async function checkStorage() {
  console.log('🔍 检查 Supabase 存储桶状态...\n')

  try {
    // 使用 fetch API 检查存储桶
    const response = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    })

    if (!response.ok) {
      console.error('❌ 无法访问存储桶 API:', response.status, response.statusText)
      const errorText = await response.text()
      console.error('错误详情:', errorText)
      return
    }

    const buckets = await response.json()
    console.log('📦 现有存储桶:')
    
    if (buckets && buckets.length > 0) {
      buckets.forEach(bucket => {
        console.log(`  - ${bucket.id} (${bucket.name}) - 公开: ${bucket.public ? '是' : '否'}`)
      })
      
      // 检查是否有 poster-images 存储桶
      const posterBucket = buckets.find(b => b.id === 'poster-images')
      if (posterBucket) {
        console.log('\n✅ poster-images 存储桶存在')
        console.log(`   - 公开: ${posterBucket.public ? '是' : '否'}`)
        console.log(`   - 文件大小限制: ${posterBucket.file_size_limit || '无限制'}`)
      } else {
        console.log('\n❌ poster-images 存储桶不存在')
        console.log('\n🔧 需要创建存储桶，请按照以下步骤操作：')
        console.log('1. 访问 https://supabase.com/dashboard')
        console.log('2. 选择您的项目')
        console.log('3. 点击左侧 "Storage" 菜单')
        console.log('4. 点击 "New bucket" 按钮')
        console.log('5. 填写信息：')
        console.log('   - Name: poster-images')
        console.log('   - Public bucket: ✅ 勾选')
        console.log('   - File size limit: 5 MB')
        console.log('   - Allowed MIME types: image/jpeg,image/png,image/gif,image/webp')
      }
    } else {
      console.log('  (无存储桶)')
      console.log('\n🔧 需要创建存储桶')
    }

  } catch (error) {
    console.error('❌ 检查过程中出错:', error.message)
    console.log('\n🔧 可能的解决方案：')
    console.log('1. 检查网络连接')
    console.log('2. 确认 Supabase 项目状态')
    console.log('3. 手动在 Supabase 仪表板中创建存储桶')
  }
}

checkStorage()