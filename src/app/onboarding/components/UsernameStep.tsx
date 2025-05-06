'use client'

import { useState, useEffect } from 'react'
import { User, Check, X, Sparkles } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { motion, AnimatePresence } from 'framer-motion'

interface UsernameStepProps {
  initialUsername: string
  onComplete: (data: { username: string }) => void
  loading: boolean
}

export function UsernameStep({ initialUsername, onComplete, loading }: UsernameStepProps) {
  const [username, setUsername] = useState(initialUsername)
  const [suggestedUsernames, setSuggestedUsernames] = useState<string[]>([])
  const [isChecking, setIsChecking] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  // Generate username suggestions based on user's full name
  useEffect(() => {
    const generateSuggestions = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.full_name) {
        const fullName = user.user_metadata.full_name.toLowerCase()
        const names = fullName.split(' ')
        const suggestions = [
          names[0], // First name
          names[names.length - 1], // Last name
          `${names[0]}${names[names.length - 1]}`, // First + Last
          `${names[0][0]}${names[names.length - 1]}`, // First initial + Last
          `${names[0]}${Math.floor(Math.random() * 1000)}`, // First name + random number
          `${names[0][0]}${names[names.length - 1]}${Math.floor(Math.random() * 1000)}` // Initials + random number
        ]
        // Ensure unique suggestions
        setSuggestedUsernames([...new Set(suggestions)])
      }
    }
    generateSuggestions()
  }, [])

  // Check username availability in real-time
  useEffect(() => {
    const checkUsername = async () => {
      if (!username.trim()) {
        setIsAvailable(null)
        setError(null)
        return
      }

      // Validate username format
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
      if (!usernameRegex.test(username.trim())) {
        setError('Username must be 3-20 characters long and contain only letters, numbers, and underscores')
        setIsAvailable(false)
        return
      }

      setIsChecking(true)
      setError(null)
      try {
        const { data, error } = await supabase
          .rpc('check_username_availability', { username_to_check: username.trim() })

        if (error) throw error
        // The function returns TRUE if username exists (taken), FALSE otherwise
        setIsAvailable(!data)
      } catch (err) {
        setIsAvailable(null)
        setError('Error checking username availability')
      } finally {
        setIsChecking(false)
      }
    }

    const debounceTimer = setTimeout(checkUsername, 500)
    return () => clearTimeout(debounceTimer)
  }, [username])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading || !username.trim() || !isAvailable) return

    try {
      onComplete({ username: username.trim() })
    } catch (error) {
      console.error('Error submitting username:', error)
      setError('Failed to save username. Please try again.')
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
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
          <User className="w-10 h-10 text-white" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Choose Your Username
        </h2>
        <p className="text-base text-gray-600 dark:text-gray-400">
          This will be your unique identifier on KoruSync
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="relative group"
        >
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors duration-200 group-focus-within:text-cyan-500 dark:group-focus-within:text-emerald-500" />
          <Input 
            id="username" 
            type="text" 
            placeholder="Choose a username" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            error={error || undefined}
            required 
            disabled={loading}
            className="pl-12 text-base py-3"
          />
          <AnimatePresence mode="wait">
            {isChecking ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                <div className="w-5 h-5 border-2 border-cyan-500 dark:border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </motion.div>
            ) : isAvailable !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                {isAvailable ? (
                  <Check className="w-5 h-5 text-emerald-500" />
                ) : (
                  <X className="w-5 h-5 text-red-500" />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Username Suggestions */}
        <AnimatePresence>
          {suggestedUsernames.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Sparkles className="w-4 h-4 text-cyan-500" />
                <span>Suggested usernames:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestedUsernames.map((suggestion, index) => (
                  <motion.button
                    key={`${suggestion}-${index}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    type="button"
                    onClick={() => setUsername(suggestion)}
                    className="px-4 py-2 text-sm bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {suggestion}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Button 
            type="submit" 
            fullWidth 
            isLoading={loading} 
            disabled={loading || !username.trim() || !isAvailable} 
            className="mt-6 py-3 text-base font-medium"
          >
            Continue
          </Button>
        </motion.div>
      </form>
    </motion.div>
  )
} 