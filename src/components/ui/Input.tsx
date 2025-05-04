import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="relative">
        <input
          className={cn(
            "w-full bg-transparent px-3 py-2.5 text-sm text-gray-900 dark:text-white",
            "border-0 border-b-2 border-gray-200 dark:border-gray-700",
            "transition-all duration-200 ease-in-out",
            "focus:outline-none focus:border-cyan-500 dark:focus:border-emerald-500",
            "placeholder:text-gray-400 dark:placeholder:text-gray-500",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-red-500 dark:border-red-500",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-500 dark:text-red-400">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input } 