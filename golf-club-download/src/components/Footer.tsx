import React from 'react'
import { MapPin, Phone, Mail, Clock, Trophy } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-golf-600 rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-bold">绿茵高尔夫俱乐部</h3>
                <p className="text-sm text-gray-400">Greenfield Golf Club</p>
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed">
              专业的高尔夫体验，优质的会员服务。在这里，每一杆都是艺术，每一场都是享受。
            </p>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">联系我们</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-golf-400" />
                <span className="text-gray-300">北京市朝阳区高尔夫路88号</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-golf-400" />
                <span className="text-gray-300">400-888-9999</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-golf-400" />
                <span className="text-gray-300">info@greenfield-golf.com</span>
              </div>
            </div>
          </div>

          {/* Operating Hours */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">营业时间</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-golf-400" />
                <div>
                  <div className="text-gray-300">周一至周五</div>
                  <div className="text-sm text-gray-400">06:00 - 22:00</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-golf-400" />
                <div>
                  <div className="text-gray-300">周末及节假日</div>
                  <div className="text-sm text-gray-400">05:30 - 22:30</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">快速链接</h4>
            <div className="space-y-2">
              <a href="#" className="block text-gray-300 hover:text-golf-400 transition-colors">
                球场预订
              </a>
              <a href="#" className="block text-gray-300 hover:text-golf-400 transition-colors">
                会员中心
              </a>
              <a href="#" className="block text-gray-300 hover:text-golf-400 transition-colors">
                活动赛事
              </a>
              <a href="#" className="block text-gray-300 hover:text-golf-400 transition-colors">
                教练服务
              </a>
              <a href="#" className="block text-gray-300 hover:text-golf-400 transition-colors">
                联系我们
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 绿茵高尔夫俱乐部. 保留所有权利.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-golf-400 text-sm transition-colors">
              隐私政策
            </a>
            <a href="#" className="text-gray-400 hover:text-golf-400 text-sm transition-colors">
              服务条款
            </a>
            <a href="#" className="text-gray-400 hover:text-golf-400 text-sm transition-colors">
              网站地图
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}