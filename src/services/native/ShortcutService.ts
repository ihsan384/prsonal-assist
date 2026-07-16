import { App } from '@capacitor/app'
import type { URLOpenListenerEvent } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'

class ShortcutService {
  
  // Set up deep link routing listener for App Shortcuts
  init(navigateCallback: (path: string) => void): void {
    if (!Capacitor.isNativePlatform()) {
      return
    }

    try {
      // Listen for app launches via custom URL schemes or intent deep links
      App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
        // Example event.url: "ihsanos://app/pomodoro" or "https://ihsanos.com/pomodoro"
        console.log('[ShortcutService] App opened with URL:', event.url)
        
        const urlObj = new URL(event.url)
        const path = urlObj.pathname + urlObj.search
        
        if (path) {
          navigateCallback(path)
        }
      })
    } catch (err) {
      console.warn('[ShortcutService] Failed to bind deep link listeners:', err)
    }
  }

  // Retrieve default quick actions shortcuts metadata
  getQuickActions() {
    return [
      { id: 'pomodoro', title: 'Start Pomodoro', route: '/pomodoro', icon: '⏱️' },
      { id: 'task', title: 'New Task', route: '/tasks', icon: '📝' },
      { id: 'reflection', title: 'New Reflection', route: '/reflection', icon: '📔' },
      { id: 'water', title: 'Log Water', route: '/nutrition', icon: '💧' },
      { id: 'workout', title: 'Log Workout', route: '/fitness', icon: '🏋️' }
    ]
  }
}

export const shortcutService = new ShortcutService()
