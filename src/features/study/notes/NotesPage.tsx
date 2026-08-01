import { useState, useEffect } from 'react'
import { Plus, Pin, Trash2, BookOpen } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, SearchBar } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { studyERPStorage } from '@/services/storage/studyERP.storage'
import type { StudyNote } from '@/types/study.types'
import { useToast } from '@/hooks/useToast'
import { EmptyState } from '@/components/ui/EmptyState'
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal'
import { AttachmentList } from '@/components/ui/AttachmentList'


export default function NotesPage() {
  const toast = useToast()
  const [notes, setNotes] = useState<StudyNote[]>([])
  const [search, setSearch] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tagsInput, setTagsInput] = useState('')

  const [activeNote, setActiveNote] = useState<StudyNote | null>(null)

  // Delete states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null)

  const reloadNotes = () => {
    setNotes(studyERPStorage.getNotes())
  }

  useEffect(() => {
    reloadNotes()
  }, [])

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required.')
      return
    }

    const newNote: StudyNote = {
      id: `note-${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      tags: tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(Boolean) : [],
      dateCreated: new Date().toISOString(),
      dateUpdated: new Date().toISOString(),
      isPinned: false
    }

    studyERPStorage.addNote(newNote)
    reloadNotes()

    setIsModalOpen(false)
    setTitle('')
    setContent('')
    setTagsInput('')
    toast.success('Note registered.')
  }

  const togglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const list = studyERPStorage.getNotes()
    const updated = list.map(n => {
      if (n.id === id) {
        return { ...n, isPinned: !n.isPinned }
      }
      return n
    })
    studyERPStorage.saveNotes(updated)
    setNotes(updated)
    if (activeNote?.id === id) {
      setActiveNote({ ...activeNote, isPinned: !activeNote.isPinned })
    }
    toast.info('Note pinned state updated.')
  }

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setNoteToDelete(id)
    setIsDeleteOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (noteToDelete) {
      studyERPStorage.removeNote(noteToDelete)
      reloadNotes()
      if (activeNote?.id === noteToDelete) setActiveNote(null)
      toast.success('Note deleted successfully.')
    }
    setIsDeleteOpen(false)
    setNoteToDelete(null)
  }

  // Filter notes
  const filteredNotes = notes.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) ||
                          n.content.toLowerCase().includes(search.toLowerCase())
    return matchesSearch
  })

  // Sort notes: Pinned first
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    return new Date(b.dateUpdated).getTime() - new Date(a.dateUpdated).getTime()
  })

  return (
    <PageWrapper>
      <SearchBar
        placeholder="Search notes content..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        onClear={() => setSearch('')}
        className="mb-4"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Left Side: Note List */}
        <div className="flex flex-col gap-3">
          <SectionHeader title="Note Directory" action={
            <Button variant="secondary" size="sm" icon={<Plus size={11} />} onClick={() => setIsModalOpen(true)}>Add</Button>
          } compact />

          <div className="flex flex-col gap-2.5 max-h-[450px] overflow-y-auto pr-1">
            {notes.length === 0 ? (
              <EmptyState
                icon={<BookOpen size={20} />}
                title="No study notes yet"
                description="Write summaries, equations, or concepts to remember."
                action={
                  <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
                    Create first note
                  </Button>
                }
              />
            ) : sortedNotes.length === 0 ? (
              <p className="text-center py-6 text-xs text-[var(--text-3)]">No matching notes found.</p>
            ) : (
              sortedNotes.map(n => (
                <div 
                  key={n.id}
                  onClick={() => setActiveNote(n)}
                  className={`p-3 rounded-[12px] border transition-all cursor-pointer flex items-center justify-between text-left ${
                    activeNote?.id === n.id 
                      ? 'bg-[var(--accent-bg)] border-[var(--accent-border)]' 
                      : 'bg-[var(--bg)] border-[var(--border)] hover:bg-[var(--bg-hover)]'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      {n.isPinned && <Pin size={11} className="text-[var(--accent)] shrink-0 fill-[var(--accent)]" />}
                      <span className="font-bold text-[var(--text)] truncate block">{n.title}</span>
                    </div>
                    <p className="text-[10px] text-[var(--text-3)] mt-1 truncate">{n.content}</p>
                  </div>

                  <div className="flex gap-1 shrink-0 ml-2">
                    <button 
                      onClick={(e) => togglePin(n.id, e)} 
                      className="text-[var(--text-4)] hover:text-[var(--accent)] cursor-pointer p-1"
                    >
                      <Pin size={11} />
                    </button>
                    <button 
                      onClick={(e) => handleDeleteClick(n.id, e)} 
                      className="text-[var(--text-4)] hover:text-[var(--error)] cursor-pointer p-1"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Note viewer pane */}
        <div className="md:col-span-2">
          {activeNote ? (
            <Card className="min-h-[300px] flex flex-col justify-between">
              <div className="text-left">
                <div className="flex justify-between items-start gap-4 pb-3 border-b border-[var(--border)]">
                  <div>
                    <h2 className="text-sm font-bold text-[var(--text)]">{activeNote.title}</h2>
                    <p className="text-[10px] text-[var(--text-3)] mt-0.5">Updated: {new Date(activeNote.dateUpdated).toLocaleDateString()}</p>
                  </div>
                  {activeNote.tags && activeNote.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap justify-end">
                      {activeNote.tags.map(t => (
                        <Badge key={t} variant="default" size="sm">{t}</Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Text body */}
                <div className="mt-4 text-xs text-[var(--text-2)] leading-relaxed whitespace-pre-wrap font-sans">
                  {activeNote.content}
                </div>

                {/* Secure File Attachments */}
                <div className="mt-6 pt-5 border-t border-[var(--border)]">
                  <h3 className="text-xs font-bold text-[var(--text)] mb-3">Secure Attachments</h3>
                  <AttachmentList parentType="notes" parentId={activeNote.id} />
                </div>
              </div>
              
              <div className="border-t border-[var(--border)] pt-3 mt-4 text-[10px] text-[var(--text-4)] text-left flex justify-between items-center">
                <span>Study ERP Markdown Note Viewer</span>
                <span className="font-semibold text-indigo-500">Secure Isolated Sandbox</span>
              </div>
            </Card>
          ) : (
            <Card className="min-h-[300px] flex items-center justify-center text-xs text-[var(--text-3)]">
              Select a note from the left list to view details.
            </Card>
          )}
        </div>

      </div>

      {/* Add Note Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Study Note"
        subtitle="Write key summaries or formulas."
      >
        <form onSubmit={handleAddNote} className="flex flex-col gap-4">
          <Input
            label="Note Title *"
            placeholder="e.g. Physics laws summary, Chem reactions list"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
          <Textarea
            label="Note content *"
            placeholder="Write concepts here..."
            value={content}
            onChange={e => setContent(e.target.value)}
            className="min-h-[150px]"
            required
          />
          <Input
            label="Tags (comma separated)"
            placeholder="e.g. revision, maths, formulas"
            value={tagsInput}
            onChange={e => setTagsInput(e.target.value)}
          />
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Note
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setNoteToDelete(null) }}
        onConfirm={handleDeleteConfirm}
        title="Delete Note"
        description="Are you sure you want to permanently delete this study note? This action cannot be undone."
        requireText="DELETE"
      />
    </PageWrapper>
  )
}
