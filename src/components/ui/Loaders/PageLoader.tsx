// Path: src/components/ui/Loaders/PageLoader.tsx
'use client';

import React from 'react';
// Removed Loader2 import as per your request

interface PageLoaderProps {
  message?: string; // Optional message prop
}

/**
 * PageLoader Component
 * Displays a full-page loading indicator with the animated app name and a custom message.
 * Intended for initial app load or when a full page/route is loading,
 * typically used within Next.js loading.tsx files or Suspense fallbacks.
 */
export function PageLoader({ message = "Loading..." }: PageLoaderProps) {
  return (
    // Full screen overlay with a semi-transparent background and blur effect
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm transition-opacity duration-300">
      <div className="flex flex-col items-center text-center p-4">
        {/* KoruSync App Name - Styled and Animated */}
        {/* The 'animate-pulse' class provides a subtle pulsing animation */}
        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent mb-4 animate-pulse">
          KoruSync
        </h1>
        {/* Loading Message - Uses the message prop or defaults to "Loading..." */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {message}
        </p>
      </div>
    </div>
  );
}