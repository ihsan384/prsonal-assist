import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="text-7xl mb-6 animate-float">🌑</div>
        <h1 className="text-6xl font-bold text-gradient mb-2">404</h1>
        <h2 className="text-xl font-semibold text-[#f0f0f5] mb-3">Page not found</h2>
        <p className="text-sm text-[#55556a] mb-8 max-w-xs">
          This page doesn't exist in your Personal OS. Maybe it's a Phase 2 feature?
        </p>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            icon={<ArrowLeft size={16} />}
          >
            Go Back
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/')}
            icon={<Home size={16} />}
          >
            Dashboard
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
