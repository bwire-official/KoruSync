'use client';

import React, { useEffect, useState } from 'react';
import { Layers, TrendingUp, Clock, CheckCircle2, Flame } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database';
import { useAuth } from '@/hooks/useAuth';

export function DashboardStatsRow() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    balanceScore: 0,
    currentStreak: 0,
    focusTime: 0,
    tasksCompleted: 0
  });
  const supabase = createClientComponentClient<Database>();

  // Helper to format seconds as Xh Ym Zs
  const formatFocusTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    let str = '';
    if (hours > 0) str += `${hours}h `;
    if (minutes > 0) str += `${minutes}m `;
    str += `${secs}s`;
    return str.trim();
  };

  useEffect(() => {
    if (!user) return;

    const fetchMetrics = async () => {
      try {
        // 1. Fetch balance score
        const { data: timeEntries, error: timeError } = await supabase
          .from('time_entries')
          .select(`
            duration,
            tasks (
              pillar_id,
              life_pillars (
                name
              )
            )
          `)
          .eq('user_id', user.id)
          .gte('start_time', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

        let balanceScore = 0;
        if (!timeError && timeEntries) {
          const pillarTime: Record<string, number> = {};
          timeEntries.forEach(entry => {
            if (entry.tasks?.life_pillars?.name) {
              const pillarName = entry.tasks.life_pillars.name;
              const duration = (typeof entry.duration === 'string' || typeof entry.duration === 'number')
                ? parseInt(entry.duration as string, 10)
                : 0;
              pillarTime[pillarName] = (pillarTime[pillarName] || 0) + duration;
            }
          });

          // Calculate balance score (0-100)
          const totalTime = Object.values(pillarTime).reduce((a, b) => a + b, 0);
          if (totalTime > 0) {
            const idealPercentage = 100 / Object.keys(pillarTime).length;
            const deviations = Object.values(pillarTime).map(time => 
              Math.abs((time / totalTime) * 100 - idealPercentage)
            );
            balanceScore = Math.max(0, 100 - (deviations.reduce((a, b) => a + b, 0) / 2));
          }
        }

        // 2. Fetch streak
        const { data: gamification } = await supabase
          .from('user_gamification')
          .select('current_streak')
          .eq('user_id', user.id)
          .single();

        // 3. Fetch total focus time (all time_entries, not just today)
        const { data: allFocus } = await supabase
          .from('time_entries')
          .select('start_time, end_time')
          .eq('user_id', user.id);
        let focusTime = 0;
        if (allFocus) {
          focusTime = allFocus.reduce((acc, entry) => {
            if (entry.start_time && entry.end_time) {
              const start = new Date(entry.start_time).getTime();
              const end = new Date(entry.end_time).getTime();
              return acc + Math.max(0, (end - start) / 1000);
            }
            return acc;
          }, 0);
        }

        // 4. Fetch tasks completed
        const { data: tasks } = await supabase
          .from('tasks')
          .select('status')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .gte('created_at', new Date().setHours(0, 0, 0, 0).toString());

        setMetrics({
          balanceScore: Math.round(balanceScore),
          currentStreak: gamification?.current_streak || 0,
          focusTime: Math.round(focusTime),
          tasksCompleted: tasks?.length || 0
        });
      } catch (error) {
        console.error('Error fetching metrics:', error);
      }
    };

    fetchMetrics();
  }, [user, supabase]);

  return (
    <div>
      <h3 className="text-lg font-semibold flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-emerald-600 dark:from-cyan-400 dark:to-emerald-400 bg-clip-text text-transparent mb-4">
        <Layers className="w-5 h-5 text-emerald-500" /> Quick Stats
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Balance Score */}
        <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700 flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-2">
            <Layers className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">Balance Score</span>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{metrics.balanceScore}%</span>
        </div>
        {/* Current Streak */}
        <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700 flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-2">
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current Streak</span>
          <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">{metrics.currentStreak} days</span>
        </div>
        {/* Focus Time */}
        <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700 flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-2">
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">Focus Time</span>
          <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{formatFocusTime(metrics.focusTime)}</span>
        </div>
        {/* Tasks Completed */}
        <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700 flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center mb-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-500" />
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tasks Done</span>
          <span className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{metrics.tasksCompleted}</span>
        </div>
      </div>
    </div>
  );
} 