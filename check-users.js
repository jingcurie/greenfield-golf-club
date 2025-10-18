import { createClient } from '@supabase/supabase-js'

// 从环境变量读取配置
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('请确保在.env文件中设置了VITE_SUPABASE_URL和SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function checkUsers() {
  try {
    console.log('正在检查用户数据...')
    
    // 检查auth.users表中的用户数量
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('获取auth.users失败:', authError)
      return
    }
    
    console.log(`\n📊 认证用户数量: ${authUsers.users.length}`)
    
    if (authUsers.users.length > 0) {
      console.log('\n👥 用户列表:')
      authUsers.users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} (ID: ${user.id})`)
        console.log(`   创建时间: ${new Date(user.created_at).toLocaleString('zh-CN')}`)
        console.log(`   最后登录: ${user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('zh-CN') : '从未登录'}`)
        console.log('')
      })
    }
    
    // 检查user_profiles表中的用户数量
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
    
    if (profilesError) {
      console.error('获取user_profiles失败:', profilesError)
    } else {
      console.log(`\n📋 用户档案数量: ${profiles.length}`)
      
      if (profiles.length > 0) {
        console.log('\n📝 用户档案列表:')
        profiles.forEach((profile, index) => {
          console.log(`${index + 1}. ${profile.full_name || '未设置姓名'} (${profile.role})`)
          console.log(`   会员类型: ${profile.membership_type || '未设置'}`)
          console.log(`   电话: ${profile.phone || '未设置'}`)
          console.log('')
        })
      }
    }
    
    // 检查是否有用户没有对应的档案
    const authUserIds = authUsers.users.map(u => u.id)
    const profileUserIds = profiles.map(p => p.id)
    const missingProfiles = authUserIds.filter(id => !profileUserIds.includes(id))
    
    if (missingProfiles.length > 0) {
      console.log(`\n⚠️  有 ${missingProfiles.length} 个认证用户没有对应的用户档案:`)
      missingProfiles.forEach(id => {
        const user = authUsers.users.find(u => u.id === id)
        console.log(`   - ${user?.email} (${id})`)
      })
    }
    
  } catch (error) {
    console.error('检查用户数据失败:', error)
  }
}

checkUsers()