import { useState, useEffect } from 'react'
import { Providers } from './providers'
import { AppRouter } from './router'
import SplashScreen from '@/features/common/SplashScreen'
import { memoryStore } from '@/services/storage/MemoryStore'

export default function App() {
  const [splashDone, setSplashDone] = useState(false)
  const [dbReady, setDbReady] = useState(false)

  useEffect(() => {
    memoryStore.init().then(() => setDbReady(true))
  }, [])

  const ready = splashDone && dbReady

  return (
    <Providers>
      {!ready && <SplashScreen onComplete={() => setSplashDone(true)} />}
      {ready && <AppRouter />}
    </Providers>
  )
}
