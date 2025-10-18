// 为测试用户创建活动报名记录
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
  { id: 'user1', name: '测试用户1', phone: '13800001001' },
  { id: 'user2', name: '测试用户2', phone: '13800001002' },
  { id: 'user3', name: '测试用户3', phone: '13800001003' },
  { id: 'user4', name: '测试用户4', phone: '13800001004' },
  { id: 'user5', name: '测试用户5', phone: '13800001005' },
  { id: 'user6', name: '测试用户6', phone: '13800001006' }
]

async function createTestRegistrations() {
  console.log('🎯 开始为测试用户创建活动报名记录...\n')

  try {
    // 首先获取真实的用户ID
    console.log('🔍 获取用户ID...')
    const userResponse = await fetch(`${supabaseUrl}/rest/v1/user_profiles?select=id,full_name,email`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    })

    if (!userResponse.ok) {
      console.error('❌ 无法获取用户数据:', userResponse.status)
      return
    }

    const users = await userResponse.json()
    console.log(`找到 ${users.length} 个用户:`)
    users.forEach(user => {
      console.log(`- ${user.full_name} (${user.email}) - ID: ${user.id}`)
    })

    if (users.length < 6) {
      console.log('⚠️  用户数量不足，需要先创建测试用户')
      return
    }

    // 为每个活动分配用户
    const registrations = []
    
    // 活动1: 春季高尔夫锦标赛 - 分配 user1, user2, user3
    if (users[0]) {
      registrations.push({
        event_id: events[0].id,
        user_id: users[0].id,
        participant_name: users[0].full_name,
        member_number: 'M001',
        phone: '13800001001',
        payment_status: 'paid',
        notes: '测试报名记录'
      })
    }
    if (users[1]) {
      registrations.push({
        event_id: events[0].id,
        user_id: users[1].id,
        participant_name: users[1].full_name,
        member_number: 'M002',
        phone: '13800001002',
        payment_status: 'paid',
        notes: '测试报名记录'
      })
    }
    if (users[2]) {
      registrations.push({
        event_id: events[0].id,
        user_id: users[2].id,
        participant_name: users[2].full_name,
        member_number: 'M003',
        phone: '13800001003',
        payment_status: 'paid',
        notes: '测试报名记录'
      })
    }

    // 活动2: 会员友谊赛 - 分配 user2, user3, user4
    if (users[1]) {
      registrations.push({
        event_id: events[1].id,
        user_id: users[1].id,
        participant_name: users[1].full_name,
        member_number: 'M002',
        phone: '13800001002',
        payment_status: 'paid',
        notes: '测试报名记录'
      })
    }
    if (users[2]) {
      registrations.push({
        event_id: events[1].id,
        user_id: users[2].id,
        participant_name: users[2].full_name,
        member_number: 'M003',
        phone: '13800001003',
        payment_status: 'paid',
        notes: '测试报名记录'
      })
    }
    if (users[3]) {
      registrations.push({
        event_id: events[1].id,
        user_id: users[3].id,
        participant_name: users[3].full_name,
        member_number: 'M004',
        phone: '13800001004',
        payment_status: 'paid',
        notes: '测试报名记录'
      })
    }

    // 活动3: VIP会员专场 - 分配 user3, user4, user5
    if (users[2]) {
      registrations.push({
        event_id: events[2].id,
        user_id: users[2].id,
        participant_name: users[2].full_name,
        member_number: 'M003',
        phone: '13800001003',
        payment_status: 'paid',
        notes: '测试报名记录'
      })
    }
    if (users[3]) {
      registrations.push({
        event_id: events[2].id,
        user_id: users[3].id,
        participant_name: users[3].full_name,
        member_number: 'M004',
        phone: '13800001004',
        payment_status: 'paid',
        notes: '测试报名记录'
      })
    }
    if (users[4]) {
      registrations.push({
        event_id: events[2].id,
        user_id: users[4].id,
        participant_name: users[4].full_name,
        member_number: 'M005',
        phone: '13800001005',
        payment_status: 'paid',
        notes: '测试报名记录'
      })
    }

    // 活动4: 活动哦 - 分配 user4, user5, user6
    if (users[3]) {
      registrations.push({
        event_id: events[3].id,
        user_id: users[3].id,
        participant_name: users[3].full_name,
        member_number: 'M004',
        phone: '13800001004',
        payment_status: 'paid',
        notes: '测试报名记录'
      })
    }
    if (users[4]) {
      registrations.push({
        event_id: events[3].id,
        user_id: users[4].id,
        participant_name: users[4].full_name,
        member_number: 'M005',
        phone: '13800001005',
        payment_status: 'paid',
        notes: '测试报名记录'
      })
    }
    if (users[5]) {
      registrations.push({
        event_id: events[3].id,
        user_id: users[5].id,
        participant_name: users[5].full_name,
        member_number: 'M006',
        phone: '13800001006',
        payment_status: 'paid',
        notes: '测试报名记录'
      })
    }

    console.log(`\n📝 准备创建 ${registrations.length} 个报名记录...`)

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
      console.log('活动1 (春季高尔夫锦标赛): user1, user2, user3')
      console.log('活动2 (会员友谊赛): user2, user3, user4')
      console.log('活动3 (VIP会员专场): user3, user4, user5')
      console.log('活动4 (活动哦): user4, user5, user6')
    } else {
      const errorText = await response.text()
      console.error('❌ 创建报名记录失败:', response.status, errorText)
    }

  } catch (error) {
    console.error('❌ 创建报名记录时出错:', error.message)
  }
}

createTestRegistrations()