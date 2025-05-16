'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Settings, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

export function UserProfileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { user, signOut } = useAuth()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const menuItems = [
    {
      icon: User,
      label: 'Profile',
      onClick: () => {
        router.push('/dashboard/profile')
        setIsOpen(false)
      }
    },
    {
      icon: Settings,
      label: 'Settings',
      onClick: () => {
        router.push('/dashboard/settings')
        setIsOpen(false)
      }
    },
    {
      icon: LogOut,
      label: 'Sign Out',
      onClick: () => {
        signOut()
        setIsOpen(false)
      }
    }
  ]

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors",
          "hover:bg-gray-100 dark:hover:bg-gray-700/50",
          "focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        )}
      >
        <div className="w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
          <User className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
        </div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden md:block">
          {displayName}
        </span>
      </button>

      {isOpen && (
        <div className={cn(
          "absolute right-0 mt-2 w-56 rounded-lg shadow-lg",
          "bg-white dark:bg-gray-800",
          "border border-gray-200 dark:border-gray-700",
          "ring-1 ring-black ring-opacity-5",
          "transform origin-top-right transition-all duration-100 ease-out",
          "z-50"
        )}>
          <div className="py-1">
            {menuItems.map((item, index) => (
              <button
                key={item.label}
                onClick={item.onClick}
                className={cn(
                  "w-full flex items-center px-4 py-2 text-sm",
                  "text-gray-700 dark:text-gray-300",
                  "hover:bg-gray-100 dark:hover:bg-gray-700/50",
                  "transition-colors duration-150",
                  index === 0 && "rounded-t-lg",
                  index === menuItems.length - 1 && "rounded-b-lg",
                  "focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700/50"
                )}
              >
                <item.icon className="h-4 w-4 mr-3 text-gray-500 dark:text-gray-400" />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 