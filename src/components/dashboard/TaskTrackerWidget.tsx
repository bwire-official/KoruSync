'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronRight, CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

// Types
type Priority = 'low' | 'medium' | 'high'
type Pillar = 'Web3' | 'School' | 'Personal'

interface Task {
  id: string
  title: string
  pillar: Pillar
  priority: Priority
  status: 'todo' | 'in_progress' | 'completed'
  dueDate?: string
}

// Mock data
const mockTasks: Task[] = [
  { 
    id: '1', 
    title: 'Complete Smart Contract Audit', 
    pillar: 'Web3', 
    priority: 'high', 
    status: 'todo',
    dueDate: '2024-03-20'
  },
  { 
    id: '2', 
    title: 'Research Token Economics', 
    pillar: 'Web3', 
    priority: 'medium', 
    status: 'in_progress',
    dueDate: '2024-03-22'
  },
  { 
    id: '3', 
    title: 'Study for Blockchain Exam', 
    pillar: 'School', 
    priority: 'high', 
    status: 'todo',
    dueDate: '2024-03-21'
  },
  { 
    id: '4', 
    title: 'Complete Assignment 3', 
    pillar: 'School', 
    priority: 'medium', 
    status: 'completed',
    dueDate: '2024-03-19'
  },
  { 
    id: '5', 
    title: 'Morning Exercise', 
    pillar: 'Personal', 
    priority: 'low', 
    status: 'todo',
    dueDate: '2024-03-20'
  },
]

// Pillar colors from design system
const pillarColors = {
  Web3: 'text-emerald-500 dark:text-emerald-400',
  School: 'text-cyan-500 dark:text-cyan-400',
  Personal: 'text-purple-500 dark:text-purple-400'
}

const priorityColors = {
  high: 'text-rose-500 dark:text-rose-400',
  medium: 'text-amber-500 dark:text-amber-400',
  low: 'text-blue-500 dark:text-blue-400'
}

export function TaskTrackerWidget({ hideTitle }: { hideTitle?: boolean } = {}) {
  const [expandedPillars, setExpandedPillars] = useState<Record<string, boolean>>({
    Web3: true,
    School: false,
    Personal: false
  })

  const togglePillar = (pillar: string) => {
    setExpandedPillars(prev => ({
      ...prev,
      [pillar]: !prev[pillar]
    }))
  }

  const tasksByPillar = mockTasks.reduce((acc, task) => {
    if (!acc[task.pillar]) {
      acc[task.pillar] = []
    }
    acc[task.pillar].push(task)
    return acc
  }, {} as Record<string, Task[]>)

  const getPillarSummary = (pillar: string) => {
    const tasks = tasksByPillar[pillar] || []
    const total = tasks.length
    const completed = tasks.filter(t => t.status === 'completed').length
    const inProgress = tasks.filter(t => t.status === 'in_progress').length
    const todo = tasks.filter(t => t.status === 'todo').length
    const highPriority = tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length

    return {
      total,
      completed,
      inProgress,
      todo,
      highPriority
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Optionally render title if hideTitle is not true */}
      {!hideTitle && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg font-semibold bg-gradient-to-r from-cyan-600 to-emerald-600 dark:from-cyan-400 dark:to-emerald-400 bg-clip-text text-transparent">Task Tracker</span>
        </div>
      )}
      <div className="space-y-2">
        {Object.entries(tasksByPillar).map(([pillar, tasks]) => {
          const summary = getPillarSummary(pillar)
          const isExpanded = expandedPillars[pillar]

          return (
            <div 
              key={pillar}
              className="border border-gray-100 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              {/* Pillar Header - Clickable */}
              <button
                onClick={() => togglePillar(pillar)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                  <span className={cn("font-medium", pillarColors[pillar as keyof typeof pillarColors])}>
                    {pillar}
                  </span>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      {summary.completed}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-amber-500" />
                      {summary.inProgress}
                    </span>
                    {summary.highPriority > 0 && (
                      <span className="flex items-center gap-1 text-rose-500">
                        <AlertCircle className="w-4 h-4" />
                        {summary.highPriority}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {summary.completed}/{summary.total} tasks
                </span>
              </button>

              {/* Expanded Tasks List */}
              {isExpanded && (
                <div className="px-4 py-2 space-y-2 bg-gray-50/50 dark:bg-gray-800/50">
                  {tasks.map(task => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-white dark:hover:bg-gray-800 transition-colors duration-200"
                    >
                      <button className="flex-shrink-0">
                        {task.status === 'completed' ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm truncate",
                          task.status === 'completed' ? "text-gray-500 line-through" : "text-gray-700 dark:text-gray-200"
                        )}>
                          {task.title}
                        </p>
                        {task.dueDate && (
                          <p className="text-xs text-gray-500">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        <span className={cn(
                          "text-xs px-2 py-1 rounded-full",
                          priorityColors[task.priority]
                        )}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}