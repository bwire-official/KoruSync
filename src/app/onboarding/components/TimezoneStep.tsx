'use client'

import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import moment from 'moment-timezone'

interface TimezoneStepProps {
  initialTimezone: string
  onComplete: (data: { timezone: string }) => void
  loading: boolean
}

export function TimezoneStep({ initialTimezone, onComplete, loading }: TimezoneStepProps) {
  const [timezone, setTimezone] = useState(initialTimezone)
  const [timezones, setTimezones] = useState<Array<{ value: string; label: string }>>([])

  useEffect(() => {
    // Get all available timezones and format them
    const allTimezones = moment.tz.names().map(tz => {
      const offset = moment.tz(tz).format('Z')
      const isDST = moment.tz(tz).isDST()
      return {
        value: tz,
        label: `${tz} (UTC${offset})${isDST ? ' (DST)' : ''}`
      }
    })

    // Sort timezones by offset and name
    allTimezones.sort((a, b) => {
      const offsetA = moment.tz(a.value).format('Z')
      const offsetB = moment.tz(b.value).format('Z')
      if (offsetA !== offsetB) return offsetA.localeCompare(offsetB)
      return a.value.localeCompare(b.value)
    })

    setTimezones(allTimezones)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (loading || !timezone) return

    onComplete({ timezone })
  }

  return (
    <>
      <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-1">
        Set Your Timezone
      </h2>
      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
        This helps us show you the right times for your activities
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative group">
          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-colors duration-200 group-focus-within:text-cyan-500 dark:group-focus-within:text-emerald-500" />
          <Select
            id="timezone"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            required
            disabled={loading}
            className="pl-10"
          >
            <option value="">Select your timezone</option>
            {timezones.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </Select>
        </div>

        <Button 
          type="submit" 
          fullWidth 
          isLoading={loading} 
          disabled={loading || !timezone} 
          className="mt-6"
        >
          Continue
        </Button>
      </form>
    </>
  )
} 