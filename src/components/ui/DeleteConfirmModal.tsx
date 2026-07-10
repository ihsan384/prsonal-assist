import { useState, useEffect } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import { Input } from './Input'
import { AlertCircle } from 'lucide-react'

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  requireText?: string // e.g. "DELETE" or "DELETE EVERYTHING"
  loading?: boolean
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  requireText,
  loading = false,
}: DeleteConfirmModalProps) {
  const [inputText, setInputText] = useState('')

  useEffect(() => {
    if (isOpen) {
      setInputText('')
    }
  }, [isOpen])

  const isDisabled = requireText ? inputText !== requireText : false

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isDisabled) {
      onConfirm()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <form onSubmit={handleSubmit} className="flex flex-col items-center text-center gap-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[var(--error-bg)] text-[var(--error)] animate-fade-in">
          <AlertCircle size={24} />
        </div>
        <div>
          <h3 className="text-base font-semibold text-[var(--text)]">{title}</h3>
          <p className="text-sm text-[var(--text-3)] mt-1">{description}</p>
        </div>
        
        {requireText && (
          <div className="w-full flex flex-col gap-2 mt-2">
            <p className="text-xs text-[var(--error)] font-bold text-left">
              Type <span className="font-mono">"{requireText}"</span> below to confirm:
            </p>
            <Input
              placeholder={`Type ${requireText} here`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              required
              autoFocus
            />
          </div>
        )}

        <div className="flex gap-3 w-full mt-2">
          <Button variant="secondary" fullWidth onClick={onClose} disabled={loading} type="button">
            Cancel
          </Button>
          <Button variant="destructive" fullWidth type="submit" loading={loading} disabled={isDisabled}>
            Delete
          </Button>
        </div>
      </form>
    </Modal>
  )
}
