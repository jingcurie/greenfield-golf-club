import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

const testEmail = `test${Date.now()}@test.com`
const testName = '测试姓名'
const testPhone = '13800138000'

console.log('Testing signup with metadata...')
console.log('Email:', testEmail)
console.log('Name:', testName)
console.log('Phone:', testPhone)

const { data, error } = await supabase.auth.signUp({
  email: testEmail,
  password: 'Test123456!',
  options: {
    data: {
      full_name: testName,
      phone: testPhone
    }
  }
})

if (error) {
  console.error('Error:', error)
} else {
  console.log('Success!')
  console.log('User ID:', data.user?.id)
  console.log('Metadata:', data.user?.user_metadata)

  // 等待一秒后查询 user_profiles
  setTimeout(async () => {
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (profileError) {
      console.error('Profile error:', profileError)
    } else {
      console.log('Profile:', profile)
    }

    process.exit(0)
  }, 1000)
}
