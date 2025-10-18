import React from 'react'
import { Calendar, Users, Trophy, Shield, Clock, Star } from 'lucide-react'

const features = [
  {
    icon: Calendar,
    title: '在线预订系统',
    description: '24小时在线预订，实时查看球场空位，灵活安排您的高尔夫时光。',
    color: 'bg-blue-500'
  },
  {
    icon: Users,
    title: '会员专属服务',
    description: '专业教练指导，个性化训练计划，提升您的高尔夫技艺。',
    color: 'bg-golf-500'
  },
  {
    icon: Trophy,
    title: '赛事活动',
    description: '定期举办会员比赛和交流活动，结识志同道合的球友。',
    color: 'bg-yellow-500'
  },
  {
    icon: Shield,
    title: '安全保障',
    description: '完善的安全措施和保险保障，让您安心享受高尔夫乐趣。',
    color: 'bg-red-500'
  },
  {
    icon: Clock,
    title: '灵活时间',
    description: '早6点至晚10点开放，适应您的时间安排，随时享受运动。',
    color: 'bg-purple-500'
  },
  {
    icon: Star,
    title: '五星服务',
    description: '专业服务团队，从球童到餐饮，为您提供五星级体验。',
    color: 'bg-orange-500'
  }
]

export default function Features() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            为什么选择绿茵高尔夫俱乐部？
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            我们致力于为每一位会员提供最专业、最舒适的高尔夫体验，让您在绿茵场上尽情挥洒激情。
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="group p-8 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300 border border-transparent hover:border-gray-200"
              >
                <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-golf-600 to-golf-700 rounded-2xl p-8 lg:p-12">
            <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4">
              准备开始您的高尔夫之旅了吗？
            </h3>
            <p className="text-golf-100 text-lg mb-8 max-w-2xl mx-auto">
              加入我们的会员大家庭，享受专业的高尔夫体验和优质的服务。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-golf-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors">
                申请会员资格
              </button>
              <button className="border-2 border-white text-white hover:bg-white hover:text-golf-600 font-semibold py-3 px-8 rounded-lg transition-colors">
                预约参观球场
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}