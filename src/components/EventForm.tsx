import React, { useState, useEffect } from 'react'
import { X, Calendar, MapPin, DollarSign, Users, FileText, Image as ImageIcon, Upload } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Event } from '../types'

interface EventFormProps {
  event?: Event | null
  onClose: () => void
  onSuccess?: () => void
}

export default function EventForm({ event, onClose, onSuccess }: EventFormProps) {
  const [qrCodeFile, setQrCodeFile] = useState<File | null>(null)
  const [qrCodePreview, setQrCodePreview] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    location: '',
    fee: 0,
    max_participants: 50,
    registration_deadline: '',
    rules: '',
    image_url: '',
    payment_qr_code: '',
    payment_emt_email: '',
    payment_instructions: '',
    status: 'upcoming'
  })

  // 初始化表单数据
  useEffect(() => {
    if (event) {
      // 编辑模式 - 填充现有数据
      console.log('编辑事件数据:', event)
      
      // 格式化日期为 datetime-local 格式
      const formatDateTime = (dateString: string) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        // 使用本地时间，避免时区转换问题
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        return `${year}-${month}-${day}T${hours}:${minutes}`
      }
      
      setFormData({
        title: event.title || '',
        description: event.description || '',
        start_time: formatDateTime(event.start_time),
        end_time: formatDateTime(event.end_time),
        location: event.location || '',
        fee: event.fee || 0,
        max_participants: event.max_participants || 50,
        registration_deadline: formatDateTime(event.registration_deadline),
        rules: event.rules || '',
        image_url: event.image_url || '',
        payment_qr_code: event.payment_qr_code || '',
        payment_emt_email: event.payment_emt_email || '',
        payment_instructions: event.payment_instructions || '',
        status: event.status || 'upcoming'
      })
      
      // 如果有现有的二维码，设置预览
      if (event.payment_qr_code) {
        setQrCodePreview(event.payment_qr_code)
      }
    } else {
      // 创建模式 - 重置为默认值
      setFormData({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        location: '',
        fee: 0,
        max_participants: 50,
        registration_deadline: '',
        rules: '',
        image_url: '',
        payment_qr_code: '',
        payment_emt_email: '',
        payment_instructions: '',
        status: 'upcoming'
      })
      setQrCodePreview('')
    }
  }, [event])

  const handleQRCodeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    
    if (file) {
      setQrCodeFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setQrCodePreview(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      let qrCodeUrl = ''

      // 如果有二维码文件，先上传到存储
      if (qrCodeFile && supabase) {
        const fileExt = qrCodeFile.name.split('.').pop()
        const fileName = `qr-codes/${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('poster-images')
          .upload(fileName, qrCodeFile)

        if (uploadError) {
          console.error('上传二维码失败:', uploadError)
          throw new Error('上传二维码失败')
        }

        const { data: { publicUrl } } = supabase.storage
          .from('poster-images')
          .getPublicUrl(fileName)

        qrCodeUrl = publicUrl
      }

      // 准备事件数据
      const eventData = {
        title: formData.title,
        description: formData.description,
        start_time: formData.start_time ? new Date(formData.start_time + ':00').toISOString() : null,
        end_time: formData.end_time ? new Date(formData.end_time + ':00').toISOString() : null,
        location: formData.location,
        fee: formData.fee,
        max_participants: formData.max_participants,
        registration_deadline: formData.registration_deadline ? new Date(formData.registration_deadline + ':00').toISOString() : null,
        rules: formData.rules,
        image_url: formData.image_url,
        payment_qr_code: qrCodeUrl,
        payment_emt_email: formData.payment_emt_email,
        payment_instructions: formData.payment_instructions,
        status: formData.status
      }


      // 插入或更新事件数据
      if (!supabase) {
        throw new Error('Supabase未初始化')
      }

      let data, error

      if (event) {
        // 编辑模式 - 更新事件
        const { data: updateData, error: updateError } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', event.id)
          .select()

        data = updateData
        error = updateError

        if (error) {
          console.error('更新事件失败:', error)
          throw new Error('更新事件失败')
        }
      } else {
        // 创建模式 - 插入事件
        const { data: insertData, error: insertError } = await supabase
          .from('events')
          .insert([eventData])
          .select()

        data = insertData
        error = insertError

        if (error) {
          console.error('创建事件失败:', error)
          throw new Error('创建事件失败')
        }
      }
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('提交失败:', error)
      alert('创建活动失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {event ? '编辑活动' : '创建活动'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 基本信息 */}
            <div className="space-y-6">
              {/* 活动标题 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  活动标题 *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                  placeholder="请输入活动标题"
                  required
                />
              </div>

              {/* 活动描述 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  活动描述
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows={8}
                  placeholder="请输入活动描述..."
                />
              </div>
            </div>

            {/* 时间和地点信息 */}
            <div className="space-y-6 mt-8">
              {/* 时间信息 */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* 开始时间 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    开始时间 *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                {/* 结束时间 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    结束时间 *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              {/* 活动地点 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  活动地点 *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="input-field"
                  placeholder="请输入活动地点"
                  required
                />
              </div>
            </div>

            {/* 费用和人数信息 */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* 报名费用 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  报名费用 *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.fee === 0 ? '' : formData.fee}
                  onChange={(e) => setFormData({ ...formData, fee: parseFloat(e.target.value) || 0 })}
                  className="input-field"
                  placeholder="0.00"
                  required
                />
              </div>

              {/* 最大参与人数 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-2" />
                  最大参与人数 *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.max_participants === 50 ? '' : formData.max_participants}
                  onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) || 50 })}
                  className="input-field"
                  placeholder="50"
                  required
                />
              </div>
            </div>

            {/* 截止时间和图片 */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* 报名截止时间 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  报名截止时间 *
                </label>
                <input
                  type="datetime-local"
                  value={formData.registration_deadline}
                  onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              {/* 活动图片URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <ImageIcon className="w-4 h-4 inline mr-2" />
                  活动图片URL
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="input-field"
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  留空将使用默认图片
                </p>
              </div>
            </div>

            {/* 活动规则 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                活动规则
              </label>
              <textarea
                value={formData.rules}
                onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                className="input-field"
                rows={6}
                placeholder="请输入活动规则和注意事项..."
              />
            </div>

            {/* 活动状态 */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  活动状态
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="input-field"
                >
                  <option value="upcoming">未开始</option>
                  <option value="active">进行中</option>
                  <option value="completed">已完成</option>
                  <option value="cancelled">已取消</option>
                </select>
              </div>
              <div>
                {/* 空占位符，保持布局平衡 */}
              </div>
            </div>

            {/* 支付信息 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                支付信息
              </h3>
              
              <div className="space-y-6">
                {/* 缴费二维码 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <ImageIcon className="w-4 h-4 inline mr-2" />
                    缴费二维码图片
                  </label>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleQRCodeFileChange}
                      className="hidden"
                      id="event-form-qr-upload"
                    />
                    <label htmlFor="event-form-qr-upload" className="cursor-pointer block">
                      {qrCodePreview ? (
                        <div>
                          <img
                            src={qrCodePreview}
                            alt="二维码预览"
                            className="max-w-full max-h-48 mx-auto mb-2 rounded-lg"
                            onLoad={() => console.log('图片加载成功')}
                            onError={() => console.log('图片加载失败')}
                          />
                          <p className="text-sm text-gray-600">点击更换二维码</p>
                        </div>
                      ) : (
                        <div>
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600 mb-1">点击上传支付二维码</p>
                          <p className="text-xs text-gray-500">支持 JPG、PNG 格式</p>
                        </div>
                      )}
                    </label>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-1">
                    上传微信或支付宝二维码图片，用户报名时会显示
                  </p>
                </div>

                {/* EMT邮箱 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    EMT邮箱地址
                  </label>
                  <input
                    type="email"
                    value={formData.payment_emt_email}
                    onChange={(e) => setFormData({ ...formData, payment_emt_email: e.target.value })}
                    className="input-field"
                    placeholder="example@email.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    用户可以通过EMT转账到此邮箱
                  </p>
                </div>

                {/* 支付说明 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    支付说明
                  </label>
                  <textarea
                    value={formData.payment_instructions}
                    onChange={(e) => setFormData({ ...formData, payment_instructions: e.target.value })}
                    className="input-field"
                    rows={3}
                    placeholder="请输入支付说明和注意事项..."
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (event ? '更新中...' : '创建中...') : (event ? '更新活动' : '创建活动')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}