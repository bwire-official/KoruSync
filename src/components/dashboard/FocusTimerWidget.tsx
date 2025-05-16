// Path: src/components/dashboard/FocusTimerWidget.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, Square, Timer, Brain, Layers, ListChecks } from 'lucide-react'; // Example icons
import { Button } from '@/components/ui/Button'; // Verify path
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // If using shadcn select

// Props for the widget (e.g., to pre-select a task from dashboard)
interface FocusTimerWidgetProps {
  initialTaskName?: string;
  initialPillarName?: string;
  // Add a callback for when a session is stopped, to eventually log it
  onSessionStop?: (elapsedSeconds: number, taskName: string | null, pillarName: string | null) => void;
}

// Helper to format time from seconds to MM:SS
const formatTime = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export function FocusTimerWidget({ initialTaskName, initialPillarName, onSessionStop }: FocusTimerWidgetProps) {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  // For now, let's just allow typing a focus description.
  // Task/Pillar selection can be enhanced later.
  const [focusDescription, setFocusDescription] = useState<string>('');
  const [displayFocus, setDisplayFocus] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer logic
  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isPaused]);

  const handleStartSession = useCallback(() => {
    setIsActive(true);
    setIsPaused(false);
    setElapsedSeconds(0);
    setDisplayFocus(focusDescription || initialTaskName || initialPillarName || "General Focus");
    // Clear input after starting if you want
    // setFocusDescription('');
    console.log(`Focus session started for: ${displayFocus}`);
  }, [focusDescription, initialTaskName, initialPillarName, displayFocus]);

  const handlePauseResumeSession = useCallback(() => {
    setIsPaused((prev) => !prev);
    console.log(isPaused ? 'Focus session resumed' : 'Focus session paused');
  }, [isPaused]);

  const handleStopSession = useCallback(() => {
    setIsActive(false);
    setIsPaused(false);
    if (onSessionStop) {
      onSessionStop(elapsedSeconds, displayFocus, null); // Pass null for pillar for now
    }
    console.log(`Focus session stopped. Duration: ${formatTime(elapsedSeconds)} for ${displayFocus}`);
    setElapsedSeconds(0);
    setDisplayFocus(null);
    // setFocusDescription(''); // Optionally clear description
  }, [elapsedSeconds, displayFocus, onSessionStop]);


  return (
    <div className="space-y-3">
      {!isActive ? (
        // State: Timer Stopped - Ready to Start
        <div className="space-y-3">
          <input
            type="text"
            value={focusDescription}
            onChange={(e) => setFocusDescription(e.target.value)}
            placeholder="What are you focusing on? (Optional)"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <Button
            onClick={handleStartSession}
            variant="primary"
            className="w-full flex items-center justify-center"
          >
            <Play className="w-4 h-4 mr-2" />
            Start Focus Session
          </Button>
        </div>
      ) : (
        // State: Timer Active or Paused
        <div className="space-y-4 text-center">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Currently focusing on:</p>
            <p className="text-lg font-medium text-gray-800 dark:text-white truncate" title={displayFocus || undefined}>
              {displayFocus || "Focus Session"}
            </p>
          </div>
          <div className="text-5xl font-mono font-bold text-emerald-600 dark:text-emerald-400 my-4">
            {formatTime(elapsedSeconds)}
          </div>
          <div className="flex justify-center space-x-3">
            <Button
              onClick={handlePauseResumeSession}
              variant="secondary"
              className="flex items-center justify-center"
              aria-label={isPaused ? "Resume session" : "Pause session"}
            >
              {isPaused ? <Play className="w-4 h-4 mr-1 sm:mr-2" /> : <Pause className="w-4 h-4 mr-1 sm:mr-2" />}
              <span className="hidden sm:inline">{isPaused ? 'Resume' : 'Pause'}</span>
            </Button>
            <Button
              onClick={handleStopSession}
              variant="danger"
              className="flex items-center justify-center"
              aria-label="Stop session"
            >
              <Square className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Stop</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}