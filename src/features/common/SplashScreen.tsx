import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap } from 'lucide-react'

interface SplashScreenProps {
  onComplete: () => void
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState<'in' | 'stay' | 'out'>('in')
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('stay'), 600)
    const t2 = setTimeout(() => setPhase('out'), 1800)
    const t3 = setTimeout(() => onCompleteRef.current(), 2200)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  return (
    <AnimatePresence>
      {phase !== 'out' && (
        <motion.div
            className="fixed inset-0 z-[200] bg-[var(--bg)] flex flex-col items-center justify-center"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              className="flex flex-col items-center gap-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            >
              <motion.div
                className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[var(--accent)] to-blue-400 flex items-center justify-center shadow-md"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 1.2, ease: 'easeInOut' }}
              >
                <Zap size={36} className="text-white" />
              </motion.div>
  
              <div className="text-center">
                <motion.h1
                  className="text-3xl font-black text-[var(--text)]"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Study ERP
                </motion.h1>
                <motion.p
                  className="text-sm text-[var(--text-3)] mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Personal Life Operating System
                </motion.p>
              </div>
  
              <motion.div
                className="flex gap-1.5 mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
      )}
    </AnimatePresence>
  )
}
