import { useState } from 'react'
import { Providers } from './providers'
import { AppRouter } from './router'
import SplashScreen from '@/features/common/SplashScreen'

export default function App() {
  const [splashDone, setSplashDone] = useState(false)

  return (
    <Providers>
      {!splashDone && <SplashScreen onComplete={() => setSplashDone(true)} />}
      <AppRouter />
    </Providers>
  )
}
