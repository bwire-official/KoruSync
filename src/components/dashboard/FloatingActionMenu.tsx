'use client'

import { useState, useEffect } from 'react'
import { Plus, X, Target, BookOpen, Briefcase, BarChart3, Layers, Bot, LayoutDashboard, ListTodo, PenLine } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface ActionButton {
  icon: React.ReactNode
  label: string
  onClick: () => void
  color: string
}

export function FloatingActionMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  // Close menu when clicking outside
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.floating-menu')) {
        setIsOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isOpen])

  const actions: ActionButton[] = [
    {
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: 'Dashboard',
      onClick: () => {
        router.push('/dashboard')
        setIsOpen(false)
      },
      color: 'bg-cyan-500 hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-700'
    },
    {
      icon: <ListTodo className="w-5 h-5" />,
      label: 'Tasks',
      onClick: () => {
        router.push('/dashboard/tasks')
        setIsOpen(false)
      },
      color: 'bg-cyan-500 hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-700'
    },
    {
      icon: <Layers className="w-5 h-5" />,
      label: 'Pillars',
      onClick: () => {
        router.push('/dashboard/pillars')
        setIsOpen(false)
      },
      color: 'bg-cyan-500 hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-700'
    },
    {
      icon: <Target className="w-5 h-5" />,
      label: 'Goals',
      onClick: () => {
        router.push('/dashboard/goals')
        setIsOpen(false)
      },
      color: 'bg-cyan-500 hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-700'
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      label: 'Reports',
      onClick: () => {
        router.push('/dashboard/reports')
        setIsOpen(false)
      },
      color: 'bg-cyan-500 hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-700'
    },
    {
      icon: <PenLine className="w-5 h-5" />,
      label: 'Journal',
      onClick: () => {
        router.push('/dashboard/journal')
        setIsOpen(false)
      },
      color: 'bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700'
    },
    {
      icon: <Bot className="w-5 h-5" />,
      label: 'AI Assistant',
      onClick: () => {
        // TODO: Open AI Assistant Modal
        console.log('Open AI Assistant')
        setIsOpen(false)
      },
      color: 'bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700'
    }
  ]

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="floating-menu relative z-50">
        {/* Action Buttons */}
        <div className={cn(
          "absolute bottom-16 right-0 transition-all duration-300",
          "flex flex-col gap-2",
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        )}>
          {actions.map((action, index) => (
            <button
              key={action.label}
              onClick={action.onClick}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-white shadow-lg",
                "transition-all duration-300 hover:scale-105",
                action.color,
                "whitespace-nowrap"
              )}
              style={{
                transitionDelay: `${index * 50}ms`
              }}
            >
              {action.icon}
              <span className="text-sm font-medium">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Main FAB Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-14 h-14 rounded-full bg-cyan-600 dark:bg-cyan-500 text-white shadow-lg",
            "flex items-center justify-center transition-all duration-300",
            "hover:scale-105 hover:shadow-xl",
            isOpen && "rotate-45 bg-rose-500 dark:bg-rose-600"
          )}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
        </button>
      </div>
    </>
  )
} 