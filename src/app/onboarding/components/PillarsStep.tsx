'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface PillarsStepProps {
  initialPillars: string[]
  onComplete: (data: { pillars: string[] }) => void
  loading: boolean
}

const PRESET_PILLARS = [
  'Health & Fitness',
  'Career & Business',
  'Relationships',
  'Personal Growth',
  'Finances',
  'Spirituality',
  'Family',
  'Social Life',
  'Hobbies & Creativity',
  'Community Service'
]

export function PillarsStep({ initialPillars, onComplete, loading }: PillarsStepProps) {
  const [pillars, setPillars] = useState<string[]>(initialPillars)
  const [newPillar, setNewPillar] = useState('')

  const handleAddPillar = () => {
    if (newPillar.trim() && !pillars.includes(newPillar.trim())) {
      setPillars([...pillars, newPillar.trim()])
      setNewPillar('')
    }
  }

  const handleRemovePillar = (pillarToRemove: string) => {
    setPillars(pillars.filter(pillar => pillar !== pillarToRemove))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (loading || pillars.length === 0) return
    onComplete({ pillars })
  }

  return (
    <>
      <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-1">
        Define Your Life Pillars
      </h2>
      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
        These are the key areas of your life that you want to focus on and track
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">Preset pillars:</p>
          <div className="flex flex-wrap gap-2">
            {PRESET_PILLARS.map((pillar) => (
              <button
                key={pillar}
                type="button"
                onClick={() => {
                  if (!pillars.includes(pillar)) {
                    setPillars([...pillars, pillar])
                  }
                }}
                className={`px-3 py-1 text-sm rounded-lg transition-colors duration-200 ${
                  pillars.includes(pillar)
                    ? 'bg-cyan-500 dark:bg-emerald-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {pillar}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Add a custom pillar"
            value={newPillar}
            onChange={(e) => setNewPillar(e.target.value)}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleAddPillar}
            disabled={!newPillar.trim() || pillars.includes(newPillar.trim())}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">Your selected pillars:</p>
          <div className="flex flex-wrap gap-2">
            {pillars.map((pillar) => (
              <div
                key={pillar}
                className="flex items-center gap-1 px-3 py-1 bg-cyan-500 dark:bg-emerald-500 text-white rounded-lg"
              >
                <span>{pillar}</span>
                <button
                  type="button"
                  onClick={() => handleRemovePillar(pillar)}
                  className="hover:text-gray-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          fullWidth
          isLoading={loading}
          disabled={loading || pillars.length === 0}
          className="mt-6"
        >
          Continue
        </Button>
      </form>
    </>
  )
} 