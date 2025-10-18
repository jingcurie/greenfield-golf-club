import React, { createContext, useContext, useState, useCallback } from 'react'
import { Alert, Confirm } from './Modal'

interface AlertOptions {
  title: string
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  confirmText?: string
  onConfirm?: () => void
}

interface ConfirmOptions {
  title: string
  message: string
  type?: 'warning' | 'danger' | 'info'
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
}

interface ModalContextType {
  showAlert: (options: AlertOptions) => void
  showConfirm: (options: ConfirmOptions) => void
  showSuccess: (message: string, title?: string) => void
  showError: (message: string, title?: string) => void
  showWarning: (message: string, title?: string) => void
  showInfo: (message: string, title?: string) => void
  confirmDelete: (message: string, onConfirm: () => void, title?: string) => void
  confirmAction: (message: string, onConfirm: () => void, title?: string) => void
}

const ModalContext = createContext<ModalContextType | null>(null)

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [alertState, setAlertState] = useState<{
    isOpen: boolean
    options: AlertOptions | null
  }>({
    isOpen: false,
    options: null
  })

  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean
    options: ConfirmOptions | null
  }>({
    isOpen: false,
    options: null
  })

  const showAlert = useCallback((options: AlertOptions) => {
    setAlertState({
      isOpen: true,
      options
    })
  }, [])

  const showConfirm = useCallback((options: ConfirmOptions) => {
    setConfirmState({
      isOpen: true,
      options
    })
  }, [])

  const closeAlert = useCallback(() => {
    setAlertState({
      isOpen: false,
      options: null
    })
  }, [])

  const closeConfirm = useCallback(() => {
    setConfirmState({
      isOpen: false,
      options: null
    })
  }, [])

  // 便捷方法
  const showSuccess = useCallback((message: string, title = '成功') => {
    showAlert({ title, message, type: 'success' })
  }, [showAlert])

  const showError = useCallback((message: string, title = '错误') => {
    showAlert({ title, message, type: 'error' })
  }, [showAlert])

  const showWarning = useCallback((message: string, title = '警告') => {
    showAlert({ title, message, type: 'warning' })
  }, [showAlert])

  const showInfo = useCallback((message: string, title = '提示') => {
    showAlert({ title, message, type: 'info' })
  }, [showAlert])

  const confirmDelete = useCallback((message: string, onConfirm: () => void, title = '确认删除') => {
    showConfirm({
      title,
      message,
      type: 'danger',
      confirmText: '删除',
      cancelText: '取消',
      onConfirm
    })
  }, [showConfirm])

  const confirmAction = useCallback((message: string, onConfirm: () => void, title = '确认操作') => {
    showConfirm({
      title,
      message,
      type: 'warning',
      confirmText: '确定',
      cancelText: '取消',
      onConfirm
    })
  }, [showConfirm])

  const contextValue: ModalContextType = {
    showAlert,
    showConfirm,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    confirmDelete,
    confirmAction
  }

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
      
      {/* Alert Modal */}
      {alertState.options && (
        <Alert
          isOpen={alertState.isOpen}
          onClose={closeAlert}
          title={alertState.options.title}
          message={alertState.options.message}
          type={alertState.options.type}
          confirmText={alertState.options.confirmText}
          onConfirm={alertState.options.onConfirm}
        />
      )}
      
      {/* Confirm Modal */}
      {confirmState.options && (
        <Confirm
          isOpen={confirmState.isOpen}
          onClose={closeConfirm}
          title={confirmState.options.title}
          message={confirmState.options.message}
          type={confirmState.options.type}
          confirmText={confirmState.options.confirmText}
          cancelText={confirmState.options.cancelText}
          onConfirm={confirmState.options.onConfirm}
        />
      )}
    </ModalContext.Provider>
  )
}

export function useModal() {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
}

// 全局弹窗 Hook
let globalModal: ReturnType<typeof useModal> | null = null

export function setGlobalModal(modal: ReturnType<typeof useModal>) {
  globalModal = modal
}

export function getGlobalModal() {
  return globalModal
}

// 便捷的全局方法
export const modal = {
  success: (message: string, title = '成功') => {
    globalModal?.showSuccess(message, title)
  },
  error: (message: string, title = '错误') => {
    globalModal?.showError(message, title)
  },
  warning: (message: string, title = '警告') => {
    globalModal?.showWarning(message, title)
  },
  info: (message: string, title = '提示') => {
    globalModal?.showInfo(message, title)
  },
  confirm: (message: string, onConfirm: () => void, title = '确认操作') => {
    globalModal?.confirmAction(message, onConfirm, title)
  },
  confirmDelete: (message: string, onConfirm: () => void, title = '确认删除') => {
    globalModal?.confirmDelete(message, onConfirm, title)
  }
}
