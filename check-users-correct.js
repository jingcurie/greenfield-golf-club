// 检查正确的数据库中的用户
const supabaseUrl = 'https://mypglmtsgfgojtnpmkbc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15cGdsbXRzZ2Znb2p0bnBta2JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MTY4NjYsImV4cCI6MjA3MzA5Mjg2Nn0.p3FfvTgzUundtr7WkH6uIlhgkmAs1qPc_V7m2iGoTcU'

async function checkUsers() {
  console.log('🔍 检查数据库中的用户...\n')

  try {
    // 检查用户资料表
    const response = await fetch(`${supabaseUrl}/rest/v1/user_profiles?select=*`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    })

    if (!response.ok) {
      console.error('❌ 无法访问用户数据:', response.status, response.statusText)
      const errorText = await response.text()
      console.error('错误详情:', errorText)
      return
    }

    const users = await response.json()
    console.log('👥 数据库中的用户:')
    
    if (users && users.length > 0) {
      console.log(`找到 ${users.length} 个用户:`)
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.full_name || '未命名'} (${user.email || '无邮箱'}) - 电话: ${user.phone || '无'}`)
      })
    } else {
      console.log('  (无用户数据)')
    }

  } catch (error) {
    console.error('❌ 检查用户时出错:', error.message)
  }
}

checkUsers()