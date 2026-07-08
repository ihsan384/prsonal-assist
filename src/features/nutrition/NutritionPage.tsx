import { useState } from 'react'
import { motion } from 'framer-motion'
import { Droplets, Plus, Flame } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { ProgressBar, ProgressRing } from '@/components/ui/ProgressRing'
import { FAB } from '@/components/ui/FAB'

const meals = [
  {
    id: '1', type: 'Breakfast', time: '7:30 AM', name: 'Oats with Banana & Nuts',
    calories: 420, protein: 18, carbs: 65, fat: 12, emoji: '🥣',
  },
  {
    id: '2', type: 'Lunch', time: '1:00 PM', name: 'Chicken Rice Bowl',
    calories: 680, protein: 52, carbs: 72, fat: 18, emoji: '🍱',
  },
  {
    id: '3', type: 'Snack', time: '4:00 PM', name: 'Greek Yogurt + Almonds',
    calories: 280, protein: 20, carbs: 18, fat: 14, emoji: '🥛',
  },
  {
    id: '4', type: 'Pre-workout', time: '5:30 PM', name: 'Banana + Whey Shake',
    calories: 260, protein: 30, carbs: 32, fat: 2, emoji: '🍌',
  },
]

const goals = { calories: 2200, protein: 160, carbs: 250, fat: 65, water: 3000 }
const totals = meals.reduce((acc, m) => ({
  calories: acc.calories + m.calories,
  protein: acc.protein + m.protein,
  carbs: acc.carbs + m.carbs,
  fat: acc.fat + m.fat,
}), { calories: 0, protein: 0, carbs: 0, fat: 0 })

const mealTypeColors: Record<string, string> = {
  Breakfast: '#f59e0b',
  Lunch: '#10b981',
  Snack: '#7c6aff',
  Dinner: '#f97316',
  'Pre-workout': '#06b6d4',
  'Post-workout': '#8b5cf6',
}

export default function NutritionPage() {
  const [water, setWater] = useState(1800)
  const waterGoal = goals.water
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
              color="#f97316"
            >
              <div className="flex flex-col items-center">
                <span className="text-sm font-bold text-[#f0f0f5]">{totals.calories}</span>
                <span className="text-[8px] text-[#55556a]">eaten</span>
              </div>
            </ProgressRing>
            <div className="flex-1">
              <div className="flex items-center gap-1 mb-1">
                <Flame size={14} className="text-[#f97316]" />
                <p className="text-sm font-semibold text-[#f0f0f5]">{goals.calories - totals.calories} kcal remaining</p>
              </div>
              <div className="flex flex-col gap-2">
                {[
                  { label: 'Protein', value: totals.protein, goal: goals.protein, color: '#7c6aff', unit: 'g' },
                  { label: 'Carbs', value: totals.carbs, goal: goals.carbs, color: '#10b981', unit: 'g' },
                  { label: 'Fat', value: totals.fat, goal: goals.fat, color: '#f59e0b', unit: 'g' },
                ].map(macro => (
                  <div key={macro.label}>
                    <div className="flex justify-between text-[10px] mb-0.5">
                      <span className="text-[#55556a]">{macro.label}</span>
                      <span className="text-[#f0f0f5]">{macro.value}/{macro.goal}{macro.unit}</span>
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
            <Droplets size={20} className="text-[#06b6d4]" />
            <div className="flex-1">
              <ProgressBar value={water} max={waterGoal} color="#06b6d4" height={6} />
            </div>
            <span className="text-sm font-semibold text-[#f0f0f5]">{Math.round((water / waterGoal) * 100)}%</span>
          </div>
          <div className="flex gap-1.5 mb-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 h-8 rounded-lg cursor-pointer transition-all"
                style={{ backgroundColor: i < waterGlasses ? '#06b6d4' : 'rgba(255,255,255,0.04)' }}
                onClick={() => setWater(Math.min(waterGoal, (i + 1) * 250))}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {[250, 500].map(ml => (
              <Button
                key={ml}
                variant="secondary"
                size="sm"
                onClick={() => setWater(v => Math.min(v + ml, waterGoal))}
                className="flex-1"
                icon={<Droplets size={12} />}
              >
                +{ml}ml
              </Button>
            ))}
          </div>
        </Card>
      </div>

      {/* Meals */}
      <div className="mb-5">
        <SectionHeader title="Today's Meals" action={
          <Button variant="ghost" size="sm" icon={<Plus size={12} />}>Add Meal</Button>
        } />
        <div className="flex flex-col gap-3">
          {meals.map((meal, i) => (
            <motion.div
              key={meal.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Card hover>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{meal.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Badge size="sm" style={{ backgroundColor: `${mealTypeColors[meal.type]}15`, color: mealTypeColors[meal.type] }}>
                        {meal.type}
                      </Badge>
                      <span className="text-[10px] text-[#55556a]">{meal.time}</span>
                    </div>
                    <p className="text-sm font-medium text-[#f0f0f5] truncate">{meal.name}</p>
                    <p className="text-[10px] text-[#55556a] mt-0.5">
                      P:{meal.protein}g · C:{meal.carbs}g · F:{meal.fat}g
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-sm font-bold text-[#f0f0f5]">{meal.calories}</p>
                    <p className="text-[10px] text-[#55556a]">kcal</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Macro Breakdown */}
      <div className="mb-5">
        <SectionHeader title="Macro Breakdown" />
        <Card>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { label: 'Protein', value: totals.protein, goal: goals.protein, color: '#7c6aff' },
              { label: 'Carbs', value: totals.carbs, goal: goals.carbs, color: '#10b981' },
              { label: 'Fat', value: totals.fat, goal: goals.fat, color: '#f59e0b' },
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
                  <p className="text-sm font-bold text-[#f0f0f5]">{macro.value}g</p>
                  <p className="text-[10px] text-[#55556a]">{macro.label}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <FAB onClick={() => {}} />
    </PageWrapper>
  )
}
