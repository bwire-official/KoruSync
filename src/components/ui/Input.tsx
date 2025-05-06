'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  size?: 'sm' | 'md' | 'lg'
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, size = 'md', ...props }, ref) => {
    return (
      <div className="relative">
        <input
          className={cn(
            // Base styles
            "w-full bg-transparent text-gray-900 dark:text-white",
            "border-2 border-gray-200 dark:border-gray-700",
            "rounded-xl", // Softer edges
            "transition-all duration-200 ease-in-out",
            "focus:outline-none focus:ring-2 focus:ring-cyan-500/50 dark:focus:ring-emerald-500/50",
            "focus:border-cyan-500 dark:focus:border-emerald-500",
            "placeholder:text-gray-400 dark:placeholder:text-gray-500",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            
            // Size variants
            size === 'sm' && "px-3 py-1.5 text-xs",
            size === 'md' && "px-4 py-2.5 text-sm",
            size === 'lg' && "px-6 py-3 text-base",
            
            // Error state
            error && [
              "border-red-500 dark:border-red-500",
              "focus:ring-red-500/50",
              "focus:border-red-500",
            ],
            
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-red-500 dark:text-red-400">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input } 