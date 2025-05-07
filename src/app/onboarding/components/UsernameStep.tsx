'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { InlineSpinner } from '@/components/ui/Loaders/InlineSpinner'
import { Check, X, User, Sparkles } from 'lucide-react'
import { useOnboardingStore } from '@/store/onboardingStore'
import { debounce } from 'lodash'
import { motion } from 'framer-motion'

type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid_format' | 'too_short' | 'api_error'

interface UsernameStepProps {
  initialUsername: string
  onComplete: (data: { username: string }) => void
  loading: boolean
  fullName?: string
}

export default function UsernameStep({ initialUsername, onComplete, loading, fullName }: UsernameStepProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { setUsername } = useOnboardingStore()
  const [username, setUsernameState] = useState(initialUsername)
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle')
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isCheckingSuggestions, setIsCheckingSuggestions] = useState(false)

  // Generate username suggestions based on full name
  const generateSuggestions = (name: string) => {
    if (!name) return []
    
    const nameParts = name.toLowerCase().split(' ')
    const suggestions = [
      nameParts[0], // First name
      nameParts[0] + nameParts[1]?.charAt(0), // First name + first letter of last name
      nameParts[0] + Math.floor(Math.random() * 1000), // First name + random number
      nameParts[0] + '_' + nameParts[1]?.charAt(0), // First name + underscore + first letter of last name
    ].filter(Boolean) // Remove any undefined values
    
    return suggestions
  }

  // Check if a username is available
  const checkUsernameAvailability = debounce(async (username: string) => {
    if (!username.trim()) {
      setUsernameStatus('idle')
      setUsernameError(null)
      return
    }

    // Client-side validation
    if (username.length < 3) {
      setUsernameStatus('too_short')
      setUsernameError('Username must be at least 3 characters')
      return
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setUsernameStatus('invalid_format')
      setUsernameError('Username can only contain letters, numbers, and underscores')
      return
    }

    setUsernameStatus('checking')
    try {
      const { data, error } = await supabase
        .from('users')
        .select('username')
        .ilike('username', username.toLowerCase())
        .maybeSingle()

      if (error) {
        console.error('Supabase error:', error)
        throw new Error(error.message)
      }

      if (data) {
        setUsernameStatus('taken')
        setUsernameError('This username is already taken')
      } else {
        setUsernameStatus('available')
        setUsernameError(null)
      }
    } catch (error) {
      console.error('Error checking username:', error instanceof Error ? error.message : 'Unknown error')
      setUsernameStatus('api_error')
      setUsernameError('Could not check username. Please try again.')
    }
  }, 500)

  // Check availability of suggested usernames
  const checkSuggestionsAvailability = async (suggestions: string[]) => {
    setIsCheckingSuggestions(true)
    const availableSuggestions: string[] = []

    for (const suggestion of suggestions) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('username')
          .ilike('username', suggestion.toLowerCase())
          .maybeSingle()

        if (!error && !data) {
          availableSuggestions.push(suggestion)
        }
      } catch (error) {
        console.error('Error checking suggestion:', error)
      }
    }

    setSuggestions(availableSuggestions)
    setIsCheckingSuggestions(false)
  }

  useEffect(() => {
    checkUsernameAvailability(username)
    return () => {
      checkUsernameAvailability.cancel()
    }
  }, [username])

  useEffect(() => {
    if (fullName) {
      const newSuggestions = generateSuggestions(fullName)
      checkSuggestionsAvailability(newSuggestions)
    }
  }, [fullName])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (usernameStatus !== 'available') return

    try {
      onComplete({ username: username.toLowerCase() })
    } catch (error) {
      console.error('Error updating username:', error instanceof Error ? error.message : 'Unknown error')
    }
  }

  const getStatusIcon = () => {
    switch (usernameStatus) {
      case 'checking':
        return <InlineSpinner className="h-5 w-5" />
      case 'available':
        return <Check className="h-5 w-5 text-emerald-500" />
      case 'taken':
      case 'invalid_format':
      case 'too_short':
      case 'api_error':
        return <X className="h-5 w-5 text-red-500" />
      default:
        return null
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
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
          <User className="w-8 h-8 text-white" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center"
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
          Choose Your Username
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          This will be your unique identifier on KoruSync
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-4"
      >
        <div className="relative">
          <Input
            type="text"
            value={username}
            onChange={(e) => setUsernameState(e.target.value)}
            placeholder="Enter username"
            className="pr-10"
            disabled={loading}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {getStatusIcon()}
          </div>
        </div>
        {usernameError && (
          <p className="text-sm text-red-500 mt-1">{usernameError}</p>
        )}
        {usernameStatus === 'available' && (
          <p className="text-sm text-emerald-500 mt-1">Username is available!</p>
        )}

        {/* Username Suggestions */}
        {suggestions.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
              <Sparkles className="h-4 w-4" />
              <span>Suggested usernames:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setUsernameState(suggestion)}
                  className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
        {isCheckingSuggestions && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <InlineSpinner className="h-4 w-4" />
            <span>Checking suggestions...</span>
          </div>
        )}
      </motion.div>

      <Button
        type="submit"
        onClick={handleSubmit}
        isLoading={loading}
        loadingText="Setting Username..."
        disabled={loading || usernameStatus !== 'available'}
        className="w-full mt-4 py-2.5 text-sm font-medium bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
        variant="primary"
      >
        {loading ? (
          <div className="flex items-center justify-center space-x-2">
            <InlineSpinner className="h-4 w-4 text-white" />
            <span>Setting Username...</span>
          </div>
        ) : (
          'Continue'
        )}
      </Button>
    </motion.div>
  )
} 