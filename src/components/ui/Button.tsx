import { forwardRef } from 'react'
import { Loader } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
  fullWidth?: boolean
  variant?: 'primary' | 'secondary' | 'outline' | 'danger'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, isLoading, fullWidth, variant = 'primary', ...props }, ref) => {
    return (
      <button
        className={cn(
          "relative inline-flex items-center justify-center px-4 py-2 text-sm font-medium",
          "transition-all duration-200 ease-in-out",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          fullWidth && "w-full",
          variant === 'primary' && [
            "bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600",
            "text-white shadow-sm hover:shadow-md",
            "focus:ring-cyan-500 dark:focus:ring-emerald-500",
          ],
          variant === 'secondary' && [
            "bg-gray-100 dark:bg-gray-800",
            "text-gray-900 dark:text-white",
            "hover:bg-gray-200 dark:hover:bg-gray-700",
            "focus:ring-gray-500",
          ],
          variant === 'outline' && [
            "border border-gray-300 dark:border-gray-700",
            "text-gray-700 dark:text-gray-300",
            "hover:bg-gray-50 dark:hover:bg-gray-800",
            "focus:ring-gray-500",
          ],
          variant === 'danger' && [
            "bg-red-600 hover:bg-red-700",
            "text-white",
            "focus:ring-red-500",
          ],
          className
        )}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && (
          <Loader className="mr-2 h-4 w-4 animate-spin" />
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button } 