// 创建测试用户的简单版本（不依赖外部包）
const supabaseUrl = 'https://mypglmtsgfgojtnpmkbc.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15cGdsbXRzZ2Znb2p0bnBta2JjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzUxNjg2NiwiZXhwIjoyMDczMDkyODY2fQ.YOUR_SERVICE_ROLE_KEY'

async function createTestUsers() {
  console.log('🎯 开始创建测试用户...\n')

  const testUsers = [
    { email: 'user1@test.com', password: '88888888', name: '测试用户1', phone: '13800001001' },
    { email: 'user2@test.com', password: '88888888', name: '测试用户2', phone: '13800001002' },
    { email: 'user3@test.com', password: '88888888', name: '测试用户3', phone: '13800001003' },
    { email: 'user4@test.com', password: '88888888', name: '测试用户4', phone: '13800001004' },
    { email: 'user5@test.com', password: '88888888', name: '测试用户5', phone: '13800001005' },
    { email: 'user6@test.com', password: '88888888', name: '测试用户6', phone: '13800001006' }
  ]

  console.log('⚠️  由于需要服务角色密钥，建议手动创建用户：')
  console.log('\n📋 请按照以下步骤操作：')
  console.log('\n1. 在 Supabase 仪表板中：')
  console.log('   - 点击左侧 "Authentication" 菜单')
  console.log('   - 点击 "Users" 标签')
  console.log('   - 点击 "Add user" 按钮')
  console.log('\n2. 为每个用户创建：')
  
  testUsers.forEach((user, index) => {
    console.log(`\n用户 ${index + 1}:`)
    console.log(`  邮箱: ${user.email}`)
    console.log(`  密码: ${user.password}`)
    console.log(`  姓名: ${user.name}`)
    console.log(`  电话: ${user.phone}`)
  })

  console.log('\n3. 创建完用户后，运行以下SQL创建用户资料：')
  console.log('\n-- 创建用户资料（需要先获取真实的用户ID）')
  console.log('INSERT INTO user_profiles (id, full_name, phone, membership_type, role) VALUES')
  console.log('(用户1的真实ID, \'测试用户1\', \'13800001001\', \'standard\', \'member\'),')
  console.log('(用户2的真实ID, \'测试用户2\', \'13800001002\', \'standard\', \'member\'),')
  console.log('(用户3的真实ID, \'测试用户3\', \'13800001003\', \'standard\', \'member\'),')
  console.log('(用户4的真实ID, \'测试用户4\', \'13800001004\', \'standard\', \'member\'),')
  console.log('(用户5的真实ID, \'测试用户5\', \'13800001005\', \'standard\', \'member\'),')
  console.log('(用户6的真实ID, \'测试用户6\', \'13800001006\', \'standard\', \'member\');')
}

createTestUsers()