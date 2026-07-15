import { useToastContext } from '@/contexts/ToastContext'

export function useToast() {
  const { toast } = useToastContext()
  return toast
}
