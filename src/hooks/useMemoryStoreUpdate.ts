import { useEffect, useState } from 'react'
import { memoryStore } from '@/services/storage/MemoryStore'

/**
 * Hook that subscribes to memoryStore changes and causes the consuming
 * component to re-render whenever memoryStore updates its data collections.
 */
export function useMemoryStoreUpdate() {
  const [, setTick] = useState(0)
  useEffect(() => {
    const unsub = memoryStore.subscribe(() => {
      setTick(t => t + 1)
    })
    return unsub
  }, [])
}
