'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

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

export function MotivationalQuoteWidget() {
  const [currentQuote, setCurrentQuote] = useState('');

  useEffect(() => {
    // Select a random quote when the component mounts
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setCurrentQuote(quotes[randomIndex]);

    // Change quote every 5 minutes
    const interval = setInterval(() => {
      const newRandomIndex = Math.floor(Math.random() * quotes.length);
      setCurrentQuote(quotes[newRandomIndex]);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []); // Empty dependency array ensures this runs only once on mount

  if (!currentQuote) {
    return null; // Don't render anything if no quote is selected yet
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-800 rounded-lg p-4 shadow-sm border border-gray-100/50 dark:border-gray-700/50 transition-all duration-300 hover:shadow-md">
      <div className="flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5 animate-pulse" />
        <blockquote className="text-sm italic text-gray-600 dark:text-gray-400 leading-relaxed">
          "{currentQuote}"
        </blockquote>
      </div>
    </div>
  );
} 