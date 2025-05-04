import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { FaGoogle, FaApple } from 'react-icons/fa6'
import { FaXTwitter } from 'react-icons/fa6'

interface SocialButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  provider: 'google' | 'twitter' | 'apple'
  children: React.ReactNode
}

const iconMap = {
  google: <FaGoogle className="w-5 h-5 mr-2 text-[#EA4335]" />,
  twitter: <FaXTwitter className="w-5 h-5 mr-2 text-black dark:text-white" />,
  apple: <FaApple className="w-5 h-5 mr-2 text-black dark:text-white" />,
}

export const SocialButton = forwardRef<HTMLButtonElement, SocialButtonProps>(
  ({ provider, children, className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "flex items-center justify-center w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-inter",
        className
      )}
      {...props}
    >
      {iconMap[provider]}
      {children}
    </button>
  )
)
SocialButton.displayName = 'SocialButton' 