import { createClient } from '@supabase/supabase-js'

// 使用您的 Supabase 配置
const supabaseUrl = 'https://ajvhylnsfizvjkfsmxwi.supabase.co'
const supabaseServiceKey = 'YOUR_SERVICE_ROLE_KEY' // 您需要替换为实际的服务角色密钥

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createTestUsers() {
  console.log('开始创建10个测试用户...\n')

  const users = []
  
  for (let i = 1; i <= 10; i++) {
    const email = `user${i}@test.com`
    const password = '88888888'
    const fullName = `测试用户${i}`
    const phone = `1380000${i.toString().padStart(4, '0')}`
    
    try {
      console.log(`正在创建用户 ${i}/10: ${email}`)
      
      // 使用 admin API 创建用户
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true, // 跳过邮箱验证
        user_metadata: {
          full_name: fullName
        }
      })
      
      if (authError) {
        console.error(`❌ 创建用户 ${email} 失败:`, authError.message)
        continue
      }
      
      const userId = authData.user.id
      console.log(`✅ 用户 ${email} 创建成功 (ID: ${userId})`)
      
      // 创建用户资料
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          full_name: fullName,
          email: email,
          phone: phone,
          membership_type: 'standard',
          role: 'member'
        })
      
      if (profileError) {
        console.error(`  ⚠️  创建用户资料失败:`, profileError.message)
      } else {
        console.log(`  ✅ 用户资料创建成功: ${fullName}`)
      }
      
      users.push({
        email,
        password,
        fullName,
        phone,
        userId
      })
      
      // 添加延迟避免请求过快
      await new Promise(resolve => setTimeout(resolve, 1000))
      
    } catch (error) {
      console.error(`❌ 创建用户 ${email} 时出错:`, error.message)
    }
  }
  
  console.log('\n=== 创建完成 ===')
  console.log(`成功创建 ${users.length} 个测试用户:`)
  
  users.forEach((user, index) => {
    console.log(`${index + 1}. 邮箱: ${user.email}, 密码: ${user.password}, 姓名: ${user.fullName}, 电话: ${user.phone}`)
  })
  
  console.log('\n测试用户登录信息:')
  console.log('用户名: user1@test.com 到 user10@test.com')
  console.log('密码: 88888888')
}

createTestUsers().catch(console.error)