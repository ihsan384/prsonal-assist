export type SyncStatusType = 'offline' | 'online' | 'syncing' | 'synced' | 'failed'

export interface SyncLogEntry {
  id: string
  timestamp: string
  store: string
  operation: 'upload' | 'download' | 'delete'
  status: 'success' | 'failed' | 'skipped'
  recordCount: number
  durationMs: number
  retryCount: number
  errorMessage?: string
}

class DirectCloudSyncEngine {
  status: SyncStatusType = 'synced'
  lastSyncTime: string | null = null
  pendingCount = 0

  get autoSync(): boolean { return true }
  set autoSync(_v: boolean) {}
  get syncWifiOnly(): boolean { return false }
  set syncWifiOnly(_v: boolean) {}
  get backgroundSync(): boolean { return true }
  set backgroundSync(_v: boolean) {}

  subscribe(callback: (status: SyncStatusType, count: number) => void): () => void {
    callback('synced', 0)
    return () => {}
  }

  async initRealtimeSession(): Promise<void> {}
  async pushLocalChange(_storeName: string, _record: any): Promise<void> {}
  async sync(): Promise<void> {}
  resetOnUserSwitch() {}

  // Compatibility stubs
  async updatePendingCount(): Promise<number> { return 0 }
  async getUploadQueue(): Promise<any[]> { return [] }
  async getConflictQueue(): Promise<any[]> { return [] }
  getRetryQueue(): any[] { return [] }
  async getFailedQueue(): Promise<any[]> { return [] }
  async getSyncLog(_limit?: number | string): Promise<SyncLogEntry[]> { return [] }
  async clearSyncLog(): Promise<void> {}
  async retryFailed(): Promise<void> {}
  async wipeCloudData(): Promise<void> {}
  async factoryReset(): Promise<void> {}
}

export const syncEngine = new DirectCloudSyncEngine()
