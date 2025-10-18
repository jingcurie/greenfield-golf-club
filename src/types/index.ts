export interface User {
  id: string
  email: string
  full_name?: string
  phone?: string
  membership_type?: 'standard' | 'premium' | 'vip'
  membership_status?: 'active' | 'inactive' | 'suspended'
  join_date?: string
  avatar_url?: string
}

export interface Booking {
  id: string
  user_id: string
  course_id: string
  booking_date: string
  start_time: string
  end_time: string
  players_count: number
  status: 'confirmed' | 'pending' | 'cancelled'
  created_at: string
}

export interface Course {
  id: string
  name: string
  description?: string
  holes: number
  par: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  price_per_round: number
  image_url?: string
  is_active: boolean
}

export interface Event {
  id: string
  title: string
  description?: string
  start_time: string
  end_time: string
  location: string
  fee: number
  max_participants: number
  registration_deadline: string
  rules?: string
  image_url?: string
  payment_qr_code?: string
  payment_emt_email?: string
  payment_instructions?: string
  status: 'active' | 'cancelled' | 'completed'
  created_at: string
  // 文章相关字段
  article_content?: string
  article_published?: boolean
  article_published_at?: string
  article_author_id?: string
  article_excerpt?: string
  article_featured_image_url?: string
}

export interface EventRegistration {
  id: string
  event_id: string
  user_id: string
  payment_status: 'pending' | 'paid' | 'refunded'
  registration_time: string
  notes?: string
  status: 'registered' | 'cancelled'
  approval_status: 'pending' | 'approved' | 'rejected'
  approval_time?: string
  approved_by?: string
  approval_notes?: string
  payment_proof?: string // 支付证明图片URL
  user_profiles?: {
    full_name: string
    email: string
    phone?: string
  }
}

export interface EventStats {
  total_registrations: number
  paid_registrations: number
  available_spots: number
}