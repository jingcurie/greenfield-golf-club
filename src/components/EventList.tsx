import React, { useState, useEffect } from 'react'
import { Calendar, MapPin, Users, Clock, DollarSign, ChevronRight, CheckCircle, AlertCircle, FileText } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { getEventStatus, getEventStatusText, getEventStatusStyles, canRegister } from '../utils/eventStatus'
import { Event, EventStats } from '../types'
import UnifiedSearch from './UnifiedSearch'

interface EventListProps {
  onEventSelect: (event: Event) => void
  user?: any
}

export default function EventList({ onEventSelect, user }: EventListProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [eventStats, setEventStats] = useState<Record<string, EventStats>>({})
  const [userRegistrations, setUserRegistrations] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const eventsPerPage = 6
  
  // 搜索和筛选状态
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [locationTerm, setLocationTerm] = useState('')

  useEffect(() => {
    fetchEvents()
  }, [user])

  // 筛选活动
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesLocation = !locationTerm || 
                           event.location.toLowerCase().includes(locationTerm.toLowerCase())
    
    const eventDate = new Date(event.start_time)
    const matchesYear = !selectedYear || eventDate.getFullYear().toString() === selectedYear
    const matchesMonth = !selectedMonth || (eventDate.getMonth() + 1).toString() === selectedMonth
    
    return matchesSearch && matchesLocation && matchesYear && matchesMonth
  })

  // 获取可用年份
  const availableYears = [...new Set(events.map(e => new Date(e.start_time).getFullYear()))].sort((a, b) => b - a)

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // 过滤出可以显示的活动（未开始、进行中、已完成）
      const displayableEvents = (data || []).filter(event => {
        const status = getEventStatus(event)
        return status !== 'cancelled'
      })
      setEvents(displayableEvents)

      // 获取每个活动的统计信息
      const stats: Record<string, EventStats> = {}
      for (const event of displayableEvents) {
        const { data: statsData } = await supabase
          .rpc('get_event_stats', { event_uuid: event.id })
        
        if (statsData) {
          stats[event.id] = statsData
        }
      }
      setEventStats(stats)

      // 获取用户报名状态
      if (user) {
        const { data: registrations, error: regError } = await supabase
          .from('event_registrations')
          .select('event_id, payment_status, status, approval_status')
          .eq('user_id', user.id)

        if (!regError && registrations) {
          const regMap: Record<string, any> = {}
          registrations.forEach(reg => {
            regMap[reg.event_id] = reg
          })
          setUserRegistrations(regMap)
        }
      }
    } catch (error) {
      console.error('获取活动列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatEventDateTime = (event: Event) => {
    const startDate = new Date(event.start_time)
    const endDate = new Date(event.end_time)
    
    // 检查是否是同一天
    const isSameDay = startDate.toDateString() === endDate.toDateString()
    
    if (isSameDay) {
      // 同一天：显示日期 + 时间范围
      return {
        date: formatDate(event.start_time),
        time: `${formatTime(event.start_time)} - ${formatTime(event.end_time)}`
      }
    } else {
      // 跨天：显示开始日期时间 - 结束日期时间
      return {
        date: `${formatDate(event.start_time)} ${formatTime(event.start_time)}`,
        time: `至 ${formatDate(event.end_time)} ${formatTime(event.end_time)}`
      }
    }
  }

  const isRegistrationOpen = (deadline: string) => {
    return new Date() < new Date(deadline)
  }

  const isEventFull = (eventId: string) => {
    const stats = eventStats[eventId]
    return stats ? stats.available_spots <= 0 : false
  }

  const getUserRegistrationStatus = (eventId: string) => {
    if (!user) return null
    return userRegistrations[eventId]
  }

  const getRegistrationButtonText = (event: Event) => {
    const registration = getUserRegistrationStatus(event.id)
    const registrationOpen = isRegistrationOpen(event.registration_deadline)
    const eventFull = isEventFull(event.id)

    if (!user) {
      return { text: '请先登录', disabled: true, color: 'bg-gray-400' }
    }

    if (registration) {
      console.log('活动列表状态调试:', {
        eventId: eventId,
        approval_status: registration.approval_status,
        payment_status: registration.payment_status,
        status: registration.status
      })
      
      if (registration.approval_status === 'approved') {
        return { text: '已报名', disabled: true, color: 'bg-green-500' }
      } else if (registration.approval_status === 'pending') {
        return { text: '已申请待审批', disabled: true, color: 'bg-yellow-500' }
      } else if (registration.approval_status === 'rejected') {
        return { text: '已拒绝', disabled: true, color: 'bg-red-500' }
      } else {
        return { text: '待支付', disabled: false, color: 'bg-orange-500' }
      }
    }

    if (!registrationOpen) {
      return { text: '报名已截止', disabled: true, color: 'bg-gray-400' }
    }

    if (eventFull) {
      return { text: '名额已满', disabled: true, color: 'bg-red-400' }
    }

    return { text: '立即报名', disabled: false, color: 'bg-golf-600' }
  }

  // 分页逻辑
  const indexOfLastEvent = currentPage * eventsPerPage
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent)
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage)

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 border-4 border-golf-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 统一搜索组件 */}
      <UnifiedSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        availableYears={availableYears}
        placeholder="按活动名称或描述搜索..."
        showLocationFilter={true}
        locationTerm={locationTerm}
        onLocationChange={setLocationTerm}
        onClearFilters={() => {
          setSearchTerm('')
          setSelectedYear('')
          setSelectedMonth('')
          setLocationTerm('')
          setCurrentPage(1)
        }}
      />

      {/* 活动列表 */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentEvents.map((event) => {
          const stats = eventStats[event.id]
          const registrationOpen = isRegistrationOpen(event.registration_deadline)
          const eventFull = isEventFull(event.id)

          return (
            <div
              key={event.id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
              onClick={() => onEventSelect(event)}
            >
              {/* 活动图片 */}
              <div className="aspect-[16/9] bg-gradient-to-br from-golf-200 to-golf-300 overflow-hidden">
                <img
                  src={event.image_url || 'https://images.pexels.com/photos/1325735/pexels-photo-1325735.jpeg?auto=compress&cs=tinysrgb&w=800'}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-6">
                {/* 活动标题 */}
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {event.title}
                </h3>

                {/* 活动信息 */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 text-golf-500" />
                    {formatEventDateTime(event).date}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-golf-500" />
                    {formatEventDateTime(event).time}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 text-golf-500" />
                    {event.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2 text-golf-500" />
                    ¥{event.fee.toFixed(2)}
                  </div>
                </div>

                {/* 报名状态 */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2 text-golf-500" />
                    {stats ? `${stats.total_registrations}/${event.max_participants}` : '加载中...'}
                  </div>
                  <div className="text-sm">
                    {!registrationOpen ? (
                      <span className="text-red-600 font-medium">报名已截止</span>
                    ) : eventFull ? (
                      <span className="text-orange-600 font-medium">名额已满</span>
                    ) : (
                      <span className="text-green-600 font-medium">
                        还有 {stats?.available_spots || 0} 个名额
                      </span>
                    )}
                  </div>
                </div>


                {/* 报名状态指示器 */}
                {user && (
                  <div className="flex items-center justify-center text-sm mb-3">
                    {(() => {
                      const registration = getUserRegistrationStatus(event.id)
                      if (registration) {
                        if (registration.approval_status === 'approved') {
                          return (
                            <div className="flex items-center text-green-600">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              已报名
                            </div>
                          )
                        } else if (registration.approval_status === 'pending') {
                          return (
                            <div className="flex items-center text-yellow-600">
                              <AlertCircle className="w-4 h-4 mr-1" />
                              已申请待审批
                            </div>
                          )
                        } else if (registration.approval_status === 'rejected') {
                          return (
                            <div className="flex items-center text-red-600">
                              <AlertCircle className="w-4 h-4 mr-1" />
                              已拒绝
                            </div>
                          )
                        } else {
                          return (
                            <div className="flex items-center text-orange-600">
                              <AlertCircle className="w-4 h-4 mr-1" />
                              待支付
                            </div>
                          )
                        }
                      }
                      return null
                    })()}
                  </div>
                )}

                {/* 查看详情按钮 */}
                <button className="w-full flex items-center justify-center bg-golf-600 hover:bg-golf-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                  查看详情
                  <ChevronRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一页
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-2 text-sm font-medium rounded-lg ${
                currentPage === page
                  ? 'bg-golf-600 text-white'
                  : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一页
          </button>
        </div>
      )}

      {/* 空状态 */}
      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          {events.length === 0 ? (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无活动</h3>
              <p className="text-gray-500">目前没有可报名的活动，请稍后再来查看。</p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-2">未找到匹配的活动</h3>
              <p className="text-gray-500">请尝试调整搜索条件或清除筛选器</p>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedYear('')
                  setSelectedMonth('')
                  setLocationTerm('')
                  setCurrentPage(1)
                }}
                className="mt-3 px-4 py-2 bg-golf-600 text-white rounded-lg hover:bg-golf-700 transition-colors"
              >
                清除筛选器
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}