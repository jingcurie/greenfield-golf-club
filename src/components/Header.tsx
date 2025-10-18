import React from 'react'
import { Menu, X, User, Calendar, Trophy, Settings } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import AuthModal from './AuthModal'
import BookingModal from './BookingModal'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const [authModal, setAuthModal] = React.useState<{
    isOpen: boolean
    mode: 'login' | 'register'
  }>({ isOpen: false, mode: 'login' })
  const [bookingModal, setBookingModal] = React.useState(false)
  
  const { user, loading, signOut } = useAuth()

  const openAuthModal = (mode: 'login' | 'register') => {
    setAuthModal({ isOpen: true, mode })
  }

  const openBookingModal = () => {
    if (!user) {
      openAuthModal('login')
    } else {
      setBookingModal(true)
    }
  }

  const closeAuthModal = () => {
    setAuthModal({ isOpen: false, mode: 'login' })
  }
  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-10 h-10 bg-golf-600 rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">绿茵高尔夫俱乐部</h1>
                <p className="text-xs text-gray-500">Greenfield Golf Club</p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-gray-700 hover:text-golf-600 px-3 py-2 text-sm font-medium transition-colors">
              首页
            </a>
            <a href="#" className="text-gray-700 hover:text-golf-600 px-3 py-2 text-sm font-medium transition-colors">
              球场预订
            </a>
            <a href="#" className="text-gray-700 hover:text-golf-600 px-3 py-2 text-sm font-medium transition-colors">
              会员中心
            </a>
            <a href="#" className="text-gray-700 hover:text-golf-600 px-3 py-2 text-sm font-medium transition-colors">
              活动赛事
            </a>
            <a href="#" className="text-gray-700 hover:text-golf-600 px-3 py-2 text-sm font-medium transition-colors">
              关于我们
            </a>
          </nav>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="text-gray-500">加载中...</div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">
                  欢迎，{user.email}
                </span>
                <button 
                  onClick={signOut}
                  className="btn-secondary"
                >
                  退出登录
                </button>
                <button 
                  onClick={openBookingModal}
                  className="btn-primary"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  立即预订
                </button>
              </div>
            ) : (
              <>
                <button 
                  onClick={() => openAuthModal('login')}
                  className="btn-secondary"
                >
                  <User className="w-4 h-4 mr-2" />
                  登录
                </button>
                <button 
                  onClick={() => openAuthModal('register')}
                  className="btn-primary"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  立即注册
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-golf-600 p-2"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-2">
              <a href="#" className="text-gray-700 hover:text-golf-600 px-3 py-2 text-sm font-medium">
                首页
              </a>
              <a href="#" className="text-gray-700 hover:text-golf-600 px-3 py-2 text-sm font-medium">
                球场预订
              </a>
              <a href="#" className="text-gray-700 hover:text-golf-600 px-3 py-2 text-sm font-medium">
                会员中心
              </a>
              <a href="#" className="text-gray-700 hover:text-golf-600 px-3 py-2 text-sm font-medium">
                活动赛事
              </a>
              <a href="#" className="text-gray-700 hover:text-golf-600 px-3 py-2 text-sm font-medium">
                关于我们
              </a>
              {!loading && (
                <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                  {user ? (
                    <>
                      <div className="text-center text-gray-700 py-2">
                        欢迎，{user.email}
                      </div>
                      <button 
                        onClick={signOut}
                        className="btn-secondary justify-center"
                      >
                        退出登录
                      </button>
                      <button 
                        onClick={openBookingModal}
                        className="btn-primary justify-center"
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        立即预订
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => openAuthModal('login')}
                        className="btn-secondary justify-center"
                      >
                        <User className="w-4 h-4 mr-2" />
                        登录
                      </button>
                      <button 
                        onClick={() => openAuthModal('register')}
                        className="btn-primary justify-center"
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        立即注册
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      </header>

      <AuthModal
        isOpen={authModal.isOpen}
        onClose={closeAuthModal}
        mode={authModal.mode}
        onModeChange={(mode) => setAuthModal({ isOpen: true, mode })}
      />
      <BookingModal
        isOpen={bookingModal}
        onClose={() => setBookingModal(false)}
        user={user}
      />
    </>
  )
}