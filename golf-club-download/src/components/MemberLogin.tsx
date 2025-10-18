import React, { useState } from 'react'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface MemberLoginProps {
  onLoginSuccess: () => void
}

export default function MemberLogin({ onLoginSuccess }: MemberLoginProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setFullName('')
    setPhone('')
    setShowPassword(false)
    setRememberMe(false)
    setMessage('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin
        })
        if (error) throw error
        setMessage('重置邮件已发送，请检查您的邮箱。')
      } else if (mode === 'register') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}`
          }
        })
        if (error) throw error
        
        if (data.user && !data.session) {
          setMessage('注册成功！请检查您的邮箱，点击验证链接完成注册。验证后请返回此页面登录。')
        } else if (data.session) {
          setMessage('注册成功！')
          onLoginSuccess()
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        
        // 如果选择了记住我，保存到localStorage
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email)
        } else {
          localStorage.removeItem('rememberedEmail')
        }
        
        onLoginSuccess()
      }
    } catch (error: any) {
      if (error.message === 'Email not confirmed') {
        setMessage('邮箱尚未验证。请检查您的邮箱（包括垃圾邮件文件夹），点击验证链接后再次登录。')
      } else if (error.message === 'Invalid login credentials' || error.message.includes('invalid_credentials')) {
        setMessage('登录失败：邮箱或密码错误。请检查您的邮箱和密码是否正确，或使用"忘记密码"功能重置密码。')
      } else if (error.message === 'User already registered') {
        setMessage('该邮箱已注册，请直接登录或使用其他邮箱。')
      } else if (error.message.includes('already_registered') || error.message.includes('email_address_already_in_use')) {
        setMessage('该邮箱已注册，请直接登录。')
      } else if (error.message.includes('Email rate limit exceeded')) {
        setMessage('邮件发送过于频繁，请稍后再试。')
      } else {
        console.error('Authentication error:', error)
        setMessage('登录失败，请检查网络连接或稍后重试。如果问题持续存在，请联系管理员。')
      }
    } finally {
      setLoading(false)
    }
  }

  // 组件加载时检查是否有记住的邮箱
  React.useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail')
    if (rememberedEmail) {
      setEmail(rememberedEmail)
      setRememberMe(true)
    }
  }, [])

  const getTitle = () => {
    switch (mode) {
      case 'register': return '会员注册'
      case 'forgot': return '重置密码'
      default: return '会员登录'
    }
  }

  const getSubtitle = () => {
    switch (mode) {
      case 'register': return '加入绿茵高尔夫俱乐部'
      case 'forgot': return '输入您的邮箱地址，我们将发送重置链接'
      default: return '欢迎回到绿茵高尔夫俱乐部'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Left Side - Brand Info */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 lg:px-8">
        <div className="max-w-md text-center">
          {/* Logo */}
          <div className="w-24 h-24 lg:w-32 lg:h-32 bg-golf-600 rounded-full flex items-center justify-center mx-auto mb-6 lg:mb-8">
            <span className="text-4xl lg:text-6xl font-bold text-white">B</span>
          </div>
          
          {/* Brand Name */}
          <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-2">绿茵高尔夫俱乐部</h1>
          <p className="text-golf-600 text-base lg:text-lg mb-6 lg:mb-8">绿色高尔夫俱乐部</p>
          
          {/* Description */}
          <p className="text-gray-600 text-base lg:text-lg leading-relaxed mb-8 lg:mb-12 hidden lg:block">
            享受顶级高尔夫体验，结识同道合的球友，提升您的球技水平
          </p>
          
          {/* Stats */}
          <div className="flex justify-center space-x-8 lg:space-x-16">
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold text-golf-600 mb-1">500+</div>
              <div className="text-sm lg:text-base text-gray-600">积极会员</div>
            </div>
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold text-blue-600 mb-1">18洞</div>
              <div className="text-sm lg:text-base text-gray-600">锦标球场</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 lg:px-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
            <div className="text-center mb-8">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">{getTitle()}</h2>
              <p className="text-sm lg:text-base text-gray-600">{getSubtitle()}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
              {mode === 'register' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      姓名
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golf-500 focus:border-transparent transition-colors"
                      placeholder="请输入您的姓名"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      手机号码
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golf-500 focus:border-transparent transition-colors"
                      placeholder="请输入您的手机号码"
                      required
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  邮箱地址
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golf-500 focus:border-transparent transition-colors"
                    placeholder="请输入您的邮箱"
                    required
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    密码
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golf-500 focus:border-transparent transition-colors"
                      placeholder="请输入您的密码"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}

              {mode === 'login' && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-golf-600 focus:ring-golf-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                     记住邮箱
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-sm text-golf-600 hover:text-golf-700"
                  >
                    忘记密码？
                  </button>
                </div>
              )}

              {message && (
                <div className={`p-4 rounded-lg text-sm ${
                  message.includes('成功') || message.includes('已发送')
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-red-100 text-red-700 border border-red-200'
                }`}>
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-golf-600 hover:bg-golf-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 
                  (mode === 'register' ? '注册中...' : mode === 'forgot' ? '发送中...' : '登录中...') : 
                  (mode === 'register' ? '注册' : mode === 'forgot' ? '发送重置邮件' : '登录')
                }
              </button>
            </form>

            <div className="mt-6 text-center">
              {/* 重新发送验证邮件按钮 */}
              {message.includes('验证邮件') && mode === 'register' && (
                <div className="mb-4">
                  <button
                    onClick={async () => {
                      if (email) {
                        setLoading(true)
                        try {
                          const { error } = await supabase.auth.resend({
                            type: 'signup',
                            email: email,
                            options: {
                              emailRedirectTo: `${window.location.origin}`
                            }
                          })
                          if (error) throw error
                          setMessage('验证邮件已重新发送！请检查您的邮箱（包括垃圾邮件文件夹）。')
                        } catch (error: any) {
                          if (error.message.includes('Email rate limit exceeded')) {
                            setMessage('邮件发送过于频繁，请稍后再试。')
                          } else {
                            setMessage('重新发送失败，请稍后重试。可能邮箱验证功能已被禁用，请尝试直接登录。')
                          }
                        } finally {
                          setLoading(false)
                        }
                      }
                    }}
                    className="text-golf-600 hover:text-golf-700 text-sm underline"
                    disabled={loading || !email}
                  >
                    重新发送验证邮件
                  </button>
                </div>
              )}
              
              {mode === 'forgot' ? (
                <p className="text-sm text-gray-600">
                  记起密码了？
                  <button 
                    onClick={() => {
                      setMode('login')
                      resetForm()
                    }}
                    className="text-golf-600 hover:text-golf-700 font-medium ml-1"
                  >
                    返回登录
                  </button>
                </p>
              ) : (
                <p className="text-sm text-gray-600">
                  {mode === 'register' ? '已有账户？' : '还不是会员？'}
                  <button 
                    onClick={() => {
                      setMode(mode === 'register' ? 'login' : 'register')
                      resetForm()
                    }}
                    className="text-golf-600 hover:text-golf-700 font-medium ml-1"
                  >
                    {mode === 'register' ? '立即登录' : '立即注册'}
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}