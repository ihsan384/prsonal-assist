import { useState, useEffect, type ReactNode } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { MobileDrawer } from './MobileDrawer'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { ToastContainer } from '../ui/Toast'
import { PWAReloadPrompt } from './PWAReloadPrompt'
import { PomodoroProvider } from '@/features/study/pomodoro/PomodoroContext'
import { PomodoroMiniTimer } from '@/features/study/pomodoro/PomodoroMiniTimer'
import { useNativeBackButton } from '@/hooks/useNativeBackButton'

interface AppLayoutProps {
  children?: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  
  // Initialize native back button handling
  useNativeBackButton()

  // Initialize shortcut & deep-link service
  useEffect(() => {
    import('@/services/native/ShortcutService').then(({ shortcutService }) => {
      shortcutService.init((path) => {
        console.log('[AppLayout] Deep link navigation to:', path)
        navigate(path)
      })
    })
  }, [navigate])

  return (
    <PomodoroProvider>
      <div className="flex h-screen bg-[var(--bg)] overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile / Global Top Bar */}
          <TopBar onMenuClick={() => setIsDrawerOpen(true)} />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            {children ?? <Outlet />}
          </main>
        </div>

        {/* Mobile Slide-out Drawer */}
        <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

        {/* Floating Pomodoro Mini Timer */}
        <PomodoroMiniTimer />

        {/* Toast Notifications */}
        <ToastContainer />

        {/* PWA Update / Offline Toast */}
        <PWAReloadPrompt />
      </div>
    </PomodoroProvider>
  )
}

