// 检查现有活动
const supabaseUrl = 'https://mypglmtsgfgojtnpmkbc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15cGdsbXRzZ2Znb2p0bnBta2JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MTY4NjYsImV4cCI6MjA3MzA5Mjg2Nn0.p3FfvTgzUundtr7WkH6uIlhgkmAs1qPc_V7m2iGoTcU'

async function checkEvents() {
  console.log('🔍 检查现有活动...\n')

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/events?select=*`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    })

    if (!response.ok) {
      console.error('❌ 无法访问活动数据:', response.status, response.statusText)
      return
    }

    const events = await response.json()
    console.log('📅 现有活动:')
    
    if (events && events.length > 0) {
      console.log(`找到 ${events.length} 个活动:`)
      events.forEach((event, index) => {
        console.log(`${index + 1}. ${event.title} (ID: ${event.id})`)
        console.log(`   时间: ${event.start_time}`)
        console.log(`   地点: ${event.location}`)
        console.log(`   状态: ${event.status}`)
        console.log('')
      })
    } else {
      console.log('  (无活动数据)')
    }

    return events

  } catch (error) {
    console.error('❌ 检查活动时出错:', error.message)
    return []
  }
}

checkEvents()