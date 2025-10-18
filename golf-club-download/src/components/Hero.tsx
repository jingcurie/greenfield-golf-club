import React from 'react'
import { Calendar, MapPin, Star, ArrowRight } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

interface HeroProps {
  onBookingClick: () => void
}

export default function Hero({ onBookingClick }: HeroProps) {
  const { user } = useAuth()

  return (
    <section className="relative bg-gradient-to-br from-golf-50 to-golf-100 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-golf-600">
                <Star className="w-5 h-5 fill-current" />
                <span className="text-sm font-medium">五星级高尔夫体验</span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                欢迎来到
                <span className="text-golf-600 block">绿茵高尔夫俱乐部</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                享受专业级18洞球场，体验顶级会员服务。在这里，每一杆都是艺术，每一场都是享受。
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={onBookingClick}
                className="btn-primary text-lg px-8 py-4 group"
              >
                <Calendar className="w-5 h-5 mr-2" />
                立即预订球场
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="btn-secondary text-lg px-8 py-4">
                了解会员权益
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-golf-200">
              <div className="text-center">
                <div className="text-3xl font-bold text-golf-600">18</div>
                <div className="text-sm text-gray-600">专业球洞</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-golf-600">500+</div>
                <div className="text-sm text-gray-600">会员数量</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-golf-600">15</div>
                <div className="text-sm text-gray-600">年专业经验</div>
              </div>
            </div>
          </div>

          {/* Right Content - Image */}
          <div className="relative">
            <div className="aspect-[4/3] bg-gradient-to-br from-golf-200 to-golf-300 rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.pexels.com/photos/1325735/pexels-photo-1325735.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="高尔夫球场"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Floating Card */}
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <div className="flex items-center space-x-3">
                <MapPin className="w-8 h-8 text-golf-600" />
                <div>
                  <div className="font-semibold text-gray-900">球场位置</div>
                  <div className="text-sm text-gray-600">市中心30分钟车程</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}