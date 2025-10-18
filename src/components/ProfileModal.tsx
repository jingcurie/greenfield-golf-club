import React, { useState, useEffect, useRef } from 'react'
import { X, User, Mail, Phone, Calendar, Edit2, Save, Upload, Camera } from 'lucide-react'
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
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [showAvatarCrop, setShowAvatarCrop] = useState(false)
  const [cropPosition, setCropPosition] = useState({ x: 50, y: 50 }) // 裁剪位置
  const [cropScale, setCropScale] = useState(100) // 裁剪缩放
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // 编辑表单状态
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    avatar_url: '',
    handicap: '',
    clothing_size: '',
    vancouver_residence: '',
    domestic_residence: '',
    main_club_membership: '',
    industry: '',
    golf_preferences: '',
    golf_motto: '',
    other_interests: ''
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
        .select(`
          id,
          full_name,
          phone,
          email,
          avatar_url,
          avatar_position_x,
          avatar_position_y,
          avatar_scale,
          handicap,
          clothing_size,
          vancouver_residence,
          domestic_residence,
          main_club_membership,
          industry,
          golf_preferences,
          golf_motto,
          other_interests
        `)
        .eq('id', user.id)
        .maybeSingle()
      
      if (error) throw error
      
      if (data) {
        setUserProfile(data)
        setEditForm({
          full_name: data.full_name || '',
          phone: data.phone || '',
          email: data.email || '',
          avatar_url: data.avatar_url || '',
          handicap: data.handicap || '',
          clothing_size: data.clothing_size || '',
          vancouver_residence: data.vancouver_residence || '',
          domestic_residence: data.domestic_residence || '',
          main_club_membership: data.main_club_membership || '',
          industry: data.industry || '',
          golf_preferences: data.golf_preferences || '',
          golf_motto: data.golf_motto || '',
          other_interests: data.other_interests || ''
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
          email: editForm.email,
          avatar_url: editForm.avatar_url,
          handicap: editForm.handicap ? parseFloat(editForm.handicap) : null,
          clothing_size: editForm.clothing_size,
          vancouver_residence: editForm.vancouver_residence,
          domestic_residence: editForm.domestic_residence,
          main_club_membership: editForm.main_club_membership,
          industry: editForm.industry,
          golf_preferences: editForm.golf_preferences,
          golf_motto: editForm.golf_motto,
          other_interests: editForm.other_interests
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

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      setMessage('请选择图片文件')
      return
    }

    // 检查文件大小 (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setMessage('图片大小不能超过2MB')
      return
    }

    // 设置文件并显示裁剪界面
    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setCropPosition({ x: 50, y: 50 })
    setCropScale(100)
    setShowAvatarCrop(true)
  }

  const handleCropConfirm = async () => {
    if (!selectedFile || !user) return

    setUploadingAvatar(true)
    try {
      // 上传到 Supabase Storage
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, selectedFile)

      if (uploadError) throw uploadError

      // 获取公开URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // 更新用户资料，保存裁剪设置
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ 
          avatar_url: publicUrl,
          avatar_position_x: cropPosition.x,
          avatar_position_y: cropPosition.y,
          avatar_scale: cropScale
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      // 更新本地状态
      setUserProfile({ 
        ...userProfile, 
        avatar_url: publicUrl,
        avatar_position_x: cropPosition.x,
        avatar_position_y: cropPosition.y,
        avatar_scale: cropScale
      })
      setEditForm({ ...editForm, avatar_url: publicUrl })
      setShowAvatarCrop(false)
      setSelectedFile(null)
      setPreviewUrl('')
      setMessage('头像上传成功！')
      setTimeout(() => setMessage(''), 3000)
    } catch (error: any) {
      console.error('头像上传失败:', error)
      setMessage('头像上传失败: ' + error.message)
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleCancel = () => {
    if (userProfile) {
      setEditForm({
        full_name: userProfile.full_name || '',
        phone: userProfile.phone || '',
        email: userProfile.email || '',
        avatar_url: userProfile.avatar_url || '',
        handicap: userProfile.handicap || '',
        clothing_size: userProfile.clothing_size || '',
        vancouver_residence: userProfile.vancouver_residence || '',
        domestic_residence: userProfile.domestic_residence || '',
        main_club_membership: userProfile.main_club_membership || '',
        industry: userProfile.industry || '',
        golf_preferences: userProfile.golf_preferences || '',
        golf_motto: userProfile.golf_motto || '',
        other_interests: userProfile.other_interests || ''
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
              <div className="flex items-center space-x-6 p-6 bg-gradient-to-r from-golf-50 to-blue-50 rounded-xl border border-golf-100">
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-golf-600 rounded-full flex items-center justify-center overflow-hidden shadow-lg">
                    {userProfile.avatar_url ? (
                      <img 
                        src={userProfile.avatar_url} 
                        alt={userProfile.full_name}
                        className="w-full h-full object-cover"
                        style={{
                          objectPosition: `${userProfile.avatar_position_x || 50}% ${userProfile.avatar_position_y || 50}%`
                        }}
                      />
                    ) : (
                      <User className="w-10 h-10 text-white" />
                    )}
                  </div>
                  {isEditing && (
                    <div className="flex justify-center mt-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingAvatar}
                        className="w-8 h-8 bg-golf-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-golf-700 transition-colors disabled:opacity-50"
                        title={userProfile.avatar_url ? "更换头像" : "上传头像"}
                      >
                        {uploadingAvatar ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Camera className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {userProfile.full_name || '未设置姓名'}
                  </h3>
                  <p className="text-gray-600 mb-3">{user.email}</p>
                  <div className="flex items-center space-x-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getMembershipTypeColor(userProfile.membership_type)}`}>
                      {getMembershipTypeText(userProfile.membership_type)}
                    </span>
                    {userProfile.handicap && (
                      <span className="inline-block px-3 py-1 bg-golf-100 text-golf-700 rounded-full text-sm font-medium">
                        🏌️ 差点: {userProfile.handicap}
                      </span>
                    )}
                  </div>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-golf-600 text-white rounded-lg hover:bg-golf-700 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>编辑资料</span>
                  </button>
                )}
              </div>

              {/* 详细信息 */}
              <div className="grid md:grid-cols-2 gap-8">
                {/* 左侧：基本信息 */}
                <div className="space-y-6">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2 text-golf-600" />
                      基本信息
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Mail className="w-4 h-4 inline mr-2" />
                          邮箱地址
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg text-gray-700 border">
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
                          <div className="p-3 bg-gray-50 rounded-lg text-gray-700 border">
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
                          <div className="p-3 bg-gray-50 rounded-lg text-gray-700 border">
                            {userProfile.phone || '未设置'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 高尔夫信息 */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <span className="text-2xl mr-2">🏌️</span>
                      高尔夫信息
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          差点
                        </label>
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="54"
                            value={editForm.handicap}
                            onChange={(e) => setEditForm({ ...editForm, handicap: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golf-500 focus:border-transparent"
                            placeholder="18.5"
                          />
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-lg text-gray-700 border">
                            {userProfile.handicap || '未设置'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 右侧：会员信息和其他信息 */}
                <div className="space-y-6">

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      衣服尺码
                    </label>
                    {isEditing ? (
                      <select
                        value={editForm.clothing_size}
                        onChange={(e) => setEditForm({ ...editForm, clothing_size: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golf-500 focus:border-transparent"
                      >
                        <option value="">请选择尺码</option>
                        <option value="XS">XS</option>
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                        <option value="XXL">XXL</option>
                        <option value="XXXL">XXXL</option>
                      </select>
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        {userProfile.clothing_size || '未设置'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      行业
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.industry}
                        onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golf-500 focus:border-transparent"
                        placeholder="如：金融、科技、教育等"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        {userProfile.industry || '未设置'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      温哥华常驻地
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.vancouver_residence}
                        onChange={(e) => setEditForm({ ...editForm, vancouver_residence: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golf-500 focus:border-transparent"
                        placeholder="如：Richmond、Burnaby等"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        {userProfile.vancouver_residence || '未设置'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      国内常驻地
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.domestic_residence}
                        onChange={(e) => setEditForm({ ...editForm, domestic_residence: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golf-500 focus:border-transparent"
                        placeholder="如：北京、上海、深圳等"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        {userProfile.domestic_residence || '未设置'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      主球会会籍
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.main_club_membership}
                        onChange={(e) => setEditForm({ ...editForm, main_club_membership: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golf-500 focus:border-transparent"
                        placeholder="如：温哥华高尔夫俱乐部、列治文高尔夫俱乐部等"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        {userProfile.main_club_membership || '未设置'}
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* 多行文本字段 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    打球喜好
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editForm.golf_preferences}
                      onChange={(e) => setEditForm({ ...editForm, golf_preferences: e.target.value })}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golf-500 focus:border-transparent"
                      placeholder="如：喜欢挑战性球场、偏好早场打球等"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      {userProfile.golf_preferences || '未设置'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    高球座右铭
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.golf_motto}
                      onChange={(e) => setEditForm({ ...editForm, golf_motto: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golf-500 focus:border-transparent"
                      placeholder="如：享受每一杆，追求完美"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      {userProfile.golf_motto || '未设置'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    其他兴趣爱好
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editForm.other_interests}
                      onChange={(e) => setEditForm({ ...editForm, other_interests: e.target.value })}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golf-500 focus:border-transparent"
                      placeholder="如：网球、游泳、摄影、旅行等"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      {userProfile.other_interests || '未设置'}
                    </div>
                  )}
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

      {/* 头像裁剪预览 */}
      {showAvatarCrop && previewUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">调整头像裁剪</h3>
            
            <div className="mb-4">
              <div className="relative w-32 h-32 mx-auto border-2 border-gray-300 rounded-full overflow-hidden">
                <img 
                  src={previewUrl} 
                  alt="头像预览"
                  className="w-full h-full object-cover"
                  style={{
                    objectPosition: `${cropPosition.x}% ${cropPosition.y}%`,
                    transform: `scale(${cropScale / 100})`
                  }}
                />
                <div 
                  className="absolute w-2 h-2 bg-red-500 rounded-full border-2 border-white shadow-lg"
                  style={{
                    left: `${cropPosition.x}%`,
                    top: `${cropPosition.y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  水平位置: {cropPosition.x}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={cropPosition.x}
                  onChange={(e) => setCropPosition({ ...cropPosition, x: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  垂直位置: {cropPosition.y}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={cropPosition.y}
                  onChange={(e) => setCropPosition({ ...cropPosition, y: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  缩放大小: {cropScale}%
                </label>
                <input
                  type="range"
                  min="50"
                  max="200"
                  value={cropScale}
                  onChange={(e) => setCropScale(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>50%</span>
                  <span>100%</span>
                  <span>200%</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAvatarCrop(false)
                  setSelectedFile(null)
                  setPreviewUrl('')
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCropConfirm}
                disabled={uploadingAvatar}
                className="px-4 py-2 bg-golf-600 text-white rounded-lg hover:bg-golf-700 transition-colors disabled:opacity-50"
              >
                {uploadingAvatar ? '上传中...' : '确认上传'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}