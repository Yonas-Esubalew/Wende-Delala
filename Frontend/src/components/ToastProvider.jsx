import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const { t } = useTranslation()
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())

  const dismissToast = useCallback((id) => {
    window.clearTimeout(timers.current.get(id))
    timers.current.delete(id)
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback((message, type = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    setToasts((current) => [...current.slice(-2), { id, message, type }])
    timers.current.set(id, window.setTimeout(() => dismissToast(id), 4800))
  }, [dismissToast])

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), [])

  const value = useMemo(() => ({ showToast }), [showToast])
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" aria-label={t('notifications')}>
        {toasts.map((toast) => (
          <div className={`app-toast toast-${toast.type}`} key={toast.id} role={toast.type === 'error' ? 'alert' : 'status'} aria-live={toast.type === 'error' ? 'assertive' : 'polite'}>
            <span className="toast-symbol" aria-hidden="true">{toast.type === 'success' ? '✓' : toast.type === 'error' ? '!' : 'i'}</span>
            <p>{toast.message}</p>
            <button type="button" onClick={() => dismissToast(toast.id)} aria-label={t('dismiss')}>×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const value = useContext(ToastContext)
  if (!value) throw new Error('useToast must be used inside ToastProvider')
  return value.showToast
}
