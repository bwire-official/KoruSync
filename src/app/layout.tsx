import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/contexts/AuthContext'
// Import the ThemeProvider from next-themes and alias it
import { ThemeProvider as NextThemesProvider } from 'next-themes'
// Keep your custom ThemeProvider import (if needed for other context values)
import { ThemeProvider as CustomThemeProvider } from '@/contexts/ThemeContext'
import { LoadingProvider } from '@/components/providers/LoadingProvider' // Assuming this exists

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'KoruSync',
  description: 'Balance your life pillars with KoruSync',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // Add suppressHydrationWarning to <html> tag
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/* Wrap with the provider from next-themes */}
        <NextThemesProvider
          attribute="class" // Use class strategy for Tailwind dark mode
          defaultTheme="system" // Default to system preference
          enableSystem // Allow detecting system preference
          disableTransitionOnChange // Prevent theme flash on route changes
        >
          {/* Place your custom providers INSIDE the next-themes provider */}
          <CustomThemeProvider> {/* Your custom theme context provider */}
            <LoadingProvider> {/* Your loading context provider */}
              <AuthProvider> {/* Your auth context provider */}
                {children}
              </AuthProvider>
            </LoadingProvider>
          </CustomThemeProvider>
        </NextThemesProvider>
      </body>
    </html>
  )
}
