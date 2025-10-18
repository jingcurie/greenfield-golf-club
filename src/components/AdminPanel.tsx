import React, { useState, useEffect } from 'react'
import {
  Plus, Edit, Trash2, Users, DollarSign, Calendar, MapPin, ChevronDown, ChevronRight,
  BarChart3, Settings, Eye, Download, Image as ImageIcon, Trophy, Receipt, Clock, Search, Filter, X
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Event, EventRegistration } from '../types'
import EventForm from './EventForm'
import EventRegistrationAdmin from './EventRegistrationAdmin'
import PosterForm from './PosterForm'
import ScoreForm from './ScoreForm'
import InvestmentAdmin from './InvestmentAdmin'
import ExpenseAdmin from './ExpenseAdmin'
import MemberAdmin from './MemberAdmin'
import AdminAnalytics from './AdminAnalytics'
import UnifiedSearch from './UnifiedSearch'
import { useModal } from './ModalProvider'
import { getEventStatus, getEventStatusText, getEventStatusStyles } from '../utils/eventStatus'

interface AdminStats {
  // 活动统计
  total_events: number
  upcoming_events: number
  active_events: number
  completed_events: number
  cancelled_events: number
  
  // 报名统计
  total_registrations: number
  paid_registrations: number
  pending_payments: number
  cancelled_registrations: number
  
  // 财务统计
  total_revenue: number
  pending_revenue: number
  average_event_fee: number
  
  // 会员统计
  total_members: number
  active_members: number
  new_members_this_month: number
  
  // 成绩统计
  total_scores: number
  average_score: number
  best_score: number
  
  // 投资统计
  total_investments: number
  total_investment_amount: number
  active_investment_projects: number
  
  // 费用统计
  total_expenses: number
  total_expense_amount: number
  monthly_expenses: number
}

interface Poster {
  id: string
  title: string
  description: string
  image_url: string
  display_order: number
  event_date: string
  status: string
  created_at: string
}

export default function AdminPanel() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'events' | 'registrations' | 'posters' | 'scores' | 'investments' | 'expenses' | 'members'>('dashboard')
  const [selectedEventForRegistration, setSelectedEventForRegistration] = useState<Event | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [posters, setPosters] = useState<Poster[]>([])
  const [scores, setScores] = useState<any[]>([])
  const [eventRegistrations, setEventRegistrations] = useState<any[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [selectedPoster, setSelectedPoster] = useState<Poster | null>(null)
  const [selectedScore, setSelectedScore] = useState<any>(null)
  const [showEventForm, setShowEventForm] = useState(false)
  const [showPosterForm, setShowPosterForm] = useState(false)
  const [showScoreForm, setShowScoreForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'active' | 'cancelled' | 'completed'>('all')
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set())
  const [scoreSearchTerm, setScoreSearchTerm] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const { confirmDelete, showSuccess, showError } = useModal()

  useEffect(() => {
    fetchAdminData()
  }, [])

  const toggleEventExpansion = (eventId: string) => {
    setExpandedEvents(prev => {
      const newSet = new Set(prev)
      if (newSet.has(eventId)) {
        newSet.delete(eventId)
      } else {
        newSet.add(eventId)
      }
      return newSet
    })
  }

  // 过滤活动
  const filteredEvents = events.filter(e => {
    const status = getEventStatus(e)
    
    // 根据当前视图使用不同的筛选条件
    if (currentView === 'scores') {
      // 成绩管理：只显示已结束的活动，使用成绩搜索条件
      if (status !== 'completed') return false
      
      const matchesSearch = !scoreSearchTerm || 
        e.title.toLowerCase().includes(scoreSearchTerm.toLowerCase()) ||
        e.location?.toLowerCase().includes(scoreSearchTerm.toLowerCase())
      
      const matchesYear = !selectedYear || 
        new Date(e.start_time).getFullYear().toString() === selectedYear
      
      const matchesMonth = !selectedMonth || 
        (new Date(e.start_time).getMonth() + 1).toString() === selectedMonth
      
      return matchesSearch && matchesYear && matchesMonth
    } else {
      // 其他视图：使用原来的筛选逻辑
      const matchesStatus = statusFilter === 'all' || status === statusFilter
      const matchesSearch = !searchTerm || 
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.location?.toLowerCase().includes(searchTerm.toLowerCase())
      
      return matchesStatus && matchesSearch
    }
  })

  // 获取可用的年份和月份
  const availableYears = [...new Set(events
    .filter(e => getEventStatus(e) === 'completed')
    .map(e => {
      const date = new Date(e.start_time)
      return isNaN(date.getTime()) ? null : date.getFullYear()
    })
    .filter(year => year !== null)
  )].sort((a, b) => b - a)

  const availableMonths = [
    { value: '1', label: '1月' },
    { value: '2', label: '2月' },
    { value: '3', label: '3月' },
    { value: '4', label: '4月' },
    { value: '5', label: '5月' },
    { value: '6', label: '6月' },
    { value: '7', label: '7月' },
    { value: '8', label: '8月' },
    { value: '9', label: '9月' },
    { value: '10', label: '10月' },
    { value: '11', label: '11月' },
    { value: '12', label: '12月' }
  ]


  const fetchAdminData = async () => {
    try {
      // 获取统计数据
      const { data: statsData } = await supabase.rpc('get_admin_event_stats')
      setStats(statsData)

      // 获取所有活动
      const { data: eventsData, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setEvents(eventsData || [])

      // 获取所有海报
      const { data: postersData, error: postersError } = await supabase
        .from('posters')
        .select('*')
        .order('display_order', { ascending: true })
        .order('event_date', { ascending: false })

      if (postersError) throw postersError
      setPosters(postersData || [])

      // 获取所有报名记录
      const { data: registrationsData, error: registrationsError } = await supabase
        .from('event_registrations')
        .select('event_id, user_id, payment_status, approval_status')

      if (registrationsError) throw registrationsError
      console.log('获取到的报名记录:', registrationsData)
      setEventRegistrations(registrationsData || [])

      // 获取所有成绩
      const { data: scoresData, error: scoresError } = await supabase
        .from('scores')
        .select('*')
        .order('created_at', { ascending: false })


      if (scoresError) {
        console.error('获取成绩数据失败:', scoresError)
        setScores([])
      } else {
        
        if (scoresData && scoresData.length > 0) {
          // 获取用户信息
          const userIds = [...new Set(scoresData.map(s => s.user_id))]
          
          const { data: profilesData, error: profilesError } = await supabase
            .from('user_profiles')
            .select('id, full_name')
            .in('id', userIds)


          // 合并数据
          const scoresWithProfiles = scoresData.map(score => {
            const userProfile = profilesData?.find(p => p.id === score.user_id)
            return {
            ...score,
              user_profiles: userProfile || { full_name: '未知' }
            }
          })

          setScores(scoresWithProfiles)
        } else {
          setScores([])
        }
      }
    } catch (error) {
      console.error('获取管理数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    confirmDelete('确定要删除这个活动吗？这将同时删除所有相关的报名记录。', async () => {
      try {
        const { error } = await supabase
          .from('events')
          .delete()
          .eq('id', eventId)

        if (error) throw error

        setEvents(events.filter(e => e.id !== eventId))
        showSuccess('活动删除成功')
      } catch (error) {
        console.error('删除活动失败:', error)
        showError('删除失败，请重试')
      }
    })
  }

  const handleUpdateEventStatus = async (eventId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ status })
        .eq('id', eventId)

      if (error) throw error

      setEvents(events.map(e =>
        e.id === eventId ? { ...e, status } : e
      ))
      showSuccess('状态更新成功')
    } catch (error) {
      console.error('更新状态失败:', error)
      showError('更新失败，请重试')
    }
  }

  const handleDeletePoster = async (posterId: string) => {
    confirmDelete('确定要删除这张海报吗？', async () => {
      try {
        const { error } = await supabase
          .from('posters')
          .delete()
          .eq('id', posterId)

        if (error) throw error

        setPosters(posters.filter(p => p.id !== posterId))
        showSuccess('海报删除成功')
      } catch (error) {
        console.error('删除海报失败:', error)
        showError('删除失败，请重试')
      }
    })
  }

  const handleDeleteScore = async (scoreId: string) => {
    confirmDelete('确定要删除这条成绩记录吗？', async () => {
      try {
        const { error } = await supabase
          .from('scores')
          .delete()
          .eq('id', scoreId)

        if (error) throw error

        setScores(scores.filter(s => s.id !== scoreId))
        showSuccess('成绩删除成功')
      } catch (error) {
        console.error('删除成绩失败:', error)
        showError('删除失败，请重试')
      }
    })
  }


  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return '¥0.00'
    }
    return `¥${amount.toFixed(2)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 管理员导航 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">管理员控制台</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'dashboard' 
                  ? 'bg-golf-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              数据统计
            </button>
            <button
              onClick={() => setCurrentView('events')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'events'
                  ? 'bg-golf-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              活动管理
            </button>
            <button
              onClick={() => setCurrentView('posters')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'posters'
                  ? 'bg-golf-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ImageIcon className="w-4 h-4 inline mr-2" />
              海报管理
            </button>
            <button
              onClick={() => setCurrentView('scores')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'scores'
                  ? 'bg-golf-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Trophy className="w-4 h-4 inline mr-2" />
              成绩管理
            </button>
            <button
              onClick={() => setCurrentView('investments')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'investments'
                  ? 'bg-golf-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <DollarSign className="w-4 h-4 inline mr-2" />
              投资管理
            </button>
            <button
              onClick={() => setCurrentView('expenses')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'expenses'
                  ? 'bg-golf-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Receipt className="w-4 h-4 inline mr-2" />
              费用管理
            </button>
            <button
              onClick={() => setCurrentView('members')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'members'
                  ? 'bg-golf-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              会员管理
            </button>
          </div>
        </div>

        {/* 数据分析仪表板 */}
        {currentView === 'dashboard' && <AdminAnalytics />}
        
      </div>

      {/* 活动管理 */}
      {currentView === 'events' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-gray-900">活动管理</h2>
              {(() => {
                const totalPending = eventRegistrations.filter(reg => reg.approval_status === 'pending').length
                return totalPending > 0 ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 animate-pulse">
                    {totalPending} 个待审批申请
                  </span>
                ) : null
              })()}
            </div>
            <button
              onClick={() => {
                setSelectedEvent(null)
                setShowEventForm(true)
              }}
              className="btn-primary flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              创建活动
            </button>
          </div>

          {/* 搜索和筛选 */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="搜索活动名称或地点..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golf-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golf-500 focus:border-transparent"
              >
                <option value="all">所有状态</option>
                <option value="upcoming">未开始</option>
                <option value="active">进行中</option>
                <option value="completed">已完成</option>
                <option value="cancelled">已取消</option>
              </select>
            </div>
          </div>

          {/* 活动列表 */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">活动名称</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">时间</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">地点</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">费用</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">报名情况</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">状态</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event) => (
                  <tr key={event.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{event.title}</div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatDate(event.start_time)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {event.location}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatCurrency(event.fee)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {(() => {
                        const allRegistrations = eventRegistrations.filter(reg => reg.event_id === event.id)
                        const approvedRegistrations = allRegistrations.filter(reg => reg.approval_status === 'approved')
                        const pendingRegistrations = allRegistrations.filter(reg => reg.approval_status === 'pending')
                        
                        return (
                          <div className="flex items-center space-x-2">
                            <span>{approvedRegistrations.length}/{event.max_participants}</span>
                            {pendingRegistrations.length > 0 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 animate-pulse">
                                {pendingRegistrations.length} 待审批
                              </span>
                            )}
                          </div>
                        )
                      })()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventStatusStyles(getEventStatus(event))}`}>
                        {getEventStatusText(getEventStatus(event))}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedEventForRegistration(event)
                          }}
                          className="text-purple-600 hover:text-purple-800"
                          title="报名管理"
                        >
                          <Users className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedEvent(event)
                            setShowEventForm(true)
                          }}
                          className="text-green-600 hover:text-green-800"
                          title="编辑"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="text-red-600 hover:text-red-800"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || statusFilter !== 'all' ? '没有找到匹配的活动' : '暂无活动'}
            </div>
          )}
        </div>
      )}

      {/* 活动表单弹窗 */}
      {showEventForm && (
        <EventForm
          event={selectedEvent}
          onClose={() => {
            setShowEventForm(false)
            setSelectedEvent(null)
          }}
          onSuccess={() => {
            setShowEventForm(false)
            setSelectedEvent(null)
            fetchAdminData()
          }}
        />
      )}

      {/* 海报管理 */}
      {currentView === 'posters' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">海报管理</h2>
            <button
              onClick={() => {
                setSelectedPoster(null)
                setShowPosterForm(true)
              }}
              className="btn-primary flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              添加海报
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posters.map((poster) => (
              <div key={poster.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-[3/4] bg-gray-100">
                  <img
                    src={poster.image_url}
                    alt={poster.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{poster.title}</h3>
                  <div className="text-sm text-gray-600 mb-3">
                    排序: {poster.display_order} | {new Date(poster.event_date).toLocaleDateString('zh-CN')}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedPoster(poster)
                        setShowPosterForm(true)
                      }}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDeletePoster(poster.id)}
                      className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {posters.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              暂无海报，点击"添加海报"开始创建
            </div>
          )}
        </div>
      )}

      {/* 成绩管理 */}
      {currentView === 'scores' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Trophy className="w-7 h-7 text-yellow-500 mr-3" />
                成绩管理
              </h2>
            </div>

            {/* 统一搜索组件 */}
            <UnifiedSearch
              searchTerm={scoreSearchTerm}
              onSearchChange={setScoreSearchTerm}
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
              availableYears={availableYears}
              placeholder="按活动名称或地点搜索..."
              showLocationFilter={true}
              locationTerm={scoreSearchTerm}
              onLocationChange={setScoreSearchTerm}
              onClearFilters={() => {
                setScoreSearchTerm('')
                setSelectedYear('')
                setSelectedMonth('')
              }}
            />

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="w-8 h-8 border-4 border-golf-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
            ) : (
            <>
            <div className="text-sm text-gray-600 mb-4">
              共 {filteredEvents.length} 个已结束的活动
              {filteredEvents.length !== events.filter(e => getEventStatus(e) === 'completed').length && (
                <span className="text-blue-600 ml-2">
                  (已过滤，共 {events.filter(e => getEventStatus(e) === 'completed').length} 个活动)
                </span>
              )}
              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-gray-500 mt-1">
                  调试: 总活动数 {events.length}, 已结束活动: {events.filter(e => getEventStatus(e) === 'completed').map(e => e.title).join(', ')}
                </div>
              )}
            </div>
            <div className="space-y-2">
              {filteredEvents.map((event) => {
                const eventScores = scores.filter(s => s.event_id === event.id)
                const participantsCount = eventScores.length
                const hasScores = participantsCount > 0
                const isExpanded = expandedEvents.has(event.id)
                
                // 计算该活动的总报名人数
                const totalRegistrations = eventRegistrations.filter(r => r.event_id === event.id).length
                const progressPercentage = totalRegistrations > 0 ? Math.round((participantsCount / totalRegistrations) * 100) : 0

                return (
                  <div
                    key={event.id}
                    className="bg-gray-50 rounded-2xl shadow-sm hover:shadow-lg transition-all border border-gray-100 hover:border-gray-200"
                  >
                    {/* 主卡片头部 */}
                    <div 
                      className="p-4 sm:p-6 cursor-pointer"
                      onClick={() => toggleEventExpansion(event.id)}
                    >
                      <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {isExpanded ? (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                              )}
                          <div className="flex-1">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900">{event.title}</h3>
                            
                            {/* 活动时间信息 */}
                            <div className="text-sm text-gray-500 mt-1 mb-2">
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                <span>
                                  {new Date(event.start_time).toLocaleString('zh-CN', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })} - {new Date(event.end_time).toLocaleString('zh-CN', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
          </div>

                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <Users className="w-4 h-4 mr-2" />
                              已录入成绩: {participantsCount}/{totalRegistrations}
                              {totalRegistrations > 0 && (
                                <div className="ml-3 flex items-center space-x-2">
                                  <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                    <div 
                                      className="bg-green-500 h-1.5 rounded-full transition-all"
                                      style={{ width: `${progressPercentage}%` }}
                                    ></div>
                      </div>
                                  <span className="text-xs text-gray-500">{progressPercentage}%</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            participantsCount === 0 
                              ? 'bg-gray-100 text-gray-800' 
                              : participantsCount === totalRegistrations 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {participantsCount === 0 
                              ? '尚未录入' 
                              : participantsCount === totalRegistrations 
                              ? '录入完成' 
                              : '部分录入'
                            }
                          </span>
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
                          </div>
                        </div>
                      </div>
                    </div>

                        {/* 折叠内容 - 队员成绩列表 */}
                        {isExpanded && (
                          <div className="border-t border-gray-100 px-4 sm:px-6 pb-4 bg-white rounded-b-2xl">
                        <div className="space-y-3 mt-4">
                          {eventScores.length > 0 ? (
                            eventScores
                              .sort((a, b) => {
                                // 按排名排序，有排名的在前，没有排名的在后
                                if (a.rank && b.rank) {
                                  return a.rank - b.rank
                                }
                                if (a.rank && !b.rank) return -1
                                if (!a.rank && b.rank) return 1
                                // 如果都没有排名，按总杆数排序（杆数少的在前）
                                return a.total_strokes - b.total_strokes
                              })
                              .map((score, index) => (
                              <div key={score.id || index} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900">
                      {score.user_profiles?.full_name || '未知'}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    总杆数: {score.total_strokes} | 净杆数: {score.net_strokes || '-'} | 差点: {score.handicap}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                  {score.rank && (
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                      score.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                                      score.rank === 2 ? 'bg-gray-100 text-gray-800' :
                                      score.rank === 3 ? 'bg-amber-100 text-amber-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                                      #{score.rank}
                        </span>
                                  )}
                      <button
                                    onClick={() => {
                                      setSelectedEvent(event)
                                      setSelectedScore(score)
                                      setShowScoreForm(true)
                                    }}
                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                    title="编辑成绩"
                                  >
                                    <Edit className="w-4 h-4" />
                      </button>
          </div>
            </div>
                            ))
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                              <p>暂无成绩记录</p>
                              <button
                                onClick={() => {
                                  setSelectedEvent(event)
                                  setShowScoreForm(true)
                                }}
                                className="mt-3 px-4 py-2 bg-golf-600 text-white rounded-lg hover:bg-golf-700 transition-colors"
                              >
                                开始录入成绩
                              </button>
        </div>
      )}
          </div>

                        {/* 操作按钮 */}
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                          <button
                            onClick={() => {
                              setSelectedEventForRegistration(event)
                            }}
                            className="flex items-center text-sm text-green-600 hover:text-green-700"
                          >
                            <Users className="w-4 h-4 mr-2" />
                            报名管理
                          </button>
                          <button
                            onClick={() => {
                              setSelectedEvent(event)
                              setShowScoreForm(true)
                            }}
                            className="flex items-center text-sm text-blue-600 hover:text-blue-700"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            批量录入成绩
                          </button>
                        </div>
            </div>
          )}
                    </div>
                  )
                })}
                
                {filteredEvents.length === 0 && (
                  <div className="text-center py-12">
                    <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    {events.filter(e => getEventStatus(e) === 'completed').length === 0 ? (
                      <>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无已结束的活动</h3>
                        <p className="text-gray-600">等待活动结束后即可录入成绩</p>
                      </>
                    ) : (
                      <>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">未找到匹配的活动</h3>
                        <p className="text-gray-600">请尝试调整搜索条件或清除过滤器</p>
                        <button
                          onClick={() => {
                            setScoreSearchTerm('')
                            setSelectedYear('')
                            setSelectedMonth('')
                          }}
                          className="mt-3 px-4 py-2 bg-golf-600 text-white rounded-lg hover:bg-golf-700 transition-colors"
                        >
                          清除筛选
                        </button>
                      </>
                    )}
                  </div>
                )}
            </div>
            </>
            )}
          </div>
        </div>
      )}

      {/* 海报表单弹窗 */}
      {showPosterForm && (
        <PosterForm
          poster={selectedPoster}
          onClose={() => {
            setShowPosterForm(false)
            setSelectedPoster(null)
          }}
          onSuccess={() => {
            setShowPosterForm(false)
            setSelectedPoster(null)
            fetchAdminData()
          }}
        />
      )}

      {/* 成绩表单弹窗 */}
      {showScoreForm && (
        <ScoreForm
          preselectedEvent={selectedEvent}
          preselectedScore={selectedScore}
          onClose={() => {
            setShowScoreForm(false)
            setSelectedScore(null)
            setSelectedEvent(null)
          }}
          onSuccess={() => {
            setShowScoreForm(false)
            setSelectedScore(null)
            setSelectedEvent(null)
            fetchAdminData()
          }}
        />
      )}


      {/* 投资管理 */}
      {currentView === 'investments' && <InvestmentAdmin />}

      {/* 费用管理 */}
      {currentView === 'expenses' && <ExpenseAdmin />}

      {/* 会员管理 */}
      {currentView === 'members' && <MemberAdmin />}

      {/* 活动报名管理模态框 */}
      {selectedEventForRegistration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-end mb-6">
                <button
                  onClick={() => setSelectedEventForRegistration(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <EventRegistrationAdmin 
                eventId={selectedEventForRegistration.id}
                eventTitle={selectedEventForRegistration.title}
                onDataChange={fetchAdminData}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}