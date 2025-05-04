'use client'

import { useState, useEffect } from 'react'
import { User, Check, X } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

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
  const [error, setError] = useState('')
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
        setError('')
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
      setError('')
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (loading || !username.trim() || !isAvailable) return

    onComplete({ username: username.trim() })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-full bg-cyan-500 dark:bg-emerald-500 flex items-center justify-center">
          <User className="w-8 h-8 text-white" />
        </div>
      </div>
      <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-1">
        Choose Your Username
      </h2>
      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
        This will be your unique identifier on KoruSync
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative group">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-colors duration-200 group-focus-within:text-cyan-500 dark:group-focus-within:text-emerald-500" />
          <Input 
            id="username" 
            type="text" 
            placeholder="Choose a username" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            error={error}
            required 
            disabled={loading}
            className="pl-10"
          />
          {isChecking ? (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-cyan-500 dark:border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : isAvailable !== null && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isAvailable ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <X className="w-4 h-4 text-red-500" />
              )}
            </div>
          )}
        </div>

        {/* Username Suggestions */}
        {suggestedUsernames.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Suggested usernames:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedUsernames.map((suggestion, index) => (
                <button
                  key={`${suggestion}-${index}`}
                  type="button"
                  onClick={() => setUsername(suggestion)}
                  className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        <Button 
          type="submit" 
          fullWidth 
          isLoading={loading} 
          disabled={loading || !username.trim() || !isAvailable} 
          className="mt-6"
        >
          Continue
        </Button>
      </form>
    </div>
  )
} 