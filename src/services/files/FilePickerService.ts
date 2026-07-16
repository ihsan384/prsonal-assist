import { Capacitor } from '@capacitor/core'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { supabase } from '../supabase/supabase'
import { attachmentStorage } from '../storage'
import { idb, STORES } from '../storage/IndexedDB'
import { generateId } from '@/utils/format'

export interface AttachmentItem {
  id: string
  name: string
  size: number
  mimeType: string
  localPath?: string
  remoteUrl?: string
  parentType: string
  parentId: string
  sha256Hash: string
  checksum: string
  uploadStatus: 'pending' | 'uploading' | 'success' | 'failed' | 'paused'
  uploadProgress: number
  paused: boolean
  resumed: boolean
  uploadedAt?: string
  downloadedAt?: string
}

class FilePickerService {
  private activeUploads: Map<string, AbortController> = new Map()

  // Generate SHA-256 Checksum from File
  async calculateChecksum(file: File | Blob): Promise<string> {
    const arrayBuffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  // Handle picking one or multiple files
  async pickAndSaveFiles(
    filesList: FileList,
    parentType: string,
    parentId: string,
    onProgress?: (progress: number) => void
  ): Promise<AttachmentItem[]> {
    const savedAttachments: AttachmentItem[] = []

    for (let i = 0; i < filesList.length; i++) {
      const file = filesList[i]
      const checksum = await this.calculateChecksum(file)
      
      // 1. Check duplicate files using checksum
      const existing = attachmentStorage.getByChecksum(checksum)
      if (existing) {
        console.log(`[FilePicker] Duplicate file detected via checksum: ${file.name}. Linking existing.`)
        const duplicateMeta = attachmentStorage.save({
          name: file.name,
          size: file.size,
          mimeType: file.type || 'application/octet-stream',
          localPath: existing.localPath,
          remoteUrl: existing.remoteUrl,
          parentType,
          parentId,
          sha256Hash: checksum,
          checksum,
          uploadStatus: existing.uploadStatus,
          uploadProgress: existing.uploadProgress,
          paused: false,
          resumed: false,
          uploadedAt: existing.uploadedAt,
          downloadedAt: new Date().toISOString()
        })
        savedAttachments.push(duplicateMeta)
        continue
      }

      // 2. Save file locally (offline-first)
      const fileId = generateId()
      let localPath = ''
      
      if (Capacitor.isNativePlatform()) {
        // Save to native filesystem
        const reader = new FileReader()
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const result = reader.result as string
            const base64Data = result.split(',')[1] || result
            resolve(base64Data)
          }
          reader.onerror = reject
          reader.readAsDataURL(file)
        })

        const base64 = await base64Promise
        const fileName = `${fileId}_${file.name}`
        const writeResult = await Filesystem.writeFile({
          path: fileName,
          data: base64,
          directory: Directory.Documents
        })
        localPath = writeResult.uri
        // Save web file blob directly in IndexedDB attachments_data store
        // We will store the ArrayBuffer or Blob in IndexedDB
        const arrayBuffer = await file.arrayBuffer()
        await idb.put(STORES.ATTACHMENTS_DATA, { id: fileId, data: arrayBuffer })
        localPath = `indexeddb://${fileId}`
      }

      // 3. Create metadata entry
      const meta = attachmentStorage.save({
        id: fileId,
        name: file.name,
        size: file.size,
        mimeType: file.type || 'application/octet-stream',
        localPath,
        parentType,
        parentId,
        sha256Hash: checksum,
        checksum,
        uploadStatus: 'pending',
        uploadProgress: 0,
        paused: false,
        resumed: false
      })

      savedAttachments.push(meta)
      
      // Auto-trigger background upload (which will pause if wifi-only is active and offline)
      void this.uploadAttachment(fileId, file, onProgress)
    }

    return savedAttachments
  }

  // Upload attachment metadata and binary data to private Supabase Storage
  async uploadAttachment(id: string, fileData?: File | Blob, onProgress?: (p: number) => void): Promise<boolean> {
    const attachment = attachmentStorage.getById(id)
    if (!attachment || attachment.uploadStatus === 'success') return false

    // Check if paused
    if (attachment.paused) return false

    // Cancel existing active upload for this file ID
    if (this.activeUploads.has(id)) {
      this.activeUploads.get(id)?.abort()
      this.activeUploads.delete(id)
    }

    const controller = new AbortController()
    this.activeUploads.set(id, controller)

    // Update status
    attachmentStorage.save({ ...attachment, uploadStatus: 'uploading', resumed: true })

    try {
      let fileBody: File | Blob | ArrayBuffer = new Blob([])
      if (fileData) {
        fileBody = fileData
      } else {
        // Read file bytes locally
        if (Capacitor.isNativePlatform() && attachment.localPath) {
          const pathParts = attachment.localPath.split('/')
          const path = pathParts[pathParts.length - 1]
          const readResult = await Filesystem.readFile({
            path,
            directory: Directory.Documents
          })
          
          // Convert Base64 back to Blob
          const byteCharacters = atob(readResult.data as string)
          const byteNumbers = new Array(byteCharacters.length)
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i)
          }
          const byteArray = new Uint8Array(byteNumbers)
          fileBody = new Blob([byteArray], { type: attachment.mimeType })
          // Read from IndexedDB raw store
          const rawObj = await idb.get<any>(STORES.ATTACHMENTS_DATA, id)
          const raw = rawObj?.data
          if (!raw) throw new Error('Local file data not found in cache.')
          fileBody = new Blob([raw], { type: attachment.mimeType })
        }
      }

      const filePath = `${attachment.parentType}/${attachment.parentId}/${attachment.id}_${attachment.name}`

      // Update progress callback simulated (since supabase upload is chunkless, but we can do a xhr upload if needed.
      // However, Supabase storage bucket client allows passing options like AbortController)
      const { data, error } = await supabase.storage
        .from('attachments')
        .upload(filePath, fileBody, {
          cacheControl: '3600',
          upsert: true,
          duplex: 'half'
        })

      if (error) throw error

      // Upload success
      attachmentStorage.save({
        ...attachment,
        remoteUrl: filePath,
        uploadStatus: 'success',
        uploadProgress: 100,
        uploadedAt: new Date().toISOString()
      })

      if (onProgress) onProgress(100)
      return true
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log(`[FilePicker] Upload aborted for attachment: ${id}`)
        attachmentStorage.save({ ...attachment, uploadStatus: 'paused', paused: true })
      } else {
        console.error(`[FilePicker] Upload failed for attachment ${id}:`, err)
        attachmentStorage.save({ ...attachment, uploadStatus: 'failed', lastError: err.message })
      }
      return false
    } finally {
      this.activeUploads.delete(id)
    }
  }

  // Pauses an active upload
  pauseUpload(id: string): void {
    const attachment = attachmentStorage.getById(id)
    if (!attachment) return

    attachmentStorage.save({ ...attachment, paused: true, uploadStatus: 'paused' })
    if (this.activeUploads.has(id)) {
      this.activeUploads.get(id)?.abort()
      this.activeUploads.delete(id)
    }
  }

  // Resumes a paused upload
  resumeUpload(id: string): void {
    const attachment = attachmentStorage.getById(id)
    if (!attachment) return

    attachmentStorage.save({ ...attachment, paused: false, uploadStatus: 'pending' })
    void this.uploadAttachment(id)
  }

  // Generates short-lived signed URLs for security preview
  async getPreviewUrl(attachment: AttachmentItem): Promise<string> {
    if (!attachment.remoteUrl) {
      return this.getLocalUrl(attachment)
    }

    try {
      // Check online status
      if (navigator.onLine) {
        const { data, error } = await supabase.storage
          .from('attachments')
          .createSignedUrl(attachment.remoteUrl, 3600) // 1-hour signed URL

        if (!error && data?.signedUrl) {
          return data.signedUrl
        }
      }
    } catch (err) {
      console.warn('[FilePicker] Failed to retrieve signed URL, using offline local fallback:', err)
    }

    return this.getLocalUrl(attachment)
  }

  // Returns local sandbox file URL for offline use
  private async getLocalUrl(attachment: AttachmentItem): Promise<string> {
    if (!attachment.localPath) return ''

    if (Capacitor.isNativePlatform()) {
      return Capacitor.convertFileSrc(attachment.localPath)
    } else {
      // IndexedDB fallback for PWA
      try {
        const rawObj = await idb.get<any>(STORES.ATTACHMENTS_DATA, attachment.id)
        const raw = rawObj?.data
        if (raw) {
          const blob = new Blob([raw], { type: attachment.mimeType })
          return URL.createObjectURL(blob)
        }
      } catch (err) {
        console.error('[FilePicker] Error fetching offline local BLOB url:', err)
      }
    }
    return ''
  }

  // Rename local file metadata
  rename(id: string, newName: string): void {
    const attachment = attachmentStorage.getById(id)
    if (!attachment) return
    attachmentStorage.save({ ...attachment, name: newName })
  }

  // Delete attachment metadata and local bytes
  async deleteAttachment(id: string): Promise<void> {
    const attachment = attachmentStorage.getById(id)
    if (!attachment) return

    // 1. Cancel active upload
    if (this.activeUploads.has(id)) {
      this.activeUploads.get(id)?.abort()
      this.activeUploads.delete(id)
    }

    // 2. Delete local file
    try {
      if (Capacitor.isNativePlatform() && attachment.localPath) {
        const pathParts = attachment.localPath.split('/')
        const path = pathParts[pathParts.length - 1]
        await Filesystem.deleteFile({
          path,
          directory: Directory.Documents
        })
      } else {
        await idb.delete(STORES.ATTACHMENTS_DATA, id)
      }
    } catch (err) {
      console.warn('[FilePicker] File local deletion warning:', err)
    }

    // 3. Mark soft-deleted for Supabase sync
    attachmentStorage.remove(id)
  }

  // Returns total local storage usage for attachment files
  async getStorageUsage(): Promise<number> {
    let bytes = 0
    try {
      const attachments = attachmentStorage.getAll()
      for (const a of attachments) {
        bytes += a.size || 0
      }
    } catch (err) {
      console.error(err)
    }
    return bytes
  }
}

export const filePickerService = new FilePickerService()
