// 检查认证用户
const supabaseUrl = 'https://mypglmtsgfgojtnpmkbc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15cGdsbXRzZ2Znb2p0bnBta2JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MTY4NjYsImV4cCI6MjA3MzA5Mjg2Nn0.p3FfvTgzUundtr7WkH6uIlhgkmAs1qPc_V7m2iGoTcU'

async function checkAuthUsers() {
  console.log('🔍 检查认证用户...\n')

  try {
    // 检查认证用户（这个可能需要不同的权限）
    const response = await fetch(`${supabaseUrl}/rest/v1/auth/users`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    })

    console.log('响应状态:', response.status)
    
    if (response.ok) {
      const users = await response.json()
      console.log('认证用户:', users)
    } else {
      const errorText = await response.text()
      console.log('无法直接访问认证用户:', errorText)
      console.log('\n建议通过 Supabase 仪表板查看：')
      console.log('1. 访问 https://supabase.com/dashboard')
      console.log('2. 选择项目: mypglmtsgfgojtnpmkbc')
      console.log('3. 点击左侧 "Authentication" 菜单')
      console.log('4. 点击 "Users" 标签查看用户')
    }

  } catch (error) {
    console.error('❌ 检查认证用户时出错:', error.message)
  }
}

checkAuthUsers()