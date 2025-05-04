'use client'

import { Button } from '@/components/ui/Button'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

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
      // Call onComplete to let the parent component handle the update
      onComplete()
    } catch (error) {
      console.error('Error completing onboarding:', error)
    }
  }

  return (
    <>
      <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-1">
        Welcome to KoruSync!
      </h2>
      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
        You're all set to start your journey with us
      </p>

      <div className="space-y-4">
        <p className="text-center text-gray-600 dark:text-gray-300">
          We've helped you set up:
        </p>
        <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full" />
            Your unique username
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full" />
            Your local timezone
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full" />
            Your life pillars
          </li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="mt-8">
        <Button 
          type="submit" 
          fullWidth 
          isLoading={loading} 
          disabled={loading}
        >
          Get Started
        </Button>
      </form>
    </>
  )
} 