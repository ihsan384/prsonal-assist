import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

interface PageWrapperProps {
  children: ReactNode
  className?: string
  padBottom?: boolean
}

export function PageWrapper({ children, className, padBottom = true }: PageWrapperProps) {
  return (
    <motion.div
      className={cn(
        'min-h-[calc(100dvh-56px)] px-4 py-5 max-w-5xl mx-auto w-full flex flex-col gap-5',
        padBottom && 'pb-24 lg:pb-10',
        className
      )}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
