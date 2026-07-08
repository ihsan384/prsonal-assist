import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Home, ArrowLeft, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center"
      >
        <div className="text-[var(--accent)] mb-4">
          <AlertCircle size={48} />
        </div>
        <h1 className="text-4xl font-black text-[var(--text)] mb-2">404</h1>
        <h2 className="text-xl font-semibold text-[var(--text)] mb-3">Page not found</h2>
        <p className="text-sm text-[var(--text-3)] mb-8 max-w-xs">
          This page doesn't exist in your Personal OS. Maybe it's a Phase 2 feature?
        </p>
        <div className="flex gap-3 justify-center">
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
