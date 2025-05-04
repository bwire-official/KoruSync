'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Palette } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

export default function Navbar() {
  const { theme, toggleTheme } = useTheme()

  return (
    <nav className="fixed w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <Image
              src="/logo.svg"
              alt="KoruSync Logo"
              width={32}
              height={32}
              className="mr-2 transform group-hover:scale-110 transition-transform duration-200"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
              KoruSync
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="#features" 
              className="text-gray-600 dark:text-gray-300 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors duration-200"
            >
              Features
            </Link>
            <Link 
              href="#how-it-works" 
              className="text-gray-600 dark:text-gray-300 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors duration-200"
            >
              How it Works
            </Link>
          </div>

          {/* Auth Buttons & Theme Toggle */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 hover:from-cyan-500/20 hover:to-emerald-500/20 transition-all duration-200"
              aria-label="Toggle theme"
            >
              <Palette className="w-5 h-5 text-cyan-500 dark:text-emerald-400" />
            </button>

            {/* Login Link */}
            <Link 
              href="/auth/login" 
              className="text-gray-600 dark:text-gray-300 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors duration-200"
            >
              Login
            </Link>

            {/* Sign Up Button */}
            <Link 
              href="/auth/signup" 
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
} 