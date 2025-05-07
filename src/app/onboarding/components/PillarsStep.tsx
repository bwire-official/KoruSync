'use client'

import { useState, useEffect } from 'react'
import { Plus, X, Layers, Sparkles } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/label'
import { motion, AnimatePresence } from 'framer-motion'

// Define the structure for a pillar object
interface Pillar {
  name: string
  color: string // Store color as hex string, e.g., '#10B981'
}

// Define the props interface with the correct pillar type
interface PillarsStepProps {
  initialPillars: Pillar[] // Expects array of Pillar objects
  onComplete: (data: { pillars: Pillar[] }) => void
  loading: boolean
}

// Default colors to cycle through for new pillars
const DEFAULT_COLORS = [
  '#34D399', // Emerald
  '#60A5FA', // Blue
  '#FBBF24', // Yellow
  '#F87171', // Red
  '#A78BFA', // Purple
  '#FB923C', // Orange
  '#2DD4BF', // Teal
  '#F472B6', // Pink
  '#818CF8', // Indigo
  '#4ADE80', // Green
]

// Preset pillar names (only names)
const PRESET_PILLAR_NAMES = [
  'Health & Fitness',
  'Career & Business',
  'Relationships',
  'Personal Growth',
  'Finances',
  'Spirituality',
  'Family',
  'Social Life',
  'Hobbies & Creativity',
  'Community Service',
  'Web3 & Crypto',
  'Education',
  'Travel',
  'Home & Living',
  'Wellness & Self-Care'
]

export function PillarsStep({ initialPillars, onComplete, loading }: PillarsStepProps) {
  // State now holds an array of Pillar objects
  const [pillars, setPillars] = useState<Pillar[]>([])
  const [newPillarName, setNewPillarName] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Initialize state with initialPillars only once
  useEffect(() => {
    setPillars(initialPillars || [])
  }, [initialPillars]) // Depend only on initialPillars

  // Helper to get the next default color
  const getNextColor = () => {
    return DEFAULT_COLORS[pillars.length % DEFAULT_COLORS.length]
  }

  // Check if a pillar name already exists
  const pillarExists = (name: string) => {
    return pillars.some(p => p.name.toLowerCase() === name.toLowerCase())
  }

  const handleAddPillar = (nameToAdd: string) => {
    const trimmedName = nameToAdd.trim()
    if (trimmedName && !pillarExists(trimmedName)) {
      const newPillar: Pillar = {
        name: trimmedName,
        color: getNextColor(),
      }
      setPillars([...pillars, newPillar])
      setNewPillarName('')
      setError(null)
    } else if (pillarExists(trimmedName)) {
      setError('This pillar already exists')
    }
  }

  const handleRemovePillar = (pillarToRemove: Pillar) => {
    setPillars(pillars.filter(pillar => pillar.name !== pillarToRemove.name))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading || pillars.length === 0) {
      setError('Please select at least one pillar')
      return
    }
    try {
      onComplete({ pillars })
    } catch (error) {
      console.error('Error saving pillars:', error)
      setError('Failed to save pillars. Please try again.')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex justify-center"
      >
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
          <Layers className="w-8 h-8 text-white" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center"
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
          Define Your Life Pillars
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Select or add the key areas you want to balance and track
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          {/* Preset Pillars Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-500" />
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Choose from presets:
              </Label>
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESET_PILLAR_NAMES.map((name, index) => {
                const isSelected = pillarExists(name)
                return (
                  <motion.button
                    key={name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    type="button"
                    onClick={() => {
                      if (!isSelected) {
                        handleAddPillar(name)
                      } else {
                        const pillarToRemove = pillars.find(p => p.name === name)
                        if (pillarToRemove) {
                          handleRemovePillar(pillarToRemove)
                        }
                      }
                    }}
                    className={`px-4 py-2 text-sm rounded-xl transition-all duration-200 ${
                      isSelected
                        ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white border-transparent shadow-md'
                        : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 shadow-sm hover:shadow-md'
                    }`}
                  >
                    {name} {isSelected ? <X className="inline w-3 h-3 ml-1" /> : <Plus className="inline w-3 h-3 ml-1" />}
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Custom Pillar Input Section */}
          <div className="space-y-3">
            <Label htmlFor="custom-pillar" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Add a custom pillar:
            </Label>
            <div className="flex gap-2">
              <Input
                id="custom-pillar"
                type="text"
                placeholder="e.g., Side Project"
                value={newPillarName}
                onChange={(e) => setNewPillarName(e.target.value)}
                className="flex-1"
                disabled={loading}
                error={error || undefined}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleAddPillar(newPillarName)}
                disabled={!newPillarName.trim() || pillarExists(newPillarName.trim()) || loading}
                className="px-4"
                aria-label="Add custom pillar"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Selected Pillars Display Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Your selected pillars:
            </Label>
            <AnimatePresence>
              {pillars.length === 0 ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-gray-400 dark:text-gray-500 italic"
                >
                  Select or add at least one pillar.
                </motion.p>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-wrap gap-2"
                >
                  {pillars.map((pillar, index) => (
                    <motion.div
                      key={pillar.name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ delay: index * 0.05 }}
                      className="group relative"
                    >
                      <div
                        className="flex items-center gap-2 pl-3 pr-2 py-2 text-white rounded-xl text-sm shadow-sm hover:shadow-md transition-all duration-200"
                        style={{ backgroundColor: pillar.color }}
                      >
                        <span>{pillar.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemovePillar(pillar)}
                          className="opacity-70 hover:opacity-100 p-1 rounded-lg hover:bg-black/10 transition-all duration-200"
                          aria-label={`Remove ${pillar.name}`}
                          disabled={loading}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <Button
          type="submit"
          isLoading={loading}
          loadingText="Saving Pillars..."
          disabled={loading || pillars.length === 0}
          className="w-full mt-4 py-2.5 text-sm font-medium bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          variant="primary"
        >
          Continue
        </Button>
      </form>
    </motion.div>
  )
}
