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

async function createTestUsers() {
  console.log('开始创建测试用户...\n')

  for (let i = 1; i <= 10; i++) {
    const email = `user${i}@test.com`
    const password = '88888888'
    const fullName = `测试用户${i}`

    try {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName
        }
      })

      if (authError) {
        console.error(`❌ 创建用户 ${email} 失败:`, authError.message)
        continue
      }

      const userId = authData.user.id
      console.log(`✓ 成功创建用户: ${email} (ID: ${userId})`)

      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert([{
          id: userId,
          full_name: fullName,
          email: email,
          phone: `1380000${i.toString().padStart(4, '0')}`,
          membership_type: 'standard',
          role: 'member'
        }])

      if (profileError) {
        console.error(`  ⚠️  创建用户资料失败:`, profileError.message)
      } else {
        console.log(`  ✓ 用户资料已创建\n`)
      }

    } catch (error) {
      console.error(`❌ 创建用户 ${email} 时发生错误:`, error.message)
    }
  }

  console.log('\n所有测试用户创建完成！')
  console.log('用户名: user1@test.com 到 user10@test.com')
  console.log('密码: 88888888')
}

createTestUsers()
