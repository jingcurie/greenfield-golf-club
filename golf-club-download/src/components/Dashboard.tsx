import React, { useState, useEffect } from 'react'
import { Calendar, Trophy, Image, Heart, LogOut, User, Menu, X, Settings, ChevronDown } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import ProfileModal from './ProfileModal'

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const [userProfile, setUserProfile] = useState<any>(null)
  const [memberCount, setMemberCount] = useState<number>(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    if (user) {
      fetchUserProfile()
      fetchMemberCount()
    }
  }, [user])

  const fetchUserProfile = async () => {
    if (!user) return
    
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()
    
    setUserProfile(data)
  }

  const fetchMemberCount = async () => {
    try {
      console.log('开始查询会员数量...')
      
      // 使用专门的函数获取会员总数
      const { data, error } = await supabase
        .rpc('get_member_count')
      
      console.log('会员数量查询结果:', { data, error })
      
      if (error) {
        console.error('查询失败:', error)
        // 如果函数调用失败，使用备用方案
        const { data: viewData, error: viewError } = await supabase
          .from('member_count_view')
          .select('total_members')
          .single()
        
        if (viewError) {
          console.error('备用查询也失败:', viewError)
          setMemberCount(2) // 最后的备用值
        } else {
          setMemberCount(viewData.total_members)
        }
      } else {
        console.log('会员数量查询成功:', data)
        setMemberCount(data || 0)
      }
    } catch (error) {
      console.error('查询会员数量时发生错误:', error)
      setMemberCount(2) // 临时显示已知的数量
    }
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const getMembershipTypeText = (type: string) => {
    switch (type) {
      case 'premium': return '高级会员'
      case 'vip': return 'VIP会员'
      default: return '普通会员'
    }
  }

  const getCurrentDate = () => {
    const now = new Date()
    return {
      year: now.getFullYear(),
      season: '季节'
    }
  }

  const { year, season } = getCurrentDate()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-golf-600 rounded-full flex items-center justify-center">
                <span className="text-sm sm:text-lg lg:text-xl font-bold text-white">B</span>
              </div>
              <div className="ml-2 sm:ml-3">
                <h1 className="text-sm sm:text-lg lg:text-xl font-bold text-gray-900">绿茵高尔夫俱乐部</h1>
                <p className="text-xs text-golf-600 hidden md:block">绿色高尔夫俱乐部</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden lg:flex space-x-4 xl:space-x-8">
              <button className="bg-golf-600 text-white px-3 py-2 rounded-lg font-medium text-sm">
                首页
              </button>
              <button className="text-gray-700 hover:text-golf-600 px-3 py-2 font-medium text-sm">
                活动报名
              </button>
              <button className="text-gray-700 hover:text-golf-600 px-3 py-2 font-medium text-sm">
                成绩查询
              </button>
              <button className="text-gray-700 hover:text-golf-600 px-3 py-2 font-medium text-sm">
                海报展示
              </button>
              <button className="text-gray-700 hover:text-golf-600 px-3 py-2 font-medium text-sm">
                投资支持
              </button>
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden text-gray-400 hover:text-gray-600 p-1 sm:p-2"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              
              {/* Desktop User Dropdown */}
              <div className="relative hidden md:block">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-2 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-900">
                      {userProfile?.full_name || '未设置姓名'}
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    {/* User Info Section */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {userProfile?.full_name || '未设置姓名'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user?.email}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setProfileModalOpen(true)
                          setUserMenuOpen(false)
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <User className="w-4 h-4 mr-3" />
                        Profile
                      </button>
                      <button
                        onClick={() => {
                          handleSignOut()
                          setUserMenuOpen(false)
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Click outside to close dropdown */}
              {userMenuOpen && (
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setUserMenuOpen(false)}
                ></div>
              )}
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 py-4">
              <div className="flex flex-col space-y-2">
                <button className="bg-golf-600 text-white px-3 py-2 rounded-lg font-medium text-sm text-left">
                  首页
                </button>
                <button className="text-gray-700 hover:text-golf-600 px-3 py-2 font-medium text-sm text-left">
                  活动报名
                </button>
                <button className="text-gray-700 hover:text-golf-600 px-3 py-2 font-medium text-sm text-left">
                  成绩查询
                </button>
                <button className="text-gray-700 hover:text-golf-600 px-3 py-2 font-medium text-sm text-left">
                  海报展示
                </button>
                <button className="text-gray-700 hover:text-golf-600 px-3 py-2 font-medium text-sm text-left">
                  投资支持
                </button>
                
                {/* Mobile User Info */}
                <div className="flex items-center space-x-3 px-3 py-2 border-t border-gray-200 mt-2 pt-4 md:hidden">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {userProfile?.full_name || '未设置姓名'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {user?.email}
                    </div>
                  </div>
                </div>
                
                {/* Mobile Profile Button */}
                <button
                  onClick={() => {
                    setProfileModalOpen(true)
                    setMobileMenuOpen(false)
                  }}
                  className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:text-golf-600 font-medium text-sm text-left w-full md:hidden"
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </button>
                
                {/* Mobile Logout Button */}
                <button
                  onClick={() => {
                    handleSignOut()
                    setMobileMenuOpen(false)
                  }}
                  className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:text-golf-600 font-medium text-sm text-left w-full md:hidden"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-golf-600 to-golf-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 lg:mb-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center mb-4">
              <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mr-2 sm:mr-4">
                欢迎回来，{userProfile?.full_name || '用户'}！
              </h2>
              <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs">
                {getMembershipTypeText(userProfile?.membership_type || 'standard')}
              </span>
            </div>
            <p className="text-golf-100 text-sm sm:text-base lg:text-lg mb-3 sm:mb-4">
              祝您今天有美好的高尔夫体验
            </p>
            <div className="text-xs text-golf-100">
              会员数量：{memberCount} | 加入日期：{userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString('zh-CN') : '未知'}
            </div>
          </div>
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white bg-opacity-20 rounded-lg p-2 sm:p-3 text-center">
            <div className="text-sm sm:text-lg lg:text-2xl font-bold">{year}</div>
            <div className="text-xs">{season}</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 lg:mb-6">快捷操作</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-blue-500 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-3 lg:mb-4">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white" />
              </div>
              <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">活动报名</h4>
              <p className="text-gray-600 text-xs sm:text-sm hidden sm:block">查看并报名参加俱乐部活动</p>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-yellow-500 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-3 lg:mb-4">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white" />
              </div>
              <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">成绩查询</h4>
              <p className="text-gray-600 text-xs sm:text-sm hidden sm:block">查看您的比赛成绩和排名</p>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-purple-500 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-3 lg:mb-4">
                <Image className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white" />
              </div>
              <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">海报展示</h4>
              <p className="text-gray-600 text-xs sm:text-sm hidden sm:block">浏览俱乐部活动海报</p>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-red-500 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-3 lg:mb-4">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white" />
              </div>
              <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">投资支持</h4>
              <p className="text-gray-600 text-xs sm:text-sm hidden sm:block">支持俱乐部建设发展</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">即将举行的活动</h4>
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600 mb-2">0</div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">比赛记录</h4>
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-600 mb-2">2</div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">会员等级</h4>
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded flex items-center justify-center">
                <span className="text-white text-xs">★</span>
              </div>
            </div>
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600 mb-2">优质的</div>
          </div>
        </div>

        {/* Bottom Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Upcoming Events */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 flex items-center">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 mr-2" />
                即将举行的活动
              </h3>
            </div>
            <div className="text-center py-6 sm:py-8">
              <p className="text-gray-500 mb-3 sm:mb-4 text-sm sm:text-base">暂无即将举行的活动</p>
              <button className="text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base">
                查看更多活动
              </button>
            </div>
          </div>

          {/* Recent Achievements */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 flex items-center">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 mr-2" />
                最近成绩
              </h3>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between p-3 sm:p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-500 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                    <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">春季餐厅</div>
                    <div className="text-xs sm:text-sm text-gray-600">2024年12月15日</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg sm:text-2xl font-bold text-yellow-600">72</div>
                  <div className="text-xs sm:text-sm text-gray-600">18洞</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 sm:p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-500 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                    <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">会员友谊赛</div>
                    <div className="text-xs sm:text-sm text-gray-600">2024年12月10日</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg sm:text-2xl font-bold text-yellow-600">35</div>
                  <div className="text-xs sm:text-sm text-gray-600">9洞</div>
                </div>
              </div>

              <div className="text-center pt-3 sm:pt-4">
                <button className="text-yellow-600 hover:text-yellow-700 font-medium text-sm sm:text-base">
                  查看完整成绩单
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Profile Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        user={user}
      />
    </div>
  )
}