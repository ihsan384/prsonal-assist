import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { LocalNotifications } from '@capacitor/local-notifications';

export class NativeCapabilitiesService {
  isNative(): boolean {
    return Capacitor.isNativePlatform();
  }

  // ─── Share API ─────────────────────────────────────────────────────────────
  async share(title: string, text: string, url?: string): Promise<void> {
    if (this.isNative()) {
      await Share.share({
        title,
        text,
        url,
        dialogTitle: 'Share with',
      });
    } else if (navigator.share) {
      await navigator.share({
        title,
        text,
        url,
      });
    } else {
      console.log('[NativeCapabilities] Share not supported on web. Details:', { title, text, url });
      // Fallback: Copy to clipboard or show custom toast
      alert(`Sharing details:\nTitle: ${title}\nText: ${text}\nURL: ${url || 'N/A'}`);
    }
  }

  // ─── Notifications ─────────────────────────────────────────────────────────
  async requestNotificationPermission(): Promise<boolean> {
    if (this.isNative()) {
      const permission = await LocalNotifications.requestPermissions();
      return permission.display === 'granted';
    } else if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  async scheduleNotification(title: string, body: string, id: number = Math.floor(Math.random() * 100000)): Promise<void> {
    if (this.isNative()) {
      const hasPermission = await this.requestNotificationPermission();
      if (!hasPermission) {
        console.warn('[NativeCapabilities] Notifications permission denied.');
        return;
      }
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id,
            schedule: { at: new Date(Date.now() + 1000) }, // Send in 1 second
            actionTypeId: '',
            extra: null
          }
        ]
      });
    } else if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    } else {
      console.log('[NativeCapabilities] Notification fallback:', { title, body });
    }
  }

  // ─── Camera ────────────────────────────────────────────────────────────────
  async takePhoto(): Promise<string | null> {
    if (this.isNative()) {
      try {
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.Uri,
          source: CameraSource.Camera,
        });
        return image.webPath || null;
      } catch (err) {
        console.error('[NativeCapabilities] Error taking photo:', err);
        return null;
      }
    } else {
      console.log('[NativeCapabilities] Camera not available. Fallback to file picker.');
      return this.pickFile('image/*');
    }
  }

  // ─── File Picker ───────────────────────────────────────────────────────────
  async pickFile(accept: string = '*/*'): Promise<string | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = accept;
      input.onchange = (e: Event) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            resolve(event.target?.result as string);
          };
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(file);
        } else {
          resolve(null);
        }
      };
      input.click();
    });
  }

  // ─── Image Upload ──────────────────────────────────────────────────────────
  async uploadImage(): Promise<string | null> {
    if (this.isNative()) {
      try {
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.Uri,
          source: CameraSource.Photos, // Pick from library
        });
        return image.webPath || null;
      } catch (err) {
        console.error('[NativeCapabilities] Error picking image:', err);
        return null;
      }
    } else {
      return this.pickFile('image/*');
    }
  }

  // ─── Local Files ───────────────────────────────────────────────────────────
  async writeLocalFile(fileName: string, content: string): Promise<string | null> {
    if (this.isNative()) {
      try {
        const result = await Filesystem.writeFile({
          path: fileName,
          data: content,
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
        });
        return result.uri;
      } catch (err) {
        console.error('[NativeCapabilities] Error writing local file:', err);
        return null;
      }
    } else {
      // Fallback: Download file in browser
      try {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
        return fileName;
      } catch (err) {
        console.error('[NativeCapabilities] Browser file download failed:', err);
        return null;
      }
    }
  }

  async readLocalFile(fileName: string): Promise<string | null> {
    if (this.isNative()) {
      try {
        const result = await Filesystem.readFile({
          path: fileName,
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
        });
        return result.data as string;
      } catch (err) {
        console.error('[NativeCapabilities] Error reading local file:', err);
        return null;
      }
    } else {
      console.warn('[NativeCapabilities] Reading local files is only supported natively.');
      return null;
    }
  }

  // ─── Biometric Lock (Architectural Prep / Mock) ──────────────────────────
  async isBiometricAvailable(): Promise<boolean> {
    // Stubs for future implementation (e.g. using @capacitor-community/face-id or similar)
    if (this.isNative()) {
      console.log('[NativeCapabilities] Biometrics status check (mocked): available');
      return true;
    }
    return false;
  }

  async authenticateBiometrics(reason: string): Promise<boolean> {
    if (this.isNative()) {
      console.log('[NativeCapabilities] Prompting biometrics (mocked) for:', reason);
      // Simulating a success check. Future integration will bind FaceID/TouchID plugin here.
      return new Promise((resolve) => setTimeout(() => resolve(true), 1000));
    }
    return false;
  }
}

export const nativeCapabilities = new NativeCapabilitiesService();
