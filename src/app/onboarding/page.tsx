'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, Sun, Moon, User, Clock, Layers, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { UsernameStep } from './components/UsernameStep'
import { TimezoneStep } from './components/TimezoneStep'
import { PillarsStep } from './components/PillarsStep'
import { IntroStep } from './components/IntroStep'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'

type Step = 'welcome' | 'username' | 'timezone' | 'pillars' | 'intro'

interface StepData {
  username: string
  timezone: string
  pillars: string[]
}

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState<Step>('welcome')
  const [loading, setLoading] = useState(false)
  const [stepData, setStepData] = useState<StepData>({
    username: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    pillars: []
  })
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { theme, toggleTheme } = useTheme()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
      }
    }
    checkAuth()
  }, [])

  const handleNextStep = async (data: Partial<StepData>) => {
    setLoading(true)
    setError(null)
    try {
      // Update step data
      setStepData(prev => ({ ...prev, ...data }))

      // If this is the final step, update the user's profile
      if (currentStep === 'intro') {
        console.log('Starting final step completion...')
        
        // First check if we have a valid session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) {
          console.error('Session error:', sessionError)
          throw new Error('Failed to get session')
        }
        if (!session) {
          console.error('No active session found')
          throw new Error('No active session found')
        }
        console.log('Session found:', session.user.id)

        // Update user profile data
        console.log('Attempting to update user profile...')
        const { data: userData, error: userError } = await supabase
          .from('users')
          .update({
            username: stepData.username,
            timezone: stepData.timezone
          })
          .eq('id', session.user.id)
          .select()

        console.log('Update user result:', { userData, userError })
        if (userError) {
          console.error('ERROR updating user profile:', userError)
          throw new Error('Failed to update user profile')
        }

        // Update onboarding completion status
        console.log('Attempting to update onboarding completion status...')
        const { data: prefData, error: prefError } = await supabase
          .from('user_preferences')
          .update({ onboarding_completed: true })
          .eq('user_id', session.user.id)
          .select()

        console.log('Update preferences result:', { prefData, prefError })
        if (prefError) {
          console.error('ERROR updating preferences:', prefError)
          throw new Error('Failed to update preferences')
        }

        console.log('All updates successful, attempting redirect to /dashboard...')
        router.push('/dashboard')
        return
      }

      // Move to next step
      const steps: Step[] = ['welcome', 'username', 'timezone', 'pillars', 'intro']
      const currentIndex = steps.indexOf(currentStep)
      setCurrentStep(steps[currentIndex + 1])
    } catch (error) {
      console.error('Error in handleNextStep:', error)
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          setError('Could not connect to server. Please check your connection and try again.')
        } else {
          setError(error.message)
        }
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    const steps: Step[] = ['welcome', 'username', 'timezone', 'pillars', 'intro']
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1])
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-cyan-500 dark:bg-emerald-500 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-1">
              Welcome to KoruSync
            </h2>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
              Let's get you set up
            </p>
            <div className="space-y-4">
              <p className="text-center text-gray-600 dark:text-gray-300">
                We'll help you set up:
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-cyan-100 dark:bg-emerald-900 flex items-center justify-center">
                    <User className="w-4 h-4 text-cyan-500 dark:text-emerald-500" />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-200">Your unique username</span>
                </li>
                <li className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-cyan-100 dark:bg-emerald-900 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-cyan-500 dark:text-emerald-500" />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-200">Your local timezone</span>
                </li>
                <li className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-cyan-100 dark:bg-emerald-900 flex items-center justify-center">
                    <Layers className="w-4 h-4 text-cyan-500 dark:text-emerald-500" />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-200">Your life pillars</span>
                </li>
              </ul>
            </div>
            <Button 
              onClick={() => handleNextStep({})}
              fullWidth 
              isLoading={loading} 
              disabled={loading}
              className="mt-6"
            >
              Get Started
            </Button>
          </div>
        )
      case 'username':
        return (
          <UsernameStep
            initialUsername={stepData.username}
            onComplete={(data) => handleNextStep(data)}
            loading={loading}
          />
        )
      case 'timezone':
        return (
          <TimezoneStep
            initialTimezone={stepData.timezone}
            onComplete={(data) => handleNextStep(data)}
            loading={loading}
          />
        )
      case 'pillars':
        return (
          <PillarsStep
            initialPillars={stepData.pillars}
            onComplete={(data) => handleNextStep(data)}
            loading={loading}
          />
        )
      case 'intro':
        return (
          <IntroStep
            onComplete={() => handleNextStep({})}
            loading={loading}
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-6">
            {/* Header with Back Button and Theme Toggle */}
            <div className="flex items-center justify-between">
              {currentStep !== 'welcome' && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBack}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              )}
              <div className="flex-1" />
              <button
                onClick={toggleTheme}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 ease-in-out"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-cyan-500" />
                ) : (
                  <Moon className="w-5 h-5 text-emerald-500" />
                )}
              </button>
            </div>

            {/* Progress Indicator */}
            <div className="flex justify-center gap-2">
              {['welcome', 'username', 'timezone', 'pillars', 'intro'].map((step, index) => (
                <div
                  key={step}
                  className={`w-2 h-2 rounded-full ${
                    index <= ['welcome', 'username', 'timezone', 'pillars', 'intro'].indexOf(currentStep)
                      ? 'bg-cyan-500 dark:bg-emerald-500'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              ))}
            </div>

            {/* Step Content */}
            <div className="mt-4">
              {renderStep()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 