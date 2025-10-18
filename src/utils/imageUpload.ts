import { supabase } from '../lib/supabase'

export interface ImageUploadResult {
  success: boolean
  url?: string
  error?: string
}

export const uploadImageToSupabase = async (
  file: File,
  bucketName: string = 'event-images',
  folderPath: string = 'articles-images'
): Promise<ImageUploadResult> => {
  try {
    // 生成唯一文件名
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop() || 'jpg'
    const fileName = `${timestamp}_${randomString}.${fileExtension}`
    
    // 构建完整路径
    const fullPath = `${folderPath}/${fileName}`
    
    // 上传文件到 Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fullPath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('上传图片失败:', error)
      return {
        success: false,
        error: error.message
      }
    }

    // 获取公开访问的 URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fullPath)

    return {
      success: true,
      url: urlData.publicUrl
    }
  } catch (error) {
    console.error('上传图片异常:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '上传失败'
    }
  }
}

// 验证文件类型
export const validateImageFile = (file: File): boolean => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  const maxSize = 5 * 1024 * 1024 // 5MB
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('只支持 JPG、PNG、GIF、WebP 格式的图片')
  }
  
  if (file.size > maxSize) {
    throw new Error('图片大小不能超过 5MB')
  }
  
  return true
}
