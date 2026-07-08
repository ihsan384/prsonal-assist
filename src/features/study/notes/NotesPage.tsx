import { useState, useEffect } from 'react'
import { Plus, Pin, Trash2 } from 'lucide-react'
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

export default function NotesPage() {
  const toast = useToast()
  const [notes, setNotes] = useState<StudyNote[]>([])
  const [search, setSearch] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tagsInput, setTagsInput] = useState('')

  const [activeNote, setActiveNote] = useState<StudyNote | null>(null)

  useEffect(() => {
    setNotes(studyERPStorage.getNotes())
  }, [])

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      toast.error('Please enter title and content.')
      return
    }

    const note: StudyNote = {
      id: `note-${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      isPinned: false,
      tags: tagsInput.split(',').map(s => s.trim()).filter(Boolean),
      dateCreated: new Date().toISOString(),
      dateUpdated: new Date().toISOString()
    }

    studyERPStorage.addNote(note)
    setNotes(studyERPStorage.getNotes())

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
    toast.info('Note pinned state updated.')
  }

  const deleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const list = studyERPStorage.getNotes()
    const updated = list.filter(n => n.id !== id)
    studyERPStorage.saveNotes(updated)
    setNotes(updated)
    if (activeNote?.id === id) setActiveNote(null)
    toast.success('Note deleted successfully.')
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
      <div className="flex justify-between items-center">
        <SectionHeader title="Study Notes & Guides" subtitle="Write markdown summaries, pin critical formulas and browse tags" compact />
        <Button 
          variant="secondary" 
          size="sm" 
          icon={<Plus size={12} />}
          onClick={() => setIsModalOpen(true)}
        >
          Add Note
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Notes list pane */}
        <div className="flex flex-col gap-3">
          <SearchBar
            placeholder="Search notes content..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onClear={() => setSearch('')}
          />

          <div className="flex flex-col gap-2 overflow-y-auto max-h-[400px] border border-[var(--border)] rounded-[12px] p-2 bg-[var(--bg-subtle)] shrink-0">
            {sortedNotes.length === 0 ? (
              <p className="text-xs text-[var(--text-3)] text-center py-6">No notes found.</p>
            ) : (
              sortedNotes.map(n => (
                <div
                  key={n.id}
                  onClick={() => setActiveNote(n)}
                  className={`p-3 rounded-[8px] cursor-pointer border text-xs flex justify-between items-start transition-all ${
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
                      className="text-[var(--text-4)] hover:text-[var(--accent)] cursor-pointer"
                    >
                      <Pin size={11} />
                    </button>
                    <button 
                      onClick={(e) => deleteNote(n.id, e)} 
                      className="text-[var(--text-4)] hover:text-[var(--error)] cursor-pointer"
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
              <div>
                <div className="flex justify-between items-start gap-4 pb-3 border-b border-[var(--border)]">
                  <div>
                    <h2 className="text-sm font-bold text-[var(--text)]">{activeNote.title}</h2>
                    <p className="text-[10px] text-[var(--text-3)] mt-0.5">Updated: {new Date(activeNote.dateUpdated).toLocaleDateString()}</p>
                  </div>
                  {activeNote.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap justify-end">
                      {activeNote.tags.map(t => (
                        <Badge key={t} variant="default" size="sm">{t}</Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Markdown text body */}
                <div className="mt-4 text-xs text-[var(--text-2)] leading-relaxed whitespace-pre-wrap font-sans">
                  {activeNote.content}
                </div>
              </div>
              
              <div className="border-t border-[var(--border)] pt-3 mt-4 text-[10px] text-[var(--text-4)]">
                Ihsan OS Markdown Note Viewer
              </div>
            </Card>
          ) : (
            <Card className="min-h-[300px] flex items-center justify-center text-xs text-[var(--text-3)]">
              Select a note from the left list to view or edit details.
            </Card>
          )}
        </div>

      </div>

      {/* Add Note Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Study Note"
        subtitle="Write key takeaways or integration instructions."
      >
        <form onSubmit={handleAddNote} className="flex flex-col gap-4">
          <Input
            label="Note Title *"
            placeholder="e.g. Physics laws summary, Chem reactions list"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <Textarea
            label="Note content (Markdown text supported) *"
            placeholder="Write concepts here..."
            value={content}
            onChange={e => setContent(e.target.value)}
            className="min-h-[150px]"
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
    </PageWrapper>
  )
}
