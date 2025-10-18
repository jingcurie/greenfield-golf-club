import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function setupStorage() {
  console.log('开始设置存储桶...\n')

  try {
    // 1. 创建 poster-images 存储桶
    console.log('1. 创建 poster-images 存储桶...')
    const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('poster-images', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    })

    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        console.log('✓ poster-images 存储桶已存在')
      } else {
        console.error('❌ 创建存储桶失败:', bucketError.message)
        return
      }
    } else {
      console.log('✓ poster-images 存储桶创建成功')
    }

    // 2. 设置存储桶策略
    console.log('\n2. 设置存储桶访问策略...')
    
    // 检查是否已有策略
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'objects')
      .eq('schemaname', 'storage')

    if (policiesError) {
      console.log('无法检查现有策略，继续设置...')
    }

    // 3. 创建存储桶策略（通过 SQL）
    console.log('3. 设置存储桶安全策略...')
    
    const policies = [
      // 允许所有人查看图片
      `CREATE POLICY IF NOT EXISTS "Public can view poster images"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'poster-images')`,
      
      // 允许认证用户上传图片
      `CREATE POLICY IF NOT EXISTS "Authenticated users can upload poster images"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (bucket_id = 'poster-images')`,
      
      // 允许认证用户更新图片
      `CREATE POLICY IF NOT EXISTS "Authenticated users can update poster images"
        ON storage.objects FOR UPDATE
        TO authenticated
        USING (bucket_id = 'poster-images')`,
      
      // 允许认证用户删除图片
      `CREATE POLICY IF NOT EXISTS "Authenticated users can delete poster images"
        ON storage.objects FOR DELETE
        TO authenticated
        USING (bucket_id = 'poster-images')`
    ]

    for (const policy of policies) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: policy })
        if (error) {
          console.log(`策略可能已存在: ${error.message}`)
        } else {
          console.log('✓ 策略设置成功')
        }
      } catch (err) {
        console.log(`策略设置跳过: ${err.message}`)
      }
    }

    console.log('\n✅ 存储桶设置完成！')
    console.log('现在可以正常上传海报图片了。')

  } catch (error) {
    console.error('❌ 设置存储桶时出错:', error.message)
  }
}

setupStorage()