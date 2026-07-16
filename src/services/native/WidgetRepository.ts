import { Capacitor } from '@capacitor/core'
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'
import { 
  taskStorage, 
  habitStorage, 
  notificationScheduleStorage 
} from '../storage'
import { studyERPStorage } from '../storage/studyERP.storage'
import { memoryStore } from '../storage/MemoryStore'

export interface WidgetPayload {
  todayStudyMinutes: number
  pomodoroStatus: 'idle' | 'running' | 'paused'
  pomodoroTimeRemaining: number // seconds
  remainingTasksCount: number
  waterIntakeMl: number
  habitCompletionPercentage: number
  sleepHours: number
  nextReminderText: string
  dailyProductivityScore: number
  lastUpdated: string
}

class WidgetRepository {
  
  // Compiles state and returns the widget payload
  getWidgetPayload(): WidgetPayload {
    const today = new Date().toDateString()
    
    // 1. Study time today (Study ERP sessions + general study sessions)
    const sessions = studyERPStorage.getSessions()
    const todayERPSessions = sessions.filter((s: any) => new Date(s.date).toDateString() === today)
    const studyERPMinutes = todayERPSessions.reduce((sum: number, s: any) => sum + (s.durationMinutes || 0), 0)

    const generalSessions = memoryStore.studySessions || []
    const todayGeneralSessions = generalSessions.filter((s: any) => {
      try {
        return new Date(s.startTime).toDateString() === today
      } catch {
        return false
      }
    })
    const generalMinutes = todayGeneralSessions.reduce((sum: number, s: any) => sum + (s.durationMinutes || 0), 0)
    const totalStudyTime = studyERPMinutes + generalMinutes

    // 2. Pomodoro state
    let pomodoroStatus: 'idle' | 'running' | 'paused' = 'idle'
    let pomodoroTimeRemaining = 0
    try {
      const pomodoroLS = localStorage.getItem('ihsanos_pomodoro_state')
      if (pomodoroLS) {
        const state = JSON.parse(pomodoroLS)
        pomodoroStatus = state.phase || 'idle'
        pomodoroTimeRemaining = state.timeRemaining || 0
      }
    } catch {}

    // 3. Remaining tasks
    const tasks = taskStorage.getAll().filter(t => t.status !== 'done' && !t.deleted)
    const remainingTasks = tasks.length

    // 4. Water intake
    const waterLogs = memoryStore.waterLogs || {}
    const todayKey = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    const waterIntake = waterLogs[todayKey] || 0

    // 5. Habit completion
    const habits = habitStorage.getAll().filter(h => h.isActive && !h.deleted)
    let completedHabits = 0
    habits.forEach(h => {
      // Check if logged today in completions list
      if (Array.isArray(h.completions)) {
        const completedToday = h.completions.some((c: any) => new Date(c.date).toDateString() === today && c.completed)
        if (completedToday) completedHabits++
      }
    })
    const habitCompletion = habits.length > 0 ? Math.round((completedHabits / habits.length) * 100) : 0

    // 6. Sleep hours today
    const sleepLogs = memoryStore.sleepLogs || []
    const todaySleep = sleepLogs.find((l: any) => new Date(l.date).toDateString() === today && !l.deleted)
    const sleepHours = todaySleep ? Number(todaySleep.durationHours) : 0

    // 7. Next scheduled reminder
    const schedules = notificationScheduleStorage.getAll().filter(s => s.enabled)
    const futureSchedules = schedules
      .filter(s => new Date(s.scheduledAt).getTime() > Date.now())
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    const nextReminder = futureSchedules.length > 0 
      ? `${futureSchedules[0].category}: ${futureSchedules[0].title} (${new Date(futureSchedules[0].scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})` 
      : 'None'

    // 8. Daily productivity score (from reflection entries today)
    const reflections = memoryStore.reflectionEntries || []
    const todayRef = reflections.find((r: any) => new Date(r.date).toDateString() === today && !r.deleted)
    const productivityScore = todayRef ? (todayRef.productivityRating || 0) : 0

    return {
      todayStudyMinutes: totalStudyTime,
      pomodoroStatus,
      pomodoroTimeRemaining,
      remainingTasksCount: remainingTasks,
      waterIntakeMl: waterIntake,
      habitCompletionPercentage: habitCompletion,
      sleepHours,
      nextReminderText: nextReminder,
      dailyProductivityScore: productivityScore,
      lastUpdated: new Date().toISOString()
    }
  }

  // Serializes payload and writes it locally for native app widgets consumption
  async updateWidgetPayload(): Promise<void> {
    const isWidgetEnabled = localStorage.getItem('settings_android_widgets_enabled') !== 'false'
    if (!isWidgetEnabled) return

    const payload = this.getWidgetPayload()
    const jsonStr = JSON.stringify(payload)

    // Save to LocalStorage
    localStorage.setItem('ihsanos_widget_data', jsonStr)

    // Save to native documents folder
    if (Capacitor.isNativePlatform()) {
      try {
        await Filesystem.writeFile({
          path: 'widget_data.json',
          data: jsonStr,
          directory: Directory.Documents,
          encoding: Encoding.UTF8
        })
        console.log('[WidgetRepository] Widget payload file updated successfully.')
      } catch (err) {
        console.error('[WidgetRepository] Failed to write widget file:', err)
      }
    }
  }
}

export const widgetRepository = new WidgetRepository()
