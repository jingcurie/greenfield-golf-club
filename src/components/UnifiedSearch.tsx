import React from 'react'
import { Search, Calendar, MapPin, Filter } from 'lucide-react'

interface UnifiedSearchProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  selectedYear: string
  onYearChange: (value: string) => void
  selectedMonth: string
  onMonthChange: (value: string) => void
  availableYears: number[]
  availableMonths?: Array<{ value: string; label: string }>
  placeholder?: string
  showLocationFilter?: boolean
  locationTerm?: string
  onLocationChange?: (value: string) => void
  showRoleFilter?: boolean
  selectedRole?: string
  onRoleChange?: (value: string) => void
  onClearFilters: () => void
}

export default function UnifiedSearch({
  searchTerm,
  onSearchChange,
  selectedYear,
  onYearChange,
  selectedMonth,
  onMonthChange,
  availableYears,
  availableMonths = [
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
  ],
  placeholder = "按名称搜索...",
  showLocationFilter = false,
  locationTerm = "",
  onLocationChange = () => {},
  showRoleFilter = false,
  selectedRole = "all",
  onRoleChange = () => {},
  onClearFilters
}: UnifiedSearchProps) {
  const hasActiveFilters = searchTerm || selectedYear || selectedMonth || (showLocationFilter && locationTerm) || (showRoleFilter && selectedRole !== 'all')

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
      <div className="flex items-center mb-4">
        <Filter className="w-5 h-5 text-gray-500 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">搜索和筛选</h3>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-4">
        {/* 搜索框 - 占据剩余空间 */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            搜索
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golf-500 focus:border-golf-500"
            />
          </div>
        </div>

        {/* 地点筛选（可选） */}
        {showLocationFilter && (
          <div className="w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              地点
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="按地点搜索..."
                value={locationTerm}
                onChange={(e) => onLocationChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golf-500 focus:border-golf-500"
              />
            </div>
          </div>
        )}

        {/* 年份选择 */}
        <div className="w-32">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            年份
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={selectedYear}
              onChange={(e) => onYearChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golf-500 focus:border-golf-500 appearance-none bg-white"
            >
              <option value="">全部年份</option>
              {availableYears.map(year => (
                <option key={year} value={year.toString()}>{year}年</option>
              ))}
            </select>
          </div>
        </div>

        {/* 月份选择 */}
        <div className="w-32">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            月份
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={selectedMonth}
              onChange={(e) => onMonthChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golf-500 focus:border-golf-500 appearance-none bg-white"
            >
              <option value="">全部月份</option>
              {availableMonths.map(month => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 角色筛选 */}
        {showRoleFilter && (
          <div className="w-32">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              角色
            </label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={selectedRole}
                onChange={(e) => onRoleChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golf-500 focus:border-golf-500 appearance-none bg-white"
              >
                <option value="all">所有角色</option>
                <option value="admin">管理员</option>
                <option value="member">普通会员</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 清除过滤器按钮 */}
      {hasActiveFilters && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClearFilters}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            清除所有筛选
          </button>
        </div>
      )}
    </div>
  )
}

