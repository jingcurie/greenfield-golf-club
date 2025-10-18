import { useState, useEffect } from 'react'
import { Calendar, Image as ImageIcon, Filter } from 'lucide-react'
import { supabase } from '../lib/supabase'

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

interface PosterListProps {
  onPosterSelect: (poster: Poster) => void
}

export default function PosterList({ onPosterSelect }: PosterListProps) {
  const [posters, setPosters] = useState<Poster[]>([])
  const [filteredPosters, setFilteredPosters] = useState<Poster[]>([])
  const [loading, setLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState<'all' | 'upcoming' | 'past'>('all')
  const [yearFilter, setYearFilter] = useState<string>('all')
  const [availableYears, setAvailableYears] = useState<string[]>([])

  useEffect(() => {
    fetchPosters()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [posters, timeFilter, yearFilter])

  const fetchPosters = async () => {
    try {
      const { data, error } = await supabase
        .from('posters')
        .select('*')
        .eq('status', 'active')
        .order('display_order', { ascending: true })
        .order('event_date', { ascending: false })

      if (error) throw error

      setPosters(data || [])

      const years = [...new Set(
        (data || []).map(p => new Date(p.event_date).getFullYear().toString())
      )].sort((a, b) => b.localeCompare(a))

      setAvailableYears(years)
    } catch (error) {
      console.error('获取海报列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...posters]
    const now = new Date()

    if (timeFilter === 'upcoming') {
      filtered = filtered.filter(p => new Date(p.event_date) >= now)
    } else if (timeFilter === 'past') {
      filtered = filtered.filter(p => new Date(p.event_date) < now)
    }

    if (yearFilter !== 'all') {
      filtered = filtered.filter(p =>
        new Date(p.event_date).getFullYear().toString() === yearFilter
      )
    }

    setFilteredPosters(filtered)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 border-4 border-golf-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 筛选器 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center mb-4">
          <Filter className="w-5 h-5 text-golf-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">筛选条件</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* 时间筛选 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              时间范围
            </label>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as any)}
              className="input-field"
            >
              <option value="all">全部</option>
              <option value="upcoming">即将到来</option>
              <option value="past">已过期</option>
            </select>
          </div>

          {/* 年份筛选 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              年份
            </label>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">全部年份</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}年</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          共找到 {filteredPosters.length} 张海报
        </div>
      </div>

      {/* 海报网格 */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosters.map((poster) => (
          <div
            key={poster.id}
            className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden group"
            onClick={() => onPosterSelect(poster)}
          >
            {/* 海报图片 */}
            <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
              <img
                src={poster.image_url}
                alt={poster.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* 海报信息 */}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                {poster.title}
              </h3>

              <div className="flex items-center text-sm text-gray-600 mb-3">
                <Calendar className="w-4 h-4 mr-2 text-golf-500" />
                {formatDate(poster.event_date)}
              </div>

              {poster.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {poster.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 空状态 */}
      {filteredPosters.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无海报</h3>
          <p className="text-gray-500">当前筛选条件下没有找到海报</p>
        </div>
      )}
    </div>
  )
}
