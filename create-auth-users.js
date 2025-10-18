// 使用 Supabase Admin API 创建认证用户
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少环境变量')
  console.log('请确保 .env 文件中有：')
  console.log('VITE_SUPABASE_URL=你的项目URL')
  console.log('SUPABASE_SERVICE_ROLE_KEY=你的服务角色密钥')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createTestUsers() {
  console.log('🎯 开始创建测试用户...\n')

  const testUsers = [
    { email: 'user1@test.com', password: '88888888', name: '测试用户1', phone: '13800001001' },
    { email: 'user2@test.com', password: '88888888', name: '测试用户2', phone: '13800001002' },
    { email: 'user3@test.com', password: '88888888', name: '测试用户3', phone: '13800001003' },
    { email: 'user4@test.com', password: '88888888', name: '测试用户4', phone: '13800001004' },
    { email: 'user5@test.com', password: '88888888', name: '测试用户5', phone: '13800001005' },
    { email: 'user6@test.com', password: '88888888', name: '测试用户6', phone: '13800001006' }
  ]

  const createdUsers = []

  for (const user of testUsers) {
    try {
      console.log(`📝 创建用户: ${user.email}`)
      
      // 创建认证用户
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          full_name: user.name
        }
      })

      if (authError) {
        console.error(`❌ 创建认证用户失败: ${user.email}`, authError.message)
        continue
      }

      console.log(`✅ 认证用户创建成功: ${user.email} (ID: ${authData.user.id})`)

      // 创建用户资料
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          full_name: user.name,
          phone: user.phone,
          membership_type: 'standard',
          role: 'member'
        })

      if (profileError) {
        console.error(`❌ 创建用户资料失败: ${user.email}`, profileError.message)
      } else {
        console.log(`✅ 用户资料创建成功: ${user.name}`)
        createdUsers.push({
          id: authData.user.id,
          email: user.email,
          name: user.name,
          phone: user.phone
        })
      }

    } catch (error) {
      console.error(`❌ 创建用户 ${user.email} 时出错:`, error.message)
    }
  }

  console.log(`\n🎉 完成！成功创建 ${createdUsers.length} 个用户`)
  console.log('\n📋 创建的用户:')
  createdUsers.forEach((user, index) => {
    console.log(`${index + 1}. ${user.name} (${user.email}) - ID: ${user.id}`)
  })

  return createdUsers
}

createTestUsers()