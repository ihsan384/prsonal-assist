import { LocalNotifications } from '@capacitor/local-notifications'
import type { PendingResult } from '@capacitor/local-notifications'
import { Capacitor } from '@capacitor/core'
import { notificationScheduleStorage, notificationHistoryStorage } from '../storage'

export type NotificationCategory = 'Study' | 'Health' | 'Goals' | 'Reflection' | 'Finance' | 'System'

class NotificationService {
  private isSupported = 'Notification' in window || Capacitor.isNativePlatform()

  constructor() {
    this.init()
  }

  private async init() {
    if (!this.isSupported) return
    try {
      if (Capacitor.isNativePlatform()) {
        // Create custom Android notification channel
        await LocalNotifications.createChannel({
          id: 'study_erp_reminders',
          name: 'Study ERP Reminders',
          description: 'Productivity, health, habits, and task alerts',
          importance: 5, // max priority
          visibility: 1, // public
          vibration: true,
          sound: 'beep.wav'
        })

        // Register action categories
        await LocalNotifications.registerActionTypes({
          types: [
            {
              id: 'REMINDER_ACTIONS',
              actions: [
                { id: 'complete', title: 'Complete', foreground: true },
                { id: 'snooze_5m', title: 'Snooze 5 Min', foreground: false },
                { id: 'snooze_30m', title: 'Snooze 30 Min', foreground: false },
                { id: 'dismiss', title: 'Dismiss', foreground: false }
              ]
            }
          ]
        })

        // Listen for action performance
        LocalNotifications.addListener('localNotificationActionPerformed', async (actionResult) => {
          const { actionId, notification } = actionResult
          const title = notification.title || 'Reminder'
          const body = notification.body || ''
          const category = (notification.extra?.category as NotificationCategory) || 'System'

          notificationHistoryStorage.add({
            title,
            body,
            category,
            firedAt: new Date().toISOString(),
            status: actionId === 'complete' ? 'clicked' : (actionId?.startsWith('snooze') ? 'snoozed' : 'dismissed')
          })

          if (actionId === 'complete') {
            // Handle Complete (e.g. log complete)
            console.log('[NotificationService] Action complete triggered for notification:', notification.id)
          } else if (actionId?.startsWith('snooze')) {
            const minutes = actionId === 'snooze_5m' ? 5 : 30
            await this.snoozeNotification(notification.id, title, body, category, minutes)
          }
        })
      }
    } catch (err) {
      console.error('[NotificationService] Initialization error:', err)
    }
  }

  // Requests device permissions for notifications
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported) return false
    try {
      if (Capacitor.isNativePlatform()) {
        const permission = await LocalNotifications.requestPermissions()
        return permission.display === 'granted'
      } else if ('Notification' in window) {
        const permission = await Notification.requestPermission()
        return permission === 'granted'
      }
    } catch (err) {
      console.error('[NotificationService] Permission request failed:', err)
    }
    return false
  }

  // Checks permission status
  async checkPermission(): Promise<boolean> {
    if (!this.isSupported) return false
    if (Capacitor.isNativePlatform()) {
      const status = await LocalNotifications.checkPermissions()
      return status.display === 'granted'
    } else if ('Notification' in window) {
      return Notification.permission === 'granted'
    }
    return false
  }

  // Quiet Hours check: Defer schedules falling between 10 PM and 7 AM
  private checkQuietHours(targetDate: Date): Date {
    const isQuietHoursEnabled = localStorage.getItem('settings_quiet_hours_enabled') !== 'false'
    if (!isQuietHoursEnabled) return targetDate

    const hour = targetDate.getHours()
    // Quiet hours default: 22:00 (10 PM) to 07:00 (7 AM)
    if (hour >= 22 || hour < 7) {
      const deferred = new Date(targetDate)
      if (hour >= 22) {
        // Shift to 7 AM next day
        deferred.setDate(deferred.getDate() + 1)
      }
      deferred.setHours(7, 0, 0, 0)
      console.log(`[NotificationService] Deferring notification from ${targetDate.toLocaleTimeString()} to ${deferred.toLocaleTimeString()} due to Quiet Hours.`)
      return deferred
    }
    return targetDate
  }

  // Helper to generate a stable, unique 32-bit integer ID from key/type string
  private generateStableId(key: string): number {
    let hash = 0
    for (let i = 0; i < key.length; i++) {
      hash = (hash << 5) - hash + key.charCodeAt(i)
      hash |= 0 // Convert to 32bit integer
    }
    return Math.abs(hash)
  }

  // Schedules a single category-based local notification
  async schedule(
    title: string,
    body: string,
    category: NotificationCategory,
    scheduledAt: Date,
    repeats?: 'daily' | 'weekly' | 'monthly' | 'none',
    parentId = ''
  ): Promise<string> {
    if (!this.isSupported) return ''
    
    // Check permission
    const hasPerm = await this.checkPermission()
    if (!hasPerm) {
      const granted = await this.requestPermission()
      if (!granted) return ''
    }

    // Apply Quiet Hours logic
    const finalScheduleDate = this.checkQuietHours(scheduledAt)
    const stableId = this.generateStableId(`${category}:${title}:${finalScheduleDate.getTime()}:${parentId}`)
    const idStr = String(stableId)

    try {
      if (Capacitor.isNativePlatform()) {
        const scheduleOptions: any = { at: finalScheduleDate }
        if (repeats && repeats !== 'none') {
          if (repeats === 'daily') scheduleOptions.every = 'day'
          else if (repeats === 'weekly') scheduleOptions.every = 'week'
          else if (repeats === 'monthly') scheduleOptions.every = 'month'
          scheduleOptions.repeats = true
        }

        await LocalNotifications.schedule({
          notifications: [
            {
              title,
              body,
              id: stableId,
              schedule: scheduleOptions,
              channelId: 'study_erp_reminders',
              actionTypeId: 'REMINDER_ACTIONS',
              extra: { category, parentId }
            }
          ]
        })
      } else {
        // Web fallback
        const delay = finalScheduleDate.getTime() - Date.now()
        if (delay > 0) {
          setTimeout(() => {
            if (Notification.permission === 'granted') {
              const notif = new Notification(title, { body: `${category}: ${body}` })
              notificationHistoryStorage.add({ title, body, category, firedAt: new Date().toISOString(), status: 'delivered' })
            }
          }, delay)
        }
      }

      // Save notification config to local store
      notificationScheduleStorage.save({
        id: idStr,
        title,
        body,
        category,
        scheduledAt: finalScheduleDate.toISOString(),
        repeats: repeats || 'none',
        enabled: true
      })

      return idStr
    } catch (err) {
      console.error('[NotificationService] Scheduling failed:', err)
      return ''
    }
  }

  // Cancel scheduled notification
  async cancel(idStr: string): Promise<void> {
    if (!this.isSupported) return
    const numericId = Number(idStr)
    if (isNaN(numericId)) return

    try {
      if (Capacitor.isNativePlatform()) {
        await LocalNotifications.cancel({ notifications: [{ id: numericId }] })
      }
      notificationScheduleStorage.remove(idStr)
    } catch (err) {
      console.error('[NotificationService] Cancel failed:', err)
    }
  }

  // Snoozes a notification, scheduling a new one in target minutes
  private async snoozeNotification(id: number, title: string, body: string, category: NotificationCategory, minutes: number) {
    const snoozeDate = new Date(Date.now() + minutes * 60 * 1000)
    console.log(`[NotificationService] Snoozing notification "${title}" for ${minutes} mins (scheduling at ${snoozeDate.toLocaleTimeString()})`)
    
    // Schedule a one-time reminder
    await this.schedule(
      `[Snoozed] ${title}`,
      body,
      category,
      snoozeDate,
      'none',
      `snooze_${id}`
    )
  }

  // Restores all notification schedules after device reboot (called on startup)
  async restoreSchedules(): Promise<void> {
    if (!this.isSupported || !Capacitor.isNativePlatform()) return
    try {
      const activeSchedules = notificationScheduleStorage.getAll().filter(s => s.enabled)
      const nowTime = Date.now()

      // Re-schedule future alerts
      for (const s of activeSchedules) {
        const schedTime = new Date(s.scheduledAt).getTime()
        if (schedTime > nowTime || s.repeats !== 'none') {
          await this.schedule(s.title, s.body, s.category as NotificationCategory, new Date(s.scheduledAt), s.repeats as any)
        }
      }
      console.log(`[NotificationService] Restored ${activeSchedules.length} schedules on app reload.`)
    } catch (err) {
      console.error('[NotificationService] Failed to restore schedules:', err)
    }
  }

  // Query currently registered pending notifications from Capacitor OS scheduler
  async getOSPendingNotifications(): Promise<PendingResult> {
    if (this.isSupported && Capacitor.isNativePlatform()) {
      return await LocalNotifications.getPending()
    }
    return { notifications: [] }
  }
}

export const notificationService = new NotificationService()
