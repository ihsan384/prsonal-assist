/**
 * Generic typed local storage service
 */

export class StorageService {
  private prefix: string

  constructor(prefix = 'ihsanos') {
    this.prefix = prefix
  }

  setUserId(userId: string | null): void {
    const safeId = (userId || 'guest').replace(/[^a-zA-Z0-9_-]/g, '_')
    this.prefix = `ihsanos_${safeId}`
  }

  private key(name: string): string {
    return `${this.prefix}_${name}`
  }

  get<T>(name: string): T | null {
    try {
      const raw = localStorage.getItem(this.key(name))
      if (raw === null) return null
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  }

  set<T>(name: string, value: T): void {
    try {
      localStorage.setItem(this.key(name), JSON.stringify(value))
    } catch (err) {
      console.error(`[StorageService] Failed to set "${name}":`, err)
    }
  }

  update<T extends object>(name: string, partial: Partial<T>): T | null {
    const current = this.get<T>(name)
    if (current === null) return null
    const updated = { ...current, ...partial }
    this.set(name, updated)
    return updated
  }

  delete(name: string): void {
    localStorage.removeItem(this.key(name))
  }

  clear(name: string): void {
    localStorage.removeItem(this.key(name))
  }

  clearAll(): void {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(this.prefix))
    keys.forEach(k => localStorage.removeItem(k))
  }

  getOrDefault<T>(name: string, defaultValue: T): T {
    const value = this.get<T>(name)
    return value ?? defaultValue
  }

  // Array operations
  getList<T>(name: string): T[] {
    return this.getOrDefault<T[]>(name, [])
  }

  addToList<T extends { id: string }>(name: string, item: T): T[] {
    const list = this.getList<T>(name)
    const updated = [...list, item]
    this.set(name, updated)
    return updated
  }

  updateInList<T extends { id: string }>(name: string, id: string, partial: Partial<T>): T[] {
    const list = this.getList<T>(name)
    const updated = list.map(item =>
      item.id === id ? { ...item, ...partial, updatedAt: new Date().toISOString() } : item
    )
    this.set(name, updated)
    return updated
  }

  removeFromList<T extends { id: string }>(name: string, id: string): T[] {
    const list = this.getList<T>(name)
    const updated = list.filter(item => item.id !== id)
    this.set(name, updated)
    return updated
  }

  findInList<T extends { id: string }>(name: string, id: string): T | undefined {
    return this.getList<T>(name).find(item => item.id === id)
  }
}

// Singleton instance
export const storage = new StorageService()
