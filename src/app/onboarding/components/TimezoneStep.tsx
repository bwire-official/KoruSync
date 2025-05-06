'use client'

import { useState, useEffect } from 'react'
import { Clock, Globe } from 'lucide-react'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import moment from 'moment-timezone'
import { motion, AnimatePresence } from 'framer-motion'

interface TimezoneStepProps {
  initialTimezone: string
  onComplete: (data: { timezone: string }) => void
  loading: boolean
}

export function TimezoneStep({ initialTimezone, onComplete, loading }: TimezoneStepProps) {
  const [timezone, setTimezone] = useState(initialTimezone)
  const [currentTime, setCurrentTime] = useState('')

  useEffect(() => {
    if (timezone) {
      const updateTime = () => {
        const time = moment().tz(timezone).format('h:mm A')
        setCurrentTime(time)
      }
      updateTime()
      const interval = setInterval(updateTime, 1000)
      return () => clearInterval(interval)
    }
  }, [timezone])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading || !timezone) return

    try {
      onComplete({ timezone })
    } catch (error) {
      console.error('Error saving timezone:', error)
    }
  }

  // Get all timezones and format them nicely
  const timezones = moment.tz.names().map(tz => ({
    value: tz,
    label: `${tz} (${moment().tz(tz).format('Z')})`
  }))

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
          <Clock className="w-10 h-10 text-white" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Set Your Timezone
        </h2>
        <p className="text-base text-gray-600 dark:text-gray-400">
          This helps us show you the right times for your activities
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          <div className="relative group">
            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors duration-200 group-focus-within:text-cyan-500 dark:group-focus-within:text-emerald-500" />
            <Select
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              required
              disabled={loading}
              className="pl-12 text-base py-3"
            >
              <option value="">Select your timezone</option>
              {timezones.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </Select>
          </div>

          <AnimatePresence>
            {timezone && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
              >
                <Globe className="w-5 h-5 text-cyan-500" />
                <span className="text-lg font-medium text-gray-900 dark:text-white">
                  {currentTime}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {timezone}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Button 
            type="submit" 
            fullWidth 
            isLoading={loading} 
            disabled={loading || !timezone} 
            className="mt-6 py-3 text-base font-medium"
          >
            Continue
          </Button>
        </motion.div>
      </form>
    </motion.div>
  )
} 