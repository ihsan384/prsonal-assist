import { type ReactNode } from 'react'
import { ToastProvider } from '@/contexts/ToastContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { MusicProvider } from '@/contexts/MusicContext'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <MusicProvider>
            {children}
          </MusicProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
