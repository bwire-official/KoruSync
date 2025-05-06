'use client'

import { Button } from '@/components/ui/Button'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { CheckCircle, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface IntroStepProps {
  onComplete: () => void
  loading: boolean
}

export function IntroStep({ onComplete, loading }: IntroStepProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return

    try {
      onComplete()
    } catch (error) {
      console.error('Error completing onboarding:', error)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex justify-center"
      >
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome to KoruSync!
        </h2>
        <p className="text-base text-gray-600 dark:text-gray-400">
          You're all set to start your journey with us
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-6"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              We've helped you set up:
            </p>
          </div>
          <ul className="space-y-3">
            {[
              { text: 'Your unique username', color: '#10B981' },
              { text: 'Your local timezone', color: '#06B6D4' },
              { text: 'Your life pillars', color: '#8B5CF6' }
            ].map((item, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${item.color}20` }}
                >
                  <CheckCircle className="w-4 h-4" style={{ color: item.color }} />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-200">{item.text}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Button
          type="submit"
          onClick={handleSubmit}
          isLoading={loading}
          disabled={loading}
          className="w-full mt-6 py-3 text-base font-medium"
          variant="primary"
        >
          Get Started
        </Button>
      </motion.div>
    </motion.div>
  )
} 