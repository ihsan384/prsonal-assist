import { useState, useEffect, useCallback } from 'react'
import { Providers } from './providers'
import { AppRouter } from './router'
import SplashScreen from '@/features/common/SplashScreen'
import { memoryStore } from '@/services/storage/MemoryStore'
import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'

export default function App() {
  const [splashDone, setSplashDone] = useState(() => {
    return typeof window !== 'undefined' && sessionStorage.getItem('study_erp_splash_done') === 'true'
  })
  const [dbReady, setDbReady] = useState(false)

  const handleSplashComplete = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('study_erp_splash_done', 'true')
    }
    setSplashDone(true)
  }, [])

  useEffect(() => {
    // Initialize Database
    memoryStore.init().then(() => {
      setDbReady(true)
      // Restore notification schedules from storage
      import('@/services/notifications/NotificationService').then(({ notificationService }) => {
        notificationService.restoreSchedules().catch(err => console.error(err))
      })
    })

    // Initialize Native UI Styles
    if (Capacitor.isNativePlatform()) {
      StatusBar.setStyle({ style: Style.Light }).catch(err => console.error(err))
      StatusBar.setBackgroundColor({ color: '#ffffff' }).catch(err => console.error(err))
    }
  }, [])

  const ready = splashDone && dbReady

  return (
    <Providers>
      {!ready && <SplashScreen onComplete={handleSplashComplete} />}
      {ready && <AppRouter />}
    </Providers>
  )
}
