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