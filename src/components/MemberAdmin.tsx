import React, { useState, useEffect } from 'react'
import {
  Users, Search, Filter, Edit, Trash2, Download, Mail, Phone, Calendar,
  User, Crown, Star, CheckCircle, XCircle, UserCog, ToggleLeft, ToggleRight
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import UnifiedSearch from './UnifiedSearch'

interface Member {
  id: string
  full_name: string
  real_name?: string
  phone: string
  email: string
  membership_type: 'standard' | 'premium' | 'vip'
  role?: string
  avatar_url?: string
  handicap?: number
  clothing_size?: string
  vancouver_residence?: string
  domestic_residence?: string
  main_club_membership?: string
  industry?: string
  golf_preferences?: string
  golf_motto?: string
  other_interests?: string
  created_at: string
  last_sign_in_at?: string
  email_confirmed_at?: string
  is_active: boolean
}


export default function MemberAdmin() {
  const [members, setMembers] = useState<Member[]>([])
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  
  // 搜索和筛选状态
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [selectedYear, setSelectedYear] = useState<string>('all')
  const [selectedMonth, setSelectedMonth] = useState<string>('all')
  const [showInactive, setShowInactive] = useState(true)

  // 获取可用年份
  const availableYears = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

  useEffect(() => {
    fetchMembers()
  }, [])

  useEffect(() => {
    filterMembers()
  }, [members, searchTerm, selectedRole, selectedYear, selectedMonth, showInactive])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      
      if (!supabase) return
      
      console.log('🔍 开始获取会员数据...')
      
      // 获取所有会员信息（包含邮箱和最后登录时间）
      const response = await supabase
        .from('user_profiles')
        .select(`
          id,
          full_name,
          real_name,
          phone,
          email,
          membership_type,
          role,
          avatar_url,
          handicap,
          clothing_size,
          vancouver_residence,
          domestic_residence,
          main_club_membership,
          industry,
          golf_preferences,
          golf_motto,
          other_interests,
          created_at,
          last_sign_in_at,
          is_active
        `)
        .order('created_at', { ascending: false })

      console.log('📊 查询结果:', response)
      
      if (response.error) {
        console.error('❌ 查询错误:', response.error)
        throw response.error
      }

      console.log('✅ 获取到的会员数据:', response.data?.length, '条记录')
      console.log('📋 会员详情:', response.data)

      // 处理会员数据
      const membersWithStatus = response.data?.map((member: any) => ({
        ...member,
        is_active: !!member.last_sign_in_at
      })) || []

      console.log('🎯 处理后的会员数据:', membersWithStatus.length, '条记录')
      setMembers(membersWithStatus)
    } catch (error) {
      console.error('获取会员信息失败:', error)
      alert('获取会员信息失败: ' + (error as any)?.message || '未知错误')
    } finally {
      setLoading(false)
    }
  }


  const filterMembers = () => {
    let filtered = [...members]
    
    console.log('🔍 开始筛选会员数据...')
    console.log('📊 原始会员数据:', members.length, '条')
    console.log('🎯 筛选条件:', {
      searchTerm,
      selectedRole,
      selectedYear,
      selectedMonth,
      showInactive
    })

    // 搜索过滤
    if (searchTerm) {
      const beforeSearch = filtered.length
      filtered = filtered.filter(member =>
        member.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.real_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phone?.includes(searchTerm) ||
        member.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      console.log('🔍 搜索过滤:', beforeSearch, '->', filtered.length)
    }

    // 角色过滤
    if (selectedRole !== 'all') {
      const beforeRole = filtered.length
      filtered = filtered.filter(member => member.role === selectedRole)
      console.log('👥 角色过滤:', beforeRole, '->', filtered.length)
    }

    // 年份过滤
    if (selectedYear !== 'all') {
      const beforeYear = filtered.length
      filtered = filtered.filter(member => 
        new Date(member.created_at).getFullYear() === parseInt(selectedYear)
      )
      console.log('📅 年份过滤:', beforeYear, '->', filtered.length)
    }

    // 月份过滤
    if (selectedMonth !== 'all') {
      const beforeMonth = filtered.length
      filtered = filtered.filter(member => 
        new Date(member.created_at).getMonth() === parseInt(selectedMonth) - 1
      )
      console.log('📆 月份过滤:', beforeMonth, '->', filtered.length)
    }

    // 活跃状态过滤
    if (!showInactive) {
      const beforeActive = filtered.length
      const activeMembers = filtered.filter(member => member.is_active)
      const inactiveMembers = filtered.filter(member => !member.is_active)
      console.log('⚡ 活跃状态过滤前:', beforeActive, '条 (活跃:', activeMembers.length, ', 非活跃:', inactiveMembers.length, ')')
      filtered = activeMembers
      console.log('⚡ 活跃状态过滤后:', filtered.length, '条')
    } else {
      console.log('⚡ 显示所有会员 (包括非活跃)')
    }

    console.log('✅ 最终筛选结果:', filtered.length, '条')
    setFilteredMembers(filtered)
  }

  const handleToggleMemberStatus = async (memberId: string, currentStatus: boolean) => {
    try {
      if (!supabase) return
      
      const newStatus = !currentStatus
      
      // 更新 user_profiles 表的 is_active 状态
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ is_active: newStatus })
        .eq('id', memberId)

      if (profileError) throw profileError

      // 通过 RPC 调用更新 auth.users 表的 banned_until 状态
      const { error: authError } = await supabase.rpc('update_user_auth_status', {
        user_id: memberId,
        is_banned: !newStatus
      })

      if (authError) {
        console.warn('更新认证状态失败，但用户资料已更新:', authError)
        // 即使认证状态更新失败，用户资料状态已更新，继续执行
      }

      // 更新本地状态
      setMembers(members.map(m => 
        m.id === memberId ? { ...m, is_active: newStatus } : m
      ))

      const statusText = newStatus ? '启用' : '禁用'
      alert(`会员已${statusText}！${!newStatus ? '该用户将无法登录系统。' : ''}`)
    } catch (error) {
      console.error('更新会员状态失败:', error)
      alert('更新失败，请重试')
    }
  }

  const exportToCSV = () => {
    const headers = ['姓名', '真实姓名', '手机号', '邮箱', '会员类型', '角色', '注册时间', '最后登录', '状态']
    const csvContent = [
      headers.join(','),
      ...filteredMembers.map(member => [
        member.full_name || '',
        member.real_name || '',
        member.phone || '',
        member.email || '',
        member.membership_type,
        member.role || '',
        new Date(member.created_at).toLocaleDateString(),
        member.last_sign_in_at ? new Date(member.last_sign_in_at).toLocaleDateString() : '从未登录',
        member.is_active ? '活跃' : '非活跃'
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `会员列表_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const getMembershipTypeIcon = (type: string) => {
    switch (type) {
      case 'vip': return <Crown className="w-4 h-4 text-yellow-500" />
      case 'premium': return <Star className="w-4 h-4 text-blue-500" />
      default: return <User className="w-4 h-4 text-gray-500" />
    }
  }

  const getMembershipTypeText = (type: string) => {
    switch (type) {
      case 'vip': return 'VIP会员'
      case 'premium': return '高级会员'
      default: return '普通会员'
    }
  }

  const getMembershipTypeColor = (type: string) => {
    switch (type) {
      case 'vip': return 'bg-yellow-100 text-yellow-800'
      case 'premium': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-golf-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 搜索和筛选 */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <UnifiedSearch
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          availableYears={availableYears}
          placeholder="搜索会员姓名、手机号或邮箱..."
          showLocationFilter={false}
          showRoleFilter={true}
          selectedRole={selectedRole}
          onRoleChange={setSelectedRole}
          onClearFilters={() => {
            setSearchTerm('')
            setSelectedRole('all')
            setSelectedYear('all')
            setSelectedMonth('all')
            setShowInactive(false)
          }}
        />
        
        <div className="flex flex-wrap gap-4 mt-4">
          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-600">显示所有会员 (包括非活跃)</span>
            </label>
          </div>
        </div>
      </div>

      {/* 会员列表 */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">
            会员列表 ({filteredMembers.length})
          </h3>
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-2 px-4 py-2 bg-golf-600 text-white rounded-md hover:bg-golf-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>导出CSV</span>
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  会员信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  联系方式
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  角色
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  注册时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-golf-100 overflow-hidden">
                          {member.avatar_url ? (
                            <img 
                              src={member.avatar_url} 
                              alt={member.full_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <User className="h-6 w-6 text-golf-600" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {member.full_name}
                        </div>
                        {member.real_name && (
                          <div className="text-sm text-gray-500">
                            真实姓名: {member.real_name}
                          </div>
                        )}
                        <div className="flex items-center space-x-3 text-xs text-gray-400 mt-1">
                          {member.handicap && (
                            <span className="flex items-center space-x-1">
                              <span>🏌️</span>
                              <span>差点: {member.handicap}</span>
                            </span>
                          )}
                          {member.industry && (
                            <span className="flex items-center space-x-1">
                              <span>💼</span>
                              <span>{member.industry}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center space-x-1">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{member.phone || '未设置'}</span>
                      </div>
                      <div className="flex items-center space-x-1 mt-1">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500">{member.email || '未设置'}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-gray-400 mt-1">
                        {member.vancouver_residence && (
                          <span className="flex items-center space-x-1">
                            <span>📍</span>
                            <span>{member.vancouver_residence}</span>
                          </span>
                        )}
                        {member.clothing_size && (
                          <span className="flex items-center space-x-1">
                            <span>👕</span>
                            <span>{member.clothing_size}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        {member.role === 'admin' ? (
                          <div className="flex items-center space-x-1">
                            <UserCog className="w-5 h-5 text-orange-600" />
                            <span className="text-sm font-semibold text-orange-700 bg-orange-50 px-2 py-1 rounded-full">
                              管理员
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4 text-gray-600" />
                            <span className="text-sm text-gray-900">
                              普通会员
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    {member.main_club_membership && (
                      <div className="text-xs text-gray-500 mt-1 flex items-center space-x-1">
                        <span>🏆</span>
                        <span className="truncate max-w-32" title={member.main_club_membership}>
                          {member.main_club_membership}
                        </span>
                      </div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {member.is_active ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className={`text-sm ${member.is_active ? 'text-green-600' : 'text-red-600'}`}>
                        {member.is_active ? '活跃' : '非活跃'}
                      </span>
                    </div>
                    {member.last_sign_in_at && (
                      <div className="text-xs text-gray-500 mt-1">
                        最后登录: {new Date(member.last_sign_in_at).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(member.created_at).toLocaleDateString()}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleMemberStatus(member.id, member.is_active)}
                        className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          member.is_active 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                        title={member.is_active ? '点击禁用会员' : '点击启用会员'}
                      >
                        {member.is_active ? (
                          <>
                            <ToggleRight className="w-4 h-4" />
                            <span>启用</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-4 h-4" />
                            <span>禁用</span>
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredMembers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {searchTerm || selectedRole !== 'all' || selectedYear !== 'all' || selectedMonth !== 'all' || showInactive
              ? '没有找到匹配的会员'
              : '暂无会员数据'
            }
          </div>
        )}
      </div>

    </div>
  )
}
