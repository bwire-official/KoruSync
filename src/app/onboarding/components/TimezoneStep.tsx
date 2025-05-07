'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { Clock, Globe, Search, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import moment from 'moment-timezone'
import { motion, AnimatePresence } from 'framer-motion'

interface TimezoneStepProps {
  initialTimezone: string
  onComplete: (data: { timezone: string }) => void
  loading: boolean
}

// Group timezones by region
const TIMEZONE_REGIONS = {
  'Americas': ['America/'],
  'Europe': ['Europe/'],
  'Asia': ['Asia/'],
  'Pacific': ['Pacific/'],
  'Australia': ['Australia/'],
  'Africa': ['Africa/'],
  'Atlantic': ['Atlantic/'],
  'Indian': ['Indian/'],
  'UTC': ['UTC']
}

export function TimezoneStep({ initialTimezone, onComplete, loading }: TimezoneStepProps) {
  const [timezone, setTimezone] = useState(initialTimezone)
  const [currentTime, setCurrentTime] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading || !timezone) return

    try {
      onComplete({ timezone })
    } catch (error) {
      console.error('Error saving timezone:', error)
    }
  }

  // Get all timezones and organize them by region
  const timezonesByRegion = useMemo(() => {
    const allTimezones = moment.tz.names()
    const grouped: { [key: string]: Array<{ value: string; label: string }> } = {}

    Object.entries(TIMEZONE_REGIONS).forEach(([region, prefixes]) => {
      const regionTimezones = allTimezones
        .filter(tz => prefixes.some(prefix => tz.startsWith(prefix)))
        .map(tz => ({
          value: tz,
          label: `${tz.replace(/_/g, ' ')} (${moment().tz(tz).format('Z')})`
        }))
        .sort((a, b) => a.label.localeCompare(b.label))

      if (regionTimezones.length > 0) {
        grouped[region] = regionTimezones
      }
    })

    return grouped
  }, [])

  // Filter timezones based on search query
  const filteredTimezones = useMemo(() => {
    if (!searchQuery) return timezonesByRegion

    const query = searchQuery.toLowerCase()
    const filtered: { [key: string]: Array<{ value: string; label: string }> } = {}

    Object.entries(timezonesByRegion).forEach(([region, timezones]) => {
      const matches = timezones.filter(tz => 
        tz.label.toLowerCase().includes(query)
      )
      if (matches.length > 0) {
        filtered[region] = matches
      }
    })

    return filtered
  }, [timezonesByRegion, searchQuery])

  const handleTimezoneSelect = (tz: string) => {
    setTimezone(tz)
    setIsOpen(false)
    setSearchQuery('')
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
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
          <Clock className="w-8 h-8 text-white" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center"
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
          Set Your Timezone
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          This helps us show you the right times for your activities
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          <div className="relative" ref={dropdownRef}>
            <div className="relative group">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors duration-200 group-focus-within:text-cyan-500 dark:group-focus-within:text-emerald-500" />
              <Input
                ref={inputRef}
                type="text"
                value={timezone}
                onClick={() => {
                  setIsOpen(true)
                  inputRef.current?.focus()
                }}
                readOnly
                placeholder="Select your timezone"
                className="pl-12 pr-10 text-base py-3 cursor-pointer"
              />
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-transform duration-200 group-focus-within:text-cyan-500 dark:group-focus-within:text-emerald-500" />
            </div>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg max-h-[400px] overflow-hidden"
                  style={{ position: 'fixed', width: dropdownRef.current?.offsetWidth }}
                >
                  <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search timezones..."
                        className="pl-10 text-sm"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="overflow-y-auto max-h-[350px]">
                    {Object.entries(filteredTimezones).map(([region, timezones]) => (
                      <div key={region} className="py-2">
                        <div className="px-4 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50">
                          {region}
                        </div>
                        {timezones.map((tz) => (
                          <button
                            key={tz.value}
                            type="button"
                            onClick={() => handleTimezoneSelect(tz.value)}
                            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                              timezone === tz.value ? 'bg-gray-50 dark:bg-gray-700/50' : ''
                            }`}
                          >
                            {tz.label}
                          </button>
                        ))}
                      </div>
                    ))}
                    {Object.keys(filteredTimezones).length === 0 && (
                      <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                        No timezones found matching "{searchQuery}"
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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

        <Button
          type="submit"
          isLoading={loading}
          loadingText="Setting Timezone..."
          disabled={loading || !timezone}
          className="w-full mt-4 py-2.5 text-sm font-medium bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          variant="primary"
        >
          Continue
        </Button>
      </form>
    </motion.div>
  )
} 