'use client';

import React, { useEffect } from 'react';
import { AlertCircle, Clock, Target, TrendingUp, AlertTriangle, CheckCircle2, ChevronRight, Brain, Layers, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database';
import { useAuth } from '@/hooks/useAuth';

type HighlightType = 'overdue' | 'streak' | 'imbalance' | 'upcoming' | 'goal';

interface HighlightItem {
  id: string;
  type: HighlightType;
  icon: JSX.Element;
  message: string;
  timestamp: string;
  actionText?: string;
  actionLink?: string;
  colorClass: string;
  urgency?: 'high' | 'medium' | 'low';
}

// Helper component for individual highlight cards
const HighlightCard = ({ highlight }: { highlight: HighlightItem }) => {
  // Choose urgency icon and color
  let urgencyIcon = null;
  if (highlight.urgency === 'high') {
    urgencyIcon = (
      <span className="inline-flex" aria-label="High urgency">
    urgencyIcon = (
      <span className="inline-flex" aria-label="Medium urgency">
    urgencyIcon = (
      <span className="inline-flex" aria-label="Low urgency">
        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
      </span>
    );
      </span>
    );
      </span>
    );
  } else if (highlight.urgency === 'medium') {
    urgencyIcon = (
      <span className="inline-flex" aria-label="Medium urgency">
        <AlertTriangle className="w-4 h-4 text-amber-500" />
      </span>
    );
  } else if (highlight.urgency === 'low') {
    urgencyIcon = (
      <span className="inline-flex" aria-label="Low urgency">
        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
      </span>
    );
  }

  const baseColor = highlight.colorClass.split(' ')[0].replace('text-', '');
  const bgIconClass = `bg-${baseColor}/10`;
  
  // Use Flame icon for streaks, otherwise use the provided icon
  const icon = highlight.type === 'streak'
    ? <Flame className={cn(highlight.icon.props.className, 'text-orange-500')} />
    : React.cloneElement(highlight.icon, { className: cn(highlight.icon.props.className, highlight.colorClass) });

  return (
    <div className={cn(
      "group relative bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200"
    )}>
      <div className="flex items-start gap-3">
        <div className={cn("flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center", bgIconClass)}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {urgencyIcon}
            <p className="text-sm text-gray-700 dark:text-gray-200">
              {highlight.message}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {highlight.timestamp}
            </span>
            {highlight.actionText && (
              <button
                type="button"
                className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1 transition-colors duration-200"
                onClick={() => {
                  if (highlight.actionLink && highlight.actionLink !== '#') {
                    window.location.href = highlight.actionLink;
                  }
                }}
              >
                {highlight.actionText}
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Mock data for development and fallback
const mockHighlights: HighlightItem[] = [
  {
    id: '1',
    type: 'overdue',
    icon: <AlertCircle className="w-5 h-5" />,
    message: 'Smart Contract Audit is overdue by 2 hours',
    timestamp: '2 hours ago',
    actionText: 'Start Now',
    actionLink: '#',
    colorClass: 'text-rose-500 dark:text-rose-400',
    urgency: 'high'
  },
  {
    id: '2',
    type: 'streak',
    icon: <TrendingUp className="w-5 h-5" />,
    message: "You're on a 5-day streak for Web3 tasks! Keep it up!",
    timestamp: 'Just now',
    colorClass: 'text-emerald-500 dark:text-emerald-400',
    urgency: 'medium'
  },
  {
    id: '3',
    type: 'imbalance',
    icon: <AlertTriangle className="w-5 h-5" />,
    message: 'Your School pillar has been neglected this week',
    timestamp: '1 hour ago',
    actionText: 'View Balance',
    actionLink: '#',
    colorClass: 'text-amber-500 dark:text-amber-400',
    urgency: 'medium'
  },
  {
    id: '4',
    type: 'upcoming',
    icon: <Clock className="w-5 h-5" />,
    message: 'Blockchain Exam preparation due tomorrow',
    timestamp: '3 hours ago',
    actionText: 'Plan Time',
    actionLink: '#',
    colorClass: 'text-blue-500 dark:text-blue-400',
    urgency: 'high'
  },
  {
    id: '5',
    type: 'goal',
    icon: <Target className="w-5 h-5" />,
    message: "You're 80% towards your weekly Web3 learning goal",
    timestamp: 'Just now',
    actionText: 'View Progress',
    actionLink: '#',
    colorClass: 'text-purple-500 dark:text-purple-400',
    urgency: 'low'
  },
  {
    id: '6',
    type: 'streak',
    icon: <CheckCircle2 className="w-5 h-5" />,
    message: 'Completed 3 Personal tasks today - great balance!',
    timestamp: '30 mins ago',
    colorClass: 'text-emerald-500 dark:text-emerald-400',
    urgency: 'low'
  }
];

export function HighlightsWidget() {
  const { user } = useAuth();
  const [highlights, setHighlights] = React.useState<HighlightItem[]>(mockHighlights);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    if (!user) return;
    // ... fetch highlights logic ...
  }, [user, supabase]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-emerald-600 dark:from-cyan-400 dark:to-emerald-400 bg-clip-text text-transparent">
          <Flame className="w-5 h-5 text-orange-500" /> Highlights & Actions
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3">
        {highlights.length > 0 ? (
          highlights.map((highlight) => (
            <HighlightCard key={highlight.id} highlight={highlight} />
          ))
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm">
            No highlights at the moment. Keep up the good work!
          </div>
        )}
      </div>
    </div>
  );
}
