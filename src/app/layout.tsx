import './globals.css' // Ensure this imports Tailwind base styles etc.
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'; // Import the Next.js Script component
import { AuthProvider } from '@/contexts/AuthContext' 
import { ThemeProvider as NextThemesProvider } from 'next-themes' // Import and alias next-themes
import { ThemeProvider as CustomThemeProvider } from '@/contexts/ThemeContext' // Your custom theme provider (verify path)
import { LoadingProvider } from '@/components/providers/LoadingProvider' // Verify path

// Setup the Inter font
const inter = Inter({ subsets: ['latin'] })

// Define metadata for the application
export const metadata: Metadata = {
  title: 'KoruSync',
  description: 'Balance your life pillars with KoruSync',
  // Add other metadata like icons if needed
}

// Defining your Google Analytics Measurement ID
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-EH8RFBSPQN";

// Define the RootLayout component
export default function RootLayout({
  children,
}: {
  children: React.ReactNode // Type for children prop
}) {
  return (
    // Add suppressHydrationWarning to prevent theme mismatch warnings
    <html lang="en" suppressHydrationWarning>
      {/* Apply base font and antialiasing to the body */}
      <body className={`${inter.className} antialiased`}>

        {/* Google Analytics Scripts using next/script */}
        {/* Only render scripts if the Measurement ID is available */}
        {GA_MEASUREMENT_ID && (
          <>
            {/* Load the main gtag.js script after the page is interactive */}
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            />
            {/* Initialize gtag and configure it */}
            <Script
              id="gtag-init-script" // Unique ID for the inline script
              strategy="afterInteractive"
              // Use dangerouslySetInnerHTML for inline script content
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_MEASUREMENT_ID}', {
                    page_path: window.location.pathname, // Track initial page view
                  });
                `,
              }}
            />
          </>
        )}
        {/* End Google Analytics Scripts */}

        {/* Theme Provider from next-themes (handles adding 'dark' class) */}
        <NextThemesProvider
          attribute="class" // Tells it to modify the class attribute (for Tailwind)
          defaultTheme="system" // Default to user's system preference
          enableSystem // Allows detection of system preference
          disableTransitionOnChange // Prevents theme flash during route changes
        >
          {/* Your Custom Context Providers nested inside */}
          <CustomThemeProvider> {/* Your provider for custom theme values/toggle function */}
            <LoadingProvider> {/* Your provider for page loading state */}
              <AuthProvider> {/* Your provider for authentication state */}
                {/* The actual page content */}
                {children}
              </AuthProvider>
            </LoadingProvider>
          </CustomThemeProvider>
        </NextThemesProvider>
      </body>
    </html>
  )
}
