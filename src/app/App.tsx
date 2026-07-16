import { useState, useEffect } from 'react'
import { Providers } from './providers'
import { AppRouter } from './router'
import SplashScreen from '@/features/common/SplashScreen'
import { memoryStore } from '@/services/storage/MemoryStore'
import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'

export default function App() {
  const [splashDone, setSplashDone] = useState(false)
  const [dbReady, setDbReady] = useState(false)

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
      StatusBar.setStyle({ style: Style.Dark }).catch(err => console.error(err))
      StatusBar.setBackgroundColor({ color: '#0a0a0f' }).catch(err => console.error(err))
    }
  }, [])

  const ready = splashDone && dbReady

  return (
    <Providers>
      {!ready && <SplashScreen onComplete={() => setSplashDone(true)} />}
      {ready && <AppRouter />}
    </Providers>
  )
}
