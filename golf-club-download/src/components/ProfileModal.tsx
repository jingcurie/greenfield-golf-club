import React, { useState, useEffect } from 'react'
import { X, User, Mail, Phone, Calendar, Edit2, Save } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  user: any
}

export default function ProfileModal({ isOpen, onClose, user }: ProfileModalProps) {
  const [userProfile, setUserProfile] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  // 编辑表单状态
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: '',
    membership_type: 'standard'
  })

  useEffect(() => {
    if (isOpen && user) {
      fetchUserProfile()
    }
  }, [isOpen, user])

  const fetchUserProfile = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()
      
      if (error) throw error
      
      if (data) {
        setUserProfile(data)
        setEditForm({
          full_name: data.full_name || '',
          phone: data.phone || '',
          membership_type: data.membership_type || 'standard'
        })
      } else {
        // 如果没有用户资料，创建一个默认的
        const newProfile = {
          id: user.id,
          full_name: '',
          phone: '',
          membership_type: 'standard'
        }
        
        const { data: createdProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert(newProfile)
          .select()
          .single()
        
        if (createError) throw createError
        
        setUserProfile(createdProfile)
        setEditForm({
          full_name: '',
          phone: '',
          membership_type: 'standard'
        })
      }
    } catch (error: any) {
      console.error('获取用户资料失败:', error)
      setMessage('获取用户资料失败: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user || !userProfile) return
    
    setLoading(true)
    setMessage('')
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: editForm.full_name,
          phone: editForm.phone,
          membership_type: editForm.membership_type
        })
        .eq('id', user.id)
      
      if (error) throw error
      
      // 更新本地状态
      setUserProfile({
        ...userProfile,
        ...editForm
      })
      
      setIsEditing(false)
      setMessage('个人信息更新成功！')
      
      setTimeout(() => setMessage(''), 3000)
    } catch (error: any) {
      console.error('更新用户资料失败:', error)
      setMessage('更新失败: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (userProfile) {
      setEditForm({
        full_name: userProfile.full_name || '',
        phone: userProfile.phone || '',
        membership_type: userProfile.membership_type || 'standard'
      })
    }
    setIsEditing(false)
    setMessage('')
  }

  if (!isOpen) return null

  const formatDate = (dateString: string) => {
    if (!dateString) return '未知'
    return new Date(dateString).toLocaleDateString('zh-CN')
  }

  const getMembershipTypeText = (type: string) => {
    switch (type) {
      case 'premium': return '高级会员'
      case 'vip': return 'VIP会员'
      default: return '普通会员'
    }
  }

  const getMembershipTypeColor = (type: string) => {
    switch (type) {
      case 'premium': return 'text-blue-600 bg-blue-100'
      case 'vip': return 'text-purple-600 bg-purple-100'
      default: return 'text-green-600 bg-green-100'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">个人资料</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-golf-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">加载中...</p>
            </div>
          )}

          {!loading && userProfile && (
            <div className="space-y-6">
              {/* 头像和基本信息 */}
              <div className="flex items-center space-x-4 p-6 bg-gray-50 rounded-xl">
                <div className="w-16 h-16 bg-golf-600 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {userProfile.full_name || '未设置姓名'}
                  </h3>
                  <p className="text-gray-600">{user.email}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getMembershipTypeColor(userProfile.membership_type)}`}>
                    {getMembershipTypeText(userProfile.membership_type)}
                  </span>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-golf-600 hover:text-golf-700 p-2"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* 详细信息 */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      邮箱地址
                    </label>
                    <div className="p-3 bg-gray-100 rounded-lg text-gray-600">
                      {user.email}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">邮箱地址无法修改</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      姓名
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.full_name}
                        onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golf-500 focus:border-transparent"
                        placeholder="请输入您的姓名"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        {userProfile.full_name || '未设置'}
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">这是您在俱乐部中显示的姓名</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
                      手机号码
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golf-500 focus:border-transparent"
                        placeholder="请输入您的手机号码"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        {userProfile.phone || '未设置'}
                      </div>
                    )}
                  </div>

                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      会员类型
                    </label>
                    {isEditing ? (
                      <select
                        value={editForm.membership_type}
                        onChange={(e) => setEditForm({ ...editForm, membership_type: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golf-500 focus:border-transparent"
                      >
                        <option value="standard">普通会员</option>
                        <option value="premium">高级会员</option>
                        <option value="vip">VIP会员</option>
                      </select>
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        {getMembershipTypeText(userProfile.membership_type)}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      注册时间
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      {formatDate(userProfile.created_at)}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      账户状态
                    </label>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <span className="text-green-600 font-medium">正常</span>
                    </div>
                  </div>
                </div>
              </div>

              {message && (
                <div className={`p-4 rounded-lg text-sm ${
                  message.includes('成功') 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-red-100 text-red-700 border border-red-200'
                }`}>
                  {message}
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex space-x-4 pt-4 border-t border-gray-200">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleCancel}
                      className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex-1 btn-primary py-3 disabled:opacity-50 flex items-center justify-center"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? '保存中...' : '保存'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    关闭
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}