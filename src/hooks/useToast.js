import toast from 'react-hot-toast'

/**
 * Toast 알림을 위한 커스텀 훅
 * react-hot-toast를 래핑하여 일관된 스타일과 옵션 제공
 */
export const useToast = () => {
  const defaultOptions = {
    duration: 3000,
    position: 'top-center',
    style: {
      background: '#fff',
      color: '#363636',
      padding: '16px',
      borderRadius: '8px',
      fontSize: '14px',
    },
  }

  /**
   * 성공 메시지 표시
   */
  const success = (message, options = {}) => {
    return toast.success(message, {
      ...defaultOptions,
      ...options,
      icon: '✅',
      style: {
        ...defaultOptions.style,
        border: '1px solid #10b981',
        ...options.style,
      },
    })
  }

  /**
   * 에러 메시지 표시
   */
  const error = (message, options = {}) => {
    return toast.error(message, {
      ...defaultOptions,
      duration: 4000, // 에러는 조금 더 오래 표시
      ...options,
      icon: '❌',
      style: {
        ...defaultOptions.style,
        border: '1px solid #ef4444',
        ...options.style,
      },
    })
  }

  /**
   * 일반 정보 메시지 표시
   */
  const info = (message, options = {}) => {
    return toast(message, {
      ...defaultOptions,
      ...options,
      icon: 'ℹ️',
      style: {
        ...defaultOptions.style,
        border: '1px solid #3b82f6',
        ...options.style,
      },
    })
  }

  /**
   * 경고 메시지 표시
   */
  const warning = (message, options = {}) => {
    return toast(message, {
      ...defaultOptions,
      ...options,
      icon: '⚠️',
      style: {
        ...defaultOptions.style,
        border: '1px solid #f59e0b',
        ...options.style,
      },
    })
  }

  /**
   * 로딩 메시지 표시
   */
  const loading = (message, options = {}) => {
    return toast.loading(message, {
      ...defaultOptions,
      ...options,
    })
  }

  /**
   * Promise 기반 토스트 (로딩 → 성공/실패)
   */
  const promise = (promiseFn, messages) => {
    return toast.promise(
      promiseFn,
      {
        loading: messages.loading || '처리 중...',
        success: messages.success || '완료되었습니다',
        error: messages.error || '오류가 발생했습니다',
      },
      defaultOptions
    )
  }

  /**
   * 특정 토스트 닫기
   */
  const dismiss = (toastId) => {
    return toast.dismiss(toastId)
  }

  /**
   * 모든 토스트 닫기
   */
  const dismissAll = () => {
    return toast.dismiss()
  }

  return {
    success,
    error,
    info,
    warning,
    loading,
    promise,
    dismiss,
    dismissAll,
  }
}
