import { useMemo } from 'react'
import { cn } from '@/lib/utils'

export function PasswordStrengthIndicator({ password }: { password: string }) {
  const { score, label, color } = useMemo(() => {
    let score = 0
    if (password.length >= 6) score++
    if (/[A-Z]/.test(password)) score++
    if (/[a-z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' }
    if (score <= 4) return { score, label: 'Medium', color: 'bg-yellow-500' }
    return { score, label: 'Strong', color: 'bg-green-500' }
  }, [password])

  return (
    <div className="space-y-1 font-inter">
      <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className={cn("h-full transition-all duration-300", color)} style={{ width: `${(score / 5) * 100}%` }} />
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">Password strength: <span className="font-medium">{label}</span></p>
    </div>
  )
} 