import { useState, useEffect } from 'react'
import { Plus, Star, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea, SearchBar } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { studyERPStorage } from '@/services/storage/studyERP.storage'
import type { Formula, Subject, Chapter } from '@/types/study.types'
import { useToast } from '@/hooks/useToast'

export default function FormulaBookPage() {
  const toast = useToast()
  const [formulas, setFormulas] = useState<Formula[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [chapters, setChapters] = useState<Chapter[]>([])

  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSub, setSelectedSub] = useState('')
  const [selectedCh, setSelectedCh] = useState('')
  const [name, setName] = useState('')
  const [expression, setExpression] = useState('')
  const [description, setDescription] = useState('')
  const [example, setExample] = useState('')

  const [showOnlyFavs, setShowOnlyFavs] = useState(false)

  useEffect(() => {
    setFormulas(studyERPStorage.getFormulas())
    setSubjects(studyERPStorage.getSubjects())
    setChapters(studyERPStorage.getChapters())
  }, [])

  // Sync chapters
  const filteredChapters = chapters.filter(c => c.subjectId === selectedSub)

  const handleAddFormula = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSub || !name.trim() || !expression.trim()) {
      toast.error('Please fill in all required fields.')
      return
    }

    const newForm: Formula = {
      id: `form-${Date.now()}`,
      subjectId: selectedSub,
      chapterId: selectedCh || undefined,
      name: name.trim(),
      expression: expression.trim(),
      description: description.trim(),
      example: example.trim() || undefined,
      isFavourite: false
    }

    studyERPStorage.addFormula(newForm)
    setFormulas(studyERPStorage.getFormulas())

    setIsModalOpen(false)
    setName('')
    setExpression('')
    setDescription('')
    setExample('')
    toast.success('Formula registered successfully.')
  }

  const toggleFav = (id: string) => {
    const list = studyERPStorage.getFormulas()
    const updated = list.map(f => {
      if (f.id === id) {
        return { ...f, isFavourite: !f.isFavourite }
      }
      return f
    })
    studyERPStorage.saveFormulas(updated)
    setFormulas(updated)
    toast.info('Formula starred preference toggled.')
  }

  const getSubName = (id: string) => subjects.find(s => s.id === id)?.name ?? 'Syllabus'
  const getChName = (id?: string) => chapters.find(c => c.id === id)?.name ?? ''

  // Filter formulas
  const filteredFormulas = formulas.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase()) || 
                          f.expression.toLowerCase().includes(search.toLowerCase()) ||
                          f.description.toLowerCase().includes(search.toLowerCase())
    const matchesFav = showOnlyFavs ? f.isFavourite : true
    return matchesSearch && matchesFav
  })

  return (
    <PageWrapper>
      <div className="flex justify-between items-center">
        <SectionHeader title="Formula Book Directory" subtitle="Quick lookup of equations, theorems and key parameters" compact />
        <Button 
          variant="secondary" 
          size="sm" 
          icon={<Plus size={12} />}
          onClick={() => setIsModalOpen(true)}
        >
          Add Formula
        </Button>
      </div>

      {/* Search and filter controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <SearchBar
          placeholder="Search formulas or equations..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onClear={() => setSearch('')}
          className="flex-1"
        />
        <Button
          variant={showOnlyFavs ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setShowOnlyFavs(!showOnlyFavs)}
          icon={<Star size={12} className={showOnlyFavs ? 'fill-white' : ''} />}
        >
          {showOnlyFavs ? 'Showing Starred' : 'Show Starred Only'}
        </Button>
      </div>

      {/* Formula list layout */}
      <div>
        {filteredFormulas.length === 0 ? (
          <Card className="text-center py-12">
            <AlertCircle className="mx-auto text-[var(--text-4)] mb-3" size={24} />
            <p className="text-sm font-semibold text-[var(--text-2)]">No formulas found</p>
            <p className="text-xs text-[var(--text-3)] mt-1">Refine search parameters or register new equations.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredFormulas.map(f => (
              <Card key={f.id} className="p-4 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-[var(--text-3)] font-semibold">{getSubName(f.subjectId)}</span>
                        {f.chapterId && <Badge variant="default" size="sm">{getChName(f.chapterId)}</Badge>}
                      </div>
                      <h4 className="text-xs font-bold text-[var(--text)] mt-1">{f.name}</h4>
                    </div>

                    <button 
                      onClick={() => toggleFav(f.id)}
                      className={`text-xs cursor-pointer hover:scale-110 transition-all ${f.isFavourite ? 'text-[var(--warning)]' : 'text-[var(--text-4)]'}`}
                    >
                      ★
                    </button>
                  </div>

                  {/* Formula body expression */}
                  <div className="my-3 p-3 bg-[var(--bg-muted)] border border-[var(--border)] rounded-[8px] text-center">
                    <span className="font-mono text-sm font-bold text-[var(--accent)] select-all">{f.expression}</span>
                  </div>

                  <p className="text-[11px] text-[var(--text-3)] leading-relaxed">
                    {f.description}
                  </p>

                  {f.example && (
                    <div className="mt-3 pt-2.5 border-t border-[var(--border)] text-[10.5px] text-[var(--text-3)]">
                      <span className="font-semibold text-[var(--text-2)]">Example:</span> <code className="font-mono text-[var(--text-2)]">{f.example}</code>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Formula Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Formula Reference"
        subtitle="Register custom formulas and descriptions."
      >
        <form onSubmit={handleAddFormula} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Subject *"
              options={subjects.map(s => ({ value: s.id, label: s.name }))}
              value={selectedSub}
              onChange={e => setSelectedSub(e.target.value)}
              placeholder="Select Subject"
            />
            <Select
              label="Chapter (optional)"
              options={filteredChapters.map(c => ({ value: c.id, label: c.name }))}
              value={selectedCh}
              onChange={e => setSelectedCh(e.target.value)}
              placeholder="Select Chapter"
              disabled={!selectedSub}
            />
          </div>

          <Input
            label="Formula Name *"
            placeholder="e.g. Quadratic Formula, Biot-Savart Law"
            value={name}
            onChange={e => setName(e.target.value)}
          />

          <Input
            label="Formula Expression (LaTeX/Text) *"
            placeholder="e.g. x = (-b ± √(b² - 4ac)) / 2a"
            value={expression}
            onChange={e => setExpression(e.target.value)}
          />

          <Textarea
            label="Description / Variables definition"
            placeholder="e.g. a, b, c are coefficients..."
            value={description}
            onChange={e => setDescription(e.target.value)}
          />

          <Input
            label="Example usage (optional)"
            placeholder="e.g. x² - 5x + 6 = 0 gives x = 2, 3"
            value={example}
            onChange={e => setExample(e.target.value)}
          />

          <div className="flex justify-end gap-2 mt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Formula
            </Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  )
}
