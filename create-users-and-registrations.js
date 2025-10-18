// 创建测试用户并分配活动报名
const supabaseUrl = 'https://mypglmtsgfgojtnpmkbc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15cGdsbXRzZ2Znb2p0bnBta2JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MTY4NjYsImV4cCI6MjA3MzA5Mjg2Nn0.p3FfvTgzUundtr7WkH6uIlhgkmAs1qPc_V7m2iGoTcU'

// 活动数据
const events = [
  { id: 'cb3f79e4-5d9d-4c86-ac4f-dd66e59e8a67', title: '春季高尔夫锦标赛' },
  { id: '60d5fd31-6485-4c67-8e73-168623184e2d', title: '会员友谊赛' },
  { id: '321245e7-41d6-4f19-90d3-ede80b5c72b3', title: 'VIP会员专场' },
  { id: '0e57ecff-e39e-46d2-b113-748f8ed5f097', title: '活动哦' }
]

// 测试用户数据
const testUsers = [
  { email: 'user1@test.com', name: '测试用户1', phone: '13800001001' },
  { email: 'user2@test.com', name: '测试用户2', phone: '13800001002' },
  { email: 'user3@test.com', name: '测试用户3', phone: '13800001003' },
  { email: 'user4@test.com', name: '测试用户4', phone: '13800001004' },
  { email: 'user5@test.com', name: '测试用户5', phone: '13800001005' },
  { email: 'user6@test.com', name: '测试用户6', phone: '13800001006' }
]

async function createUsersAndRegistrations() {
  console.log('🎯 开始创建测试用户和活动报名...\n')

  try {
    // 首先检查现有用户
    console.log('🔍 检查现有用户...')
    const userResponse = await fetch(`${supabaseUrl}/rest/v1/user_profiles?select=*`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    })

    let existingUsers = []
    if (userResponse.ok) {
      existingUsers = await userResponse.json()
      console.log(`找到 ${existingUsers.length} 个现有用户`)
    } else {
      console.log('⚠️  无法获取现有用户，将创建新用户')
    }

    // 如果用户不足6个，创建新用户
    if (existingUsers.length < 6) {
      console.log('📝 创建测试用户...')
      
      for (let i = 0; i < testUsers.length; i++) {
        const user = testUsers[i]
        
        try {
          // 创建用户资料（假设用户已存在）
          const profileResponse = await fetch(`${supabaseUrl}/rest/v1/user_profiles`, {
            method: 'POST',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              id: `test-user-${i + 1}-${Date.now()}`, // 生成唯一ID
              full_name: user.name,
              email: user.email,
              phone: user.phone,
              membership_type: 'standard',
              role: 'member'
            })
          })

          if (profileResponse.ok) {
            console.log(`✅ 创建用户资料: ${user.name}`)
          } else {
            console.log(`⚠️  用户资料可能已存在: ${user.name}`)
          }
        } catch (error) {
          console.log(`⚠️  创建用户 ${user.name} 时出错:`, error.message)
        }
      }
    }

    // 重新获取用户列表
    console.log('\n🔍 重新获取用户列表...')
    const finalUserResponse = await fetch(`${supabaseUrl}/rest/v1/user_profiles?select=*&limit=10`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    })

    if (!finalUserResponse.ok) {
      console.error('❌ 无法获取最终用户列表')
      return
    }

    const finalUsers = await finalUserResponse.json()
    console.log(`最终用户数量: ${finalUsers.length}`)

    if (finalUsers.length < 3) {
      console.log('❌ 用户数量不足，无法创建报名记录')
      return
    }

    // 创建报名记录
    console.log('\n📝 创建活动报名记录...')
    
    const registrations = []
    
    // 为每个活动分配至少3个用户
    events.forEach((event, eventIndex) => {
      console.log(`\n为活动 "${event.title}" 创建报名记录:`)
      
      // 每个活动分配3个用户
      for (let i = 0; i < 3; i++) {
        const userIndex = (eventIndex * 3 + i) % finalUsers.length
        const user = finalUsers[userIndex]
        
        const registration = {
          event_id: event.id,
          user_id: user.id,
          participant_name: user.full_name,
          member_number: `M${String(i + 1).padStart(3, '0')}`,
          phone: user.phone || `1380000${String(i + 1).padStart(4, '0')}`,
          payment_status: 'paid',
          notes: `测试报名记录 - ${event.title}`
        }
        
        registrations.push(registration)
        console.log(`  - ${user.full_name} (${user.email})`)
      }
    })

    console.log(`\n📊 准备创建 ${registrations.length} 个报名记录...`)

    // 批量创建报名记录
    const response = await fetch(`${supabaseUrl}/rest/v1/event_registrations`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(registrations)
    })

    if (response.ok) {
      console.log('✅ 报名记录创建成功！')
      console.log('\n📊 报名分配情况:')
      events.forEach((event, index) => {
        console.log(`活动${index + 1} (${event.title}): 已分配3个用户`)
      })
    } else {
      const errorText = await response.text()
      console.error('❌ 创建报名记录失败:', response.status, errorText)
    }

  } catch (error) {
    console.error('❌ 创建用户和报名记录时出错:', error.message)
  }
}

createUsersAndRegistrations()