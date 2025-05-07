'use client';

import React from 'react';
// Using the same SVG spinner as ButtonLoader for consistency, but potentially smaller
// Or you could use a different icon like lucide-react's Loader2 if preferred

interface InlineSpinnerProps {
  className?: string; // Optional className for custom styling or sizing
  size?: number;      // Optional size prop (e.g., 4 for h-4 w-4)
}

/**
 * InlineSpinner Component
 * A small, discreet spinner for inline loading indications,
 * such as validating an input field or a quick background task.
 */
export function InlineSpinner({ className, size = 4 }: InlineSpinnerProps) {
  const sizeClass = `h-<span class="math-inline">\{size\} w\-</span>{size}`; // Generate Tailwind size class

  return (
    <svg
      // Apply size class and animate-spin, allow overrides via className
      className={`animate-spin ${sizeClass} text-gray-500 dark:text-gray-400 ${className || ''}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true" // Hide from screen readers as it's decorative
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
};