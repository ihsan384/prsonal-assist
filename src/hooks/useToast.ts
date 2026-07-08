import { useState, useCallback } from 'react'
import { generateId } from '@/utils/format'
import type { ToastMessage, ToastType } from '@/types'

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = useCallback((
    type: ToastType,
    title: string,
    description?: string,
    duration = 3000
  ) => {
    const id = generateId()
    const toast: ToastMessage = { id, type, title, description, duration }
    setToasts(prev => [...prev, toast])

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, duration)
    }
    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const success = useCallback((title: string, description?: string) => addToast('success', title, description), [addToast])
  const error = useCallback((title: string, description?: string) => addToast('error', title, description), [addToast])
  const warning = useCallback((title: string, description?: string) => addToast('warning', title, description), [addToast])
  const info = useCallback((title: string, description?: string) => addToast('info', title, description), [addToast])

  return { toasts, addToast, removeToast, success, error, warning, info }
}
