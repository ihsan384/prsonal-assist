import { useState } from 'react'
import { motion } from 'framer-motion'
import { Droplets, Plus, Flame, Utensils, Coffee, Apple, Zap, Activity, Trash2 } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { ProgressBar, ProgressRing } from '@/components/ui/ProgressRing'
import { FAB } from '@/components/ui/FAB'
import { Modal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal'
import { nutritionStorage } from '@/services/storage'

const mealTypeColors: Record<string, string> = {
  Breakfast: '#d97706',
  Lunch: '#16a34a',
  Snack: 'var(--accent)',
  Dinner: '#ea580c',
  'Pre-workout': '#0284c7',
  'Post-workout': '#7c3aed',
}

const mealTypeIcons: Record<string, React.ComponentType<any>> = {
  Breakfast: Coffee,
  Lunch: Utensils,
  Dinner: Utensils,
  Snack: Apple,
  'Pre-workout': Zap,
  'Post-workout': Activity,
}

export default function NutritionPage() {
  const [meals, setMeals] = useState<any[]>(() => nutritionStorage.getMeals())
  const [water, setWater] = useState(() => nutritionStorage.getWaterToday())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState('Breakfast')
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')

  // Delete states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [mealToDelete, setMealToDelete] = useState<string | null>(null)

  const goals = nutritionStorage.getGoals()

  const reloadMeals = () => {
    setMeals(nutritionStorage.getMeals())
  }

  const persistWater = (val: number) => {
    setWater(val)
    nutritionStorage.setWaterToday(val)
  }

  const totals = meals.reduce((acc, m) => ({
    calories: acc.calories + (m.calories || 0),
    protein: acc.protein + (m.protein || 0),
    carbs: acc.carbs + (m.carbs || 0),
    fat: acc.fat + (m.fat || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 })

  const handleAddMeal = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const now = new Date()
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

    nutritionStorage.addMeal({
      type,
      time: timeStr,
      name: name.trim(),
      calories: Number(calories) || 300,
      protein: Number(protein) || 20,
      carbs: Number(carbs) || 30,
      fat: Number(fat) || 10,
      date: new Date().toISOString().split('T')[0],
    } as any)

    reloadMeals()
    setIsModalOpen(false)

    // Reset Form
    setName('')
    setType('Breakfast')
    setCalories('')
    setProtein('')
    setCarbs('')
    setFat('')
  }

  const handleDeleteClick = (id: string) => {
    setMealToDelete(id)
    setIsDeleteOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (mealToDelete) {
      nutritionStorage.removeMeal(mealToDelete)
      reloadMeals()
    }
    setIsDeleteOpen(false)
    setMealToDelete(null)
  }

  const waterGoal = goals.water || 3000
  const waterGlasses = Math.round(water / 250)

  return (
    <PageWrapper>
      {/* Calorie Overview */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <Card>
          <div className="flex items-center gap-4">
            <ProgressRing
              value={totals.calories}
              max={goals.calories}
              size={88}
              strokeWidth={7}
              color="#ea580c"
            >
              <div className="flex flex-col items-center">
                <span className="text-sm font-bold text-[var(--text)]">{totals.calories}</span>
                <span className="text-[8px] text-[var(--text-3)] uppercase tracking-wider font-semibold">eaten</span>
              </div>
            </ProgressRing>
            <div className="flex-1">
              <div className="flex items-center gap-1 mb-1">
                <Flame size={14} className="text-[#ea580c]" />
                <p className="text-sm font-semibold text-[var(--text)]">
                  {Math.max(0, goals.calories - totals.calories)} kcal remaining
                </p>
              </div>
              <div className="flex flex-col gap-2">
                {[
                  { label: 'Protein', value: totals.protein, goal: goals.protein, color: 'var(--accent)', unit: 'g' },
                  { label: 'Carbs', value: totals.carbs, goal: goals.carbs, color: '#16a34a', unit: 'g' },
                  { label: 'Fat', value: totals.fat, goal: goals.fat, color: '#d97706', unit: 'g' },
                ].map(macro => (
                  <div key={macro.label}>
                    <div className="flex justify-between text-[10px] mb-0.5">
                      <span className="text-[var(--text-3)] font-medium">{macro.label}</span>
                      <span className="text-[var(--text)] font-semibold">{macro.value}/{macro.goal}{macro.unit}</span>
                    </div>
                    <ProgressBar value={macro.value} max={macro.goal} color={macro.color} height={3} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Water Tracker */}
      <div className="mb-5">
        <SectionHeader title="Water Intake" subtitle={`${water}ml of ${waterGoal}ml`} />
        <Card>
          <div className="flex items-center gap-3 mb-3">
            <Droplets size={20} className="text-[#0284c7]" />
            <div className="flex-1">
              <ProgressBar value={water} max={waterGoal} color="#0284c7" height={6} />
            </div>
            <span className="text-sm font-bold text-[var(--text)]">{Math.round((water / waterGoal) * 100)}%</span>
          </div>
          <div className="flex gap-1.5 mb-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 h-8 rounded-lg cursor-pointer border transition-all"
                style={{
                  backgroundColor: i < waterGlasses ? '#0284c7' : 'transparent',
                  borderColor: i < waterGlasses ? '#0284c7' : 'var(--border)',
                }}
                onClick={() => persistWater(Math.min(waterGoal, (i + 1) * 250))}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {[250, 500].map(ml => (
              <Button
                key={ml}
                variant="secondary"
                size="sm"
                onClick={() => persistWater(Math.min(water + ml, waterGoal))}
                className="flex-1"
                icon={<Droplets size={12} />}
              >
                +{ml}ml
              </Button>
            ))}
          </div>
        </Card>
      </div>

      {meals.length === 0 ? (
        <EmptyState
          icon={<Utensils size={24} />}
          title="No meals logged today"
          description="Log your breakfast, lunch, dinner, or snacks to track calorie goals and macros."
          action={
            <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
              Log your first meal
            </Button>
          }
        />
      ) : (
        <>
          {/* Meals */}
          <div className="mb-5">
            <SectionHeader title="Today's Meals" action={
              <Button variant="ghost" size="sm" icon={<Plus size={12} />} onClick={() => setIsModalOpen(true)}>Add Meal</Button>
            } />
            <div className="flex flex-col gap-3">
              {meals.map((meal, i) => {
                const MealIcon = mealTypeIcons[meal.type] || Utensils
                return (
                  <motion.div
                    key={meal.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Card hover>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--bg-subtle)] border border-[var(--border)] flex-shrink-0" style={{ color: mealTypeColors[meal.type] }}>
                            <MealIcon size={18} />
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <div className="flex items-center gap-2 mb-0.5">
                              <Badge size="sm" style={{ backgroundColor: `${mealTypeColors[meal.type]}15`, color: mealTypeColors[meal.type] }}>
                                {meal.type}
                              </Badge>
                              <span className="text-[10px] text-[var(--text-3)] font-medium">{meal.time}</span>
                            </div>
                            <p className="text-sm font-semibold text-[var(--text)] truncate">{meal.name}</p>
                            <p className="text-[10px] text-[var(--text-3)] font-medium mt-0.5">
                              P: {meal.protein}g · C: {meal.carbs}g · F: {meal.fat}g
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 flex-shrink-0 text-right">
                          <div>
                            <p className="text-sm font-bold text-[var(--text)]">{meal.calories}</p>
                            <p className="text-[10px] text-[var(--text-3)] font-medium uppercase tracking-wider">kcal</p>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteClick(meal.id) }}
                            className="text-[var(--text-4)] hover:text-[var(--error)] p-1 transition-colors"
                            title="Delete Meal"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Macro Breakdown */}
          <div className="mb-5">
            <SectionHeader title="Macro Breakdown" />
            <Card>
              <div className="grid grid-cols-3 gap-4 text-center">
                {[
                  { label: 'Protein', value: totals.protein, goal: goals.protein, color: 'var(--accent)' },
                  { label: 'Carbs', value: totals.carbs, goal: goals.carbs, color: '#16a34a' },
                  { label: 'Fat', value: totals.fat, goal: goals.fat, color: '#d97706' },
                ].map(macro => (
                  <div key={macro.label} className="flex flex-col items-center gap-2">
                    <ProgressRing
                      value={macro.value}
                      max={macro.goal}
                      size={60}
                      strokeWidth={5}
                      color={macro.color}
                      showValue
                    />
                    <div>
                      <p className="text-sm font-bold text-[var(--text)]">{macro.value}g</p>
                      <p className="text-[10px] text-[var(--text-3)] font-medium">{macro.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}

      <FAB onClick={() => setIsModalOpen(true)} label="Add Meal" extended />

      {/* Add Meal Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Meal">
        <form onSubmit={handleAddMeal} className="flex flex-col gap-4">
          <Input
            label="Meal Name"
            placeholder="e.g. Rice with Grilled Chicken"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            autoFocus
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Meal Type"
              value={type}
              onChange={e => setType(e.target.value)}
              options={[
                { value: 'Breakfast', label: 'Breakfast' },
                { value: 'Lunch', label: 'Lunch' },
                { value: 'Dinner', label: 'Dinner' },
                { value: 'Snack', label: 'Snack' },
                { value: 'Pre-workout', label: 'Pre-workout' },
                { value: 'Post-workout', label: 'Post-workout' },
              ]}
            />
            <Input
              label="Calories (kcal)"
              placeholder="e.g. 450"
              type="number"
              value={calories}
              onChange={e => setCalories(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Protein (g)"
              placeholder="e.g. 30"
              type="number"
              value={protein}
              onChange={e => setProtein(e.target.value)}
              required
            />
            <Input
              label="Carbs (g)"
              placeholder="e.g. 50"
              type="number"
              value={carbs}
              onChange={e => setCarbs(e.target.value)}
              required
            />
            <Input
              label="Fat (g)"
              placeholder="e.g. 10"
              type="number"
              value={fat}
              onChange={e => setFat(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Meal
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Meal Confirmation */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setMealToDelete(null) }}
        onConfirm={handleDeleteConfirm}
        title="Delete Meal"
        description="Are you sure you want to permanently delete this meal log?"
      />
    </PageWrapper>
  )
}
