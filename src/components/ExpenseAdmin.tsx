import React, { useState, useEffect, useRef } from 'react'
import { Plus, Edit, Trash2, Receipt, Calendar, DollarSign, Upload, X, Check, FileImage } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useModal } from './ModalProvider'

interface Expense {
  id: string
  expense_type: string
  title: string
  amount: number
  expense_date: string
  payment_method: string
  receipt_url: string | null
  notes: string | null
  status: string
  created_at: string
}

interface ExpenseFormData {
  expense_type: string
  title: string
  amount: string
  expense_date: string
  payment_method: string
  receipt_url: string
  notes: string
  status: string
}

interface UploadedFile {
  name: string
  url: string
}

export default function ExpenseAdmin() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [uploading, setUploading] = useState(false)
  const { confirmDelete, showSuccess, showError, showWarning } = useModal()
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<ExpenseFormData>({
    expense_type: 'equipment',
    title: '',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
    payment_method: 'transfer',
    receipt_url: '',
    notes: '',
    status: 'paid'
  })

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('expense_date', { ascending: false })

      if (error) throw error
      setExpenses(data || [])
    } catch (error) {
      console.error('获取费用记录失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const expenseData = {
        expense_type: formData.expense_type,
        title: formData.title,
        amount: parseFloat(formData.amount),
        expense_date: formData.expense_date,
        payment_method: formData.payment_method,
        receipt_url: formData.receipt_url || null,
        notes: formData.notes || null,
        status: formData.status
      }

      if (editingExpense) {
        const { error } = await supabase
          .from('expenses')
          .update(expenseData)
          .eq('id', editingExpense.id)

        if (error) throw error
        showSuccess('费用记录已更新！')
      } else {
        const { error } = await supabase
          .from('expenses')
          .insert([expenseData])

        if (error) throw error
        showSuccess('费用记录已添加！')
      }

      setShowForm(false)
      setEditingExpense(null)
      resetForm()
      fetchExpenses()
    } catch (error) {
      console.error('保存费用记录失败:', error)
      showError('保存失败，请重试')
    }
  }

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setFormData({
      expense_type: expense.expense_type,
      title: expense.title,
      amount: expense.amount.toString(),
      expense_date: expense.expense_date,
      payment_method: expense.payment_method,
      receipt_url: expense.receipt_url || '',
      notes: expense.notes || '',
      status: expense.status
    })

    if (expense.receipt_url) {
      const urls = expense.receipt_url.split(',')
      const files = urls.map((url, index) => ({
        name: `凭证 ${index + 1}`,
        url: url.trim()
      }))
      setUploadedFiles(files)
    } else {
      setUploadedFiles([])
    }

    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    confirmDelete('确定要删除这条费用记录吗？', async () => {
      try {
        const { error } = await supabase
          .from('expenses')
          .delete()
          .eq('id', id)

        if (error) throw error
        showSuccess('费用记录已删除')
        fetchExpenses()
      } catch (error) {
        console.error('删除失败:', error)
        showError('删除失败，请重试')
      }
    })
  }

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    try {
      setUploading(true)
      const newUploadedFiles: UploadedFile[] = []
      const errors: string[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        console.log('正在上传文件:', file.name, '大小:', file.size, '类型:', file.type)

        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `receipts/${fileName}`

        console.log('上传路径:', filePath)

        const { data, error: uploadError } = await supabase.storage
          .from('golf-club-images')
          .upload(`expenses/${filePath}`, file)

        if (uploadError) {
          console.error(`上传 ${file.name} 失败:`, uploadError)
          errors.push(`${file.name}: ${uploadError.message}`)
          continue
        }

        console.log('上传成功:', data)

        const { data: { publicUrl } } = supabase.storage
          .from('golf-club-images')
          .getPublicUrl(`expenses/${filePath}`)

        console.log('公开URL:', publicUrl)

        newUploadedFiles.push({
          name: file.name,
          url: publicUrl
        })
      }

      setUploadedFiles([...uploadedFiles, ...newUploadedFiles])

      if (newUploadedFiles.length > 0) {
        const allUrls = [...uploadedFiles, ...newUploadedFiles].map(f => f.url).join(',')
        setFormData({ ...formData, receipt_url: allUrls })
      }

      if (errors.length > 0) {
        showWarning(`部分文件上传失败:\n${errors.join('\n')}\n\n成功上传 ${newUploadedFiles.length} 个文件`)
      } else if (newUploadedFiles.length > 0) {
        showSuccess(`成功上传 ${newUploadedFiles.length} 个文件！`)
      } else {
        showWarning('没有文件被上传。请查看控制台了解详细错误信息。')
      }
    } catch (error) {
      console.error('上传失败:', error)
      showError(`上传失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setUploading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files)
    }
  }

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index)
    setUploadedFiles(newFiles)
    const newUrls = newFiles.map(f => f.url).join(',')
    setFormData({ ...formData, receipt_url: newUrls })
  }

  const resetForm = () => {
    setFormData({
      expense_type: 'equipment',
      title: '',
      amount: '',
      expense_date: new Date().toISOString().split('T')[0],
      payment_method: 'transfer',
      receipt_url: '',
      notes: '',
      status: 'paid'
    })
    setUploadedFiles([])
  }

  const getExpenseTypeText = (type: string) => {
    switch (type) {
      case 'equipment': return '设备采购'
      case 'maintenance': return '场地维护'
      case 'activity': return '活动支出'
      case 'salary': return '人员工资'
      case 'other': return '其他费用'
      default: return type
    }
  }

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'cash': return '现金'
      case 'transfer': return '转账'
      case 'check': return '支票'
      default: return method
    }
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN')
  }

  const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount.toString()), 0)

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">费用管理</h2>
          <p className="text-gray-600 mt-1">管理俱乐部所有费用支出记录</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingExpense(null)
            resetForm()
          }}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          添加费用
        </button>
      </div>

      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-green-100 mb-1">总支出金额</div>
            <div className="text-3xl font-bold">{formatAmount(totalExpenses)}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-green-100 mb-1">总记录数</div>
            <div className="text-3xl font-bold">{expenses.length}</div>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  {editingExpense ? '编辑费用' : '添加费用'}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false)
                    setEditingExpense(null)
                    resetForm()
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    费用类型 *
                  </label>
                  <select
                    value={formData.expense_type}
                    onChange={(e) => setFormData({ ...formData, expense_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="equipment">设备采购</option>
                    <option value="maintenance">场地维护</option>
                    <option value="activity">活动支出</option>
                    <option value="salary">人员工资</option>
                    <option value="other">其他费用</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    费用标题 *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      金额 (CAD) *
                    </label>
                    <input
                      type="text"
                      value={formData.amount}
                      onChange={(e) => {
                        const value = e.target.value
                        // 只允许数字和小数点
                        if (/^[0-9]*\.?[0-9]*$/.test(value) || value === '') {
                          setFormData({ ...formData, amount: value })
                        }
                      }}
                      onWheel={(e) => e.currentTarget.blur()}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="请输入金额，如：123.45"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      支出日期 *
                    </label>
                    <input
                      type="date"
                      value={formData.expense_date}
                      onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      支付方式 *
                    </label>
                    <select
                      value={formData.payment_method}
                      onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    >
                      <option value="cash">现金</option>
                      <option value="transfer">转账</option>
                      <option value="check">支票</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      状态 *
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    >
                      <option value="paid">已支付</option>
                      <option value="pending">待支付</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    支付凭证（支持多个文件）
                  </label>
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
                      dragActive
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 bg-gray-50'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,application/pdf"
                      multiple
                      onChange={(e) => handleFileUpload(e.target.files)}
                      className="hidden"
                      disabled={uploading}
                    />
                    <div className="text-center">
                      <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-sm text-gray-600 mb-2">
                        {uploading ? '上传中...' : '拖拽文件到这里或'}
                      </p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="text-sm text-green-600 hover:text-green-700 font-medium"
                      >
                        选择文件
                      </button>
                      <p className="text-xs text-gray-500 mt-2">
                        支持 JPG、PNG、PDF 格式，可选择多个文件
                      </p>
                    </div>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium text-gray-700">已上传文件：</p>
                      {uploadedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-200"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <FileImage className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {file.name}
                              </p>
                              <a
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline"
                              >
                                查看文件
                              </a>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    备注
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    {editingExpense ? '更新费用' : '添加费用'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingExpense(null)
                      resetForm()
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    取消
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">类型</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">标题</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">金额</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">日期</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">支付方式</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getExpenseTypeText(expense.expense_type)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{expense.title}</div>
                    {expense.notes && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">{expense.notes}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-red-600">
                      {formatAmount(parseFloat(expense.amount.toString()))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(expense.expense_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {getPaymentMethodText(expense.payment_method)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      expense.status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {expense.status === 'paid' ? '已支付' : '待支付'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      {expense.receipt_url && (
                        <a
                          href={expense.receipt_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Receipt className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={() => handleEdit(expense)}
                        className="text-green-600 hover:text-green-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {expenses.length === 0 && (
        <div className="text-center py-12">
          <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无费用记录</h3>
          <p className="text-gray-600">点击"添加费用"按钮创建第一条费用记录</p>
        </div>
      )}
    </div>
  )
}
