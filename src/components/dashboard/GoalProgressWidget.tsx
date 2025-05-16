'use client';

import React, { useState } from 'react';
import { Target, TrendingUp } from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  pillar: 'Web3' | 'School' | 'Personal / Life' | 'Custom';
  targetType: 'tasks' | 'hours';
  targetValue: number;
  currentValue: number;
  color?: string;
}

const mockGoalsData: Goal[] = [
  {
    id: 'g1',
    title: 'Complete 5 Web3 Tutorials',
    pillar: 'Web3',
    targetType: 'tasks',
    targetValue: 5,
    currentValue: 2,
    color: '#10B981', // KoruSync Green (Web3 Pillar color)
  },
  {
    id: 'g2',
    title: 'Study 10 Hours for Exams',
    pillar: 'School',
    targetType: 'hours',
    targetValue: 10,
    currentValue: 6.5,
    color: '#06B6D4', // KoruSync Blue (School Pillar color)
  },
  {
    id: 'g3',
    title: 'Read 1 Self-Improvement Book',
    pillar: 'Personal / Life',
    targetType: 'tasks',
    targetValue: 1,
    currentValue: 0,
    color: '#9CA3AF', // KoruSync Grey (Personal Pillar color)
  },
];

export function GoalProgressWidget({ hideTitle }: { hideTitle?: boolean } = {}) {
  const [goals] = useState<Goal[]>(mockGoalsData);

  return (
    <>
      {/* Optionally render title if hideTitle is not true */}
      {!hideTitle && (
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-emerald-500" />
          <span className="text-lg font-semibold bg-gradient-to-r from-cyan-600 to-emerald-600 dark:from-cyan-400 dark:to-emerald-400 bg-clip-text text-transparent">Goal Progress</span>
        </div>
      )}
      {goals.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No active goals set. Add a goal to see your progress!
        </p>
      ) : (
        <div className="space-y-6">
          {goals.map((goal) => (
            <div key={goal.id} className="group">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate" title={goal.title}>
                    {goal.title}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 whitespace-nowrap flex-shrink-0">
                    {goal.pillar}
                  </span>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap flex-shrink-0">
                  {goal.currentValue}/{goal.targetValue} {goal.targetType === 'tasks' ? 'tasks' : 'hrs'}
                </span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 rounded-full transition-all duration-500 ease-out group-hover:brightness-110"
                  style={{
                    width: `${Math.min(100, (goal.currentValue / goal.targetValue) * 100)}%`,
                    backgroundColor: goal.color || '#10B981',
                    boxShadow: `0 0 8px ${goal.color || '#10B981'}40`
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}