import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Paperclip, Trash2, File, Edit2, Play, Pause, Download, UploadCloud, X } from 'lucide-react'
import { Card } from './Card'
import { Button } from './Button'
import { Input } from './Input'
import { Badge } from './Badge'
import { filePickerService } from '@/services/files/FilePickerService'
import type { AttachmentItem } from '@/services/files/FilePickerService'
import { attachmentStorage } from '@/services/storage'
import { useToast } from '@/hooks/useToast'

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}


interface AttachmentListProps {
  parentType: string
  parentId: string
}

export function AttachmentList({ parentType, parentId }: AttachmentListProps) {
  const toast = useToast()
  const [attachments, setAttachments] = useState<AttachmentItem[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [newName, setNewName] = useState('')

  // Load attachments on mount/id change
  const reload = () => {
    setAttachments(attachmentStorage.getByParent(parentType, parentId))
  }

  useEffect(() => {
    reload()
    
    // Refresh lists periodically when uploading
    const interval = setInterval(() => {
      const active = attachments.some(a => a.uploadStatus === 'uploading' || a.uploadStatus === 'pending')
      if (active) {
        reload()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [parentType, parentId])

  // Drag handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      toast.info(`Attaching ${files.length} file(s)...`)
      await filePickerService.pickAndSaveFiles(files, parentType, parentId)
      reload()
    }
  }

  // File picker handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      toast.info(`Attaching ${files.length} file(s)...`)
      await filePickerService.pickAndSaveFiles(files, parentType, parentId)
      reload()
    }
  }

  // Download handler (using signed URL security policy)
  const handleDownload = async (attachment: AttachmentItem) => {
    toast.info('Requesting secure signed URL...')
    const url = await filePickerService.getPreviewUrl(attachment)
    if (url) {
      window.open(url, '_blank')
    } else {
      toast.error('Could not generate preview link.')
    }
  }

  // Pause / Resume
  const handleTogglePause = (attachment: AttachmentItem) => {
    if (attachment.uploadStatus === 'uploading') {
      filePickerService.pauseUpload(attachment.id)
      toast.info('Upload paused.')
    } else {
      filePickerService.resumeUpload(attachment.id)
      toast.info('Resuming upload...')
    }
    reload()
  }

  // Delete
  const handleDelete = async (id: string) => {
    await filePickerService.deleteAttachment(id)
    toast.success('Attachment deleted.')
    reload()
  }

  // Rename
  const handleRenameSave = (id: string) => {
    if (!newName.trim()) return
    filePickerService.rename(id, newName.trim())
    setRenamingId(null)
    setNewName('')
    toast.success('File renamed.')
    reload()
  }

  return (
    <div className="flex flex-col gap-4 text-left">
      {/* Reusable File Drag Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all relative ${
          isDragOver 
            ? 'border-[var(--accent)] bg-[var(--accent-bg)]/20' 
            : 'border-[var(--border)] bg-[var(--bg-subtle)] hover:border-[var(--border-strong)]'
        }`}
      >
        <input
          type="file"
          id={`file-picker-${parentId}`}
          multiple
          onChange={handleFileChange}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
        <div className="flex flex-col items-center gap-2 pointer-events-none">
          <UploadCloud size={28} className="text-[var(--text-3)]" />
          <p className="text-xs font-semibold text-[var(--text)]">
            Drag & drop files here, or <span className="text-[var(--accent)]">browse files</span>
          </p>
          <p className="text-[10px] text-[var(--text-4)]">
            Supports Images, PDF, TXT, Word, Excel, Audio, and Video files.
          </p>
        </div>
      </div>

      {/* Render Attachments Lists */}
      {attachments.length > 0 && (
        <div className="flex flex-col gap-2">
          {attachments.map(a => {
            const isUploading = a.uploadStatus === 'uploading'
            const isPaused = a.uploadStatus === 'paused'
            const isFailed = a.uploadStatus === 'failed'

            return (
              <div
                key={a.id}
                className="border border-[var(--border)] p-3 rounded-2xl bg-[var(--bg)] flex flex-col gap-2 hover:border-[var(--border-strong)] transition-all"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <File size={16} className="text-[var(--text-3)] shrink-0" />
                    
                    {renamingId === a.id ? (
                      <div className="flex items-center gap-1.5 flex-1">
                        <Input
                          value={newName}
                          onChange={e => setNewName(e.target.value)}
                          placeholder="Enter new name"
                          autoFocus
                        />
                        <Button size="icon-sm" variant="primary" onClick={() => handleRenameSave(a.id)}>
                          ✓
                        </Button>
                        <Button size="icon-sm" variant="ghost" onClick={() => setRenamingId(null)}>
                          <X size={10} />
                        </Button>
                      </div>
                    ) : (
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-[var(--text)] truncate">{a.name}</p>
                        <p className="text-[10px] text-[var(--text-4)] mt-0.5">
                          {formatBytes(a.size)} | Status: <span className="font-semibold">{a.uploadStatus}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center gap-1">
                    {(isUploading || isPaused) && (
                      <button
                        onClick={() => handleTogglePause(a)}
                        className="p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-3)] cursor-pointer"
                        title={isUploading ? 'Pause Upload' : 'Resume Upload'}
                      >
                        {isUploading ? <Pause size={12} /> : <Play size={12} />}
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDownload(a)}
                      className="p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-3)] cursor-pointer"
                      title="Download / View securely"
                    >
                      <Download size={12} />
                    </button>
                    
                    <button
                      onClick={() => { setRenamingId(a.id); setNewName(a.name); }}
                      className="p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-3)] cursor-pointer"
                      title="Rename"
                    >
                      <Edit2 size={12} />
                    </button>

                    <button
                      onClick={() => handleDelete(a.id)}
                      className="p-1 rounded hover:bg-[var(--bg-hover)] text-red-500 cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Progress bar for uploads */}
                {isUploading && (
                  <div className="w-full bg-[var(--border)] h-1 rounded-full overflow-hidden">
                    <div
                      className="bg-[var(--accent)] h-full transition-all duration-300"
                      style={{ width: `${a.uploadProgress || 20}%` }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
