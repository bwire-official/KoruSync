/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        
        // Primary Colors
        'primary-green': '#10B981', // Emerald 500
        'primary-blue': '#06B6D4',  // Cyan 500
        'neutral-grey': '#9CA3AF',  // Gray 400
        
        // Light Mode Colors
        'light-bg': '#FFFFFF',
        'light-bg-alt': '#F9FAFB',  // Gray 50
        'light-text': '#1F2937',    // Gray 800
        'light-text-alt': '#6B7280', // Gray 500
        'light-border': '#E5E7EB',  // Gray 200
        
        // Dark Mode Colors
        'dark-bg': '#111827',       // Gray 900
        'dark-bg-alt': '#1F2937',   // Gray 800
        'dark-card': '#374151',     // Gray 700
        'dark-text': '#F9FAFB',     // Gray 100
        'dark-text-alt': '#D1D5DB', // Gray 300
        'dark-border': '#374151',   // Gray 600
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 