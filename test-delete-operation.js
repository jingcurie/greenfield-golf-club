// 测试删除操作的脚本
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://mypglmtsgfgojtnpmkbc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15cGdsbXRzZ2Znb2p0bnBta2JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0NzQ4MDAsImV4cCI6MjA1MDA1MDgwMH0.8Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDeleteOperation() {
  try {
    console.log('开始测试删除操作...')
    
    // 1. 先查看当前用户的报名记录
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.log('用户未登录')
      return
    }
    
    console.log('当前用户ID:', user.id)
    
    // 2. 查询用户的报名记录
    const { data: registrations, error: fetchError } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('user_id', user.id)
    
    if (fetchError) {
      console.error('查询报名记录失败:', fetchError)
      return
    }
    
    console.log('找到报名记录:', registrations)
    
    if (registrations && registrations.length > 0) {
      const registration = registrations[0]
      console.log('准备删除记录ID:', registration.id)
      
      // 3. 尝试删除记录
      const { data: deleteData, error: deleteError, count } = await supabase
        .from('event_registrations')
        .delete()
        .eq('id', registration.id)
        .select()
      
      console.log('删除结果:')
      console.log('- 数据:', deleteData)
      console.log('- 错误:', deleteError)
      console.log('- 计数:', count)
      
      if (deleteError) {
        console.error('删除失败:', deleteError)
      } else {
        console.log('删除成功')
      }
    } else {
      console.log('没有找到报名记录')
    }
    
  } catch (error) {
    console.error('测试过程中出错:', error)
  }
}

// 运行测试
testDeleteOperation()
