'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Sun, Moon, Trash2, AlertTriangle, Play, Pause, StopCircle, Timer, Clock, TrendingUp, PenLine, Sparkles, Flame, ListTodo, Target } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/contexts/ThemeContext'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database'
import { cn } from '@/lib/utils'
import { TaskTrackerWidget } from '@/components/dashboard/TaskTrackerWidget'
import { FloatingActionMenu } from '@/components/dashboard/FloatingActionMenu'
import { toast } from 'sonner'
import { GoalProgressWidget } from '@/components/dashboard/GoalProgressWidget'
import { MotivationalQuoteWidget } from '@/components/dashboard/MotivationalQuoteWidget'
import { HighlightsWidget } from '@/components/dashboard/HighlightsWidget'
import { DashboardStatsRow } from '@/components/dashboard/DashboardStatsRow'
import { FocusTimerWidget } from '@/components/dashboard/FocusTimerWidget'

// Mock data - Replace with real data fetching
const quotes = [
  "Balance is progress.",
  "Web3 is the goal. Life is the vessel.",
  "Stay in sync. Stay sharp.",
  "Consistent effort in all pillars leads to sustainable success.",
  "One task at a time builds momentum.",
  "Today's focus shapes tomorrow's success.",
  "Embrace the journey of balanced growth.",
  "Small steps in all areas lead to big achievements.",
  "Your future self thanks you for today's balance.",
  "Success is built on a foundation of well-rounded effort."
];

const mockPillarData = [
  { name: 'Web3', value: 35, color: '#10B981' }, // Emerald
  { name: 'School', value: 40, color: '#06B6D4' }, // Cyan
  { name: 'Personal', value: 25, color: '#9CA3AF' }, // Gray
]

const COLORS = mockPillarData.map(item => item.color)

// Update the gradient animation to be more subtle
const gradientAnimation = {
  background: 'linear-gradient(-45deg, rgba(6, 182, 212, 0.05), rgba(16, 185, 129, 0.05), rgba(14, 165, 233, 0.05), rgba(5, 150, 105, 0.05))',
  backgroundSize: '400% 400%',
  animation: 'gradient 15s ease infinite',
}

// Add this to the style tag in the head or in globals.css
const styles = `
@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
`

function DashboardContent() {
  const router = useRouter()
  const { user } = useAuth()
  const { theme } = useTheme()
  const [activeTab, setActiveTab] = useState('today')
  const [timerRunning, setTimerRunning] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [currentTask, setCurrentTask] = useState<{ name: string } | null>(null)
  const [syncScore, setSyncScore] = useState(75) // Mock sync score
  const supabase = createClientComponentClient<Database>()
  const [totalFocusTime, setTotalFocusTime] = useState(0)
  const [statsKey, setStatsKey] = useState(0); // For forcing DashboardStatsRow refresh

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
    }
  }, [user, router])

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (timerRunning) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timerRunning])

  // Fetch total focus time on mount and after saving a session
  useEffect(() => {
    const fetchTotalFocusTime = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('time_entries')
          .select('start_time, end_time')
          .eq('user_id', user.id)
          .gte('start_time', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()) // Today's entries

        if (error) {
          console.error('Error fetching focus time:', error)
          return
        }

        // Calculate total focus time in seconds
        const totalSeconds = data.reduce((acc, entry) => {
          if (!entry.start_time || !entry.end_time) return acc;
          const start = new Date(entry.start_time).getTime();
          const end = new Date(entry.end_time).getTime();
          return acc + (end - start) / 1000;
        }, 0)

        setTotalFocusTime(totalSeconds)
      } catch (err) {
        console.error('Error in fetchTotalFocusTime:', err)
      }
    }

    fetchTotalFocusTime()
  }, [user, supabase])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const formatFocusTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`
    }
    return `${secs}s`
  }

  const toggleTimer = () => {
    setTimerRunning(!timerRunning)
    if (!timerRunning) {
      setElapsedTime(0)
    }
  }

  const handleFocusSessionLog = async (elapsedSeconds: number, focusNotes: string | null) => {
    if (!user) {
      console.error("DashboardPage: User not found, cannot log time entry.");
      toast.error('You must be logged in to save time entries');
      return;
    }
    if (elapsedSeconds <= 0) {
      console.log("DashboardPage: No time elapsed, not logging entry.");
      return;
    }
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - elapsedSeconds * 1000);
    const newTimeEntry = {
      user_id: user.id,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      notes: focusNotes,
    };
    try {
      const { error } = await supabase
        .from('time_entries')
        .insert([newTimeEntry]);
      if (error) {
        console.error("DashboardPage: Error logging time entry:", error);
        toast.error(`Error logging focus session: ${error.message}`);
      } else {
        toast.success("Focus session logged!");
        setStatsKey(k => k + 1); // Force stats refresh
      }
    } catch (e) {
      console.error("DashboardPage: Exception logging time entry:", e);
      toast.error("An unexpected error occurred while logging your session.");
    }
  };

  // Calculate balance status text
  const getBalanceStatus = () => {
    if (syncScore >= 80) return "Well Balanced"
    if (syncScore >= 60) return "Moderately Balanced"
    return "Needs Adjustment"
  }

  // Get dominant pillar
  const getDominantPillar = () => {
    const maxPillar = mockPillarData.reduce((max, pillar) => 
      pillar.value > max.value ? pillar : max
    , mockPillarData[0])
    return maxPillar.name
  }

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 18) return "Good Afternoon"
    return "Good Evening"
  }

  if (!user) return null

  return (
    <div className="min-h-screen relative">
      {/* Subtle animated gradient overlay */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={gradientAnimation}
      />
      
      {/* Content overlay */}
      <div className="relative min-h-screen">
        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section with Motivational Quote */}
          <div className="mb-8 space-y-4">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-emerald-600 dark:from-cyan-400 dark:to-emerald-400 bg-clip-text text-transparent">
                {getGreeting()}, {user.user_metadata?.full_name || 'User'}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>

            {/* Motivational Quote */}
            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-800 rounded-lg p-4 shadow-sm border border-gray-100/50 dark:border-gray-700/50 transition-all duration-300 hover:shadow-md">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5 animate-pulse" />
                <blockquote className="text-sm italic text-gray-600 dark:text-gray-400 leading-relaxed">
                  "{quotes[Math.floor(Math.random() * quotes.length)]}"
                </blockquote>
              </div>
            </div>
          </div>

          {/* Pillar Balance Card */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-100/50 dark:border-gray-700/50 transition-all duration-300 mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Pillar Balance */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold bg-gradient-to-r from-cyan-600 to-emerald-600 dark:from-cyan-400 dark:to-emerald-400 bg-clip-text text-transparent">
                    Pillar Balance
                  </h2>
                </div>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <div className="flex justify-end mb-4">
                    <TabsList className="grid w-[200px] grid-cols-2">
                      <TabsTrigger value="today">Today</TabsTrigger>
                      <TabsTrigger value="week">This Week</TabsTrigger>
                    </TabsList>
                  </div>
                  <TabsContent value="today" className="mt-4">
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={mockPillarData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={60}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {mockPillarData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: number) => `${value}%`}
                            contentStyle={{
                              backgroundColor: 'hsl(var(--background))',
                              color: 'hsl(var(--foreground))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '0.5rem',
                              padding: '0.5rem'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 mt-4">
                      {mockPillarData.map((pillar, index) => (
                        <div key={pillar.name} className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: COLORS[index] }}
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{pillar.name}: {pillar.value}%</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="week" className="mt-4">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={mockPillarData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {mockPillarData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: number) => `${value}%`}
                            contentStyle={{
                              backgroundColor: 'hsl(var(--background))',
                              color: 'hsl(var(--foreground))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '0.5rem',
                              padding: '0.5rem'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 mt-4">
                      {mockPillarData.map((pillar, index) => (
                        <div key={pillar.name} className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: COLORS[index] }}
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{pillar.name}: {pillar.value}%</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Right Column: Focus Timer and Sync Status */}
              <div className="space-y-6">
                {/* Focus Timer */}
                <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-800 rounded-lg p-4 shadow-sm border border-gray-100/50 dark:border-gray-700/50 transition-all duration-300 hover:shadow-md">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                    <Timer className="w-5 h-5 mr-2 text-emerald-500 animate-pulse" />
                    Focus Timer
                  </h3>
                  <FocusTimerWidget
                    initialTaskName={currentTask?.name}
                    onSessionStop={handleFocusSessionLog}
                  />
                </div>

                {/* Sync Status */}
                <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-800 rounded-lg p-4 shadow-sm border border-gray-100/50 dark:border-gray-700/50 transition-all duration-300 hover:shadow-md">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
                    Sync Status
                  </h3>
                  <div className="space-y-2">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
                      syncScore >= 80 ? "bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/20 dark:to-emerald-800/20" :
                      syncScore >= 60 ? "bg-gradient-to-br from-cyan-100 to-cyan-50 dark:from-cyan-900/20 dark:to-cyan-800/20" :
                      "bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/20 dark:to-amber-800/20"
                    )}>
                      <TrendingUp className={cn(
                        "h-6 w-6 transition-colors duration-300",
                        syncScore >= 80 ? "text-emerald-600 dark:text-emerald-400" :
                        syncScore >= 60 ? "text-cyan-600 dark:text-cyan-400" :
                        "text-amber-600 dark:text-amber-400"
                      )} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        {syncScore}% {getBalanceStatus()}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Leaning towards {getDominantPillar()} this {activeTab}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Row Card */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-100/50 dark:border-gray-700/50 transition-all duration-300 mb-8">
            <DashboardStatsRow key={statsKey} />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Highlights Widget (order-last on mobile) */}
            <div className="lg:col-span-2 order-last lg:order-none">
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-100/50 dark:border-gray-700/50">
                <HighlightsWidget />
              </div>
            </div>

            {/* Right Column - Goals and Task Tracker */}
            <div className="space-y-6">
              {/* Goal Progress Widget */}
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-100/50 dark:border-gray-700/50">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-emerald-500" />
                  <span className="text-lg font-semibold bg-gradient-to-r from-cyan-600 to-emerald-600 dark:from-cyan-400 dark:to-emerald-400 bg-clip-text text-transparent">Goal Progress</span>
                </div>
                <GoalProgressWidget hideTitle />
              </div>

              {/* Task Tracker */}
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-100/50 dark:border-gray-700/50">
                <div className="flex items-center gap-2 mb-4">
                  <ListTodo className="w-5 h-5 text-cyan-500" />
                  <span className="text-lg font-semibold bg-gradient-to-r from-cyan-600 to-emerald-600 dark:from-cyan-400 dark:to-emerald-400 bg-clip-text text-transparent">Task Tracker</span>
                </div>
                <TaskTrackerWidget hideTitle />
              </div>
            </div>
          </div>

          {/* Floating Action Menu */}
          <div className="fixed bottom-24 right-6 z-50 md:bottom-8">
            <FloatingActionMenu />
          </div>
        </main>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 animate-pulse">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}