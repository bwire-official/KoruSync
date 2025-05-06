'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect, Suspense } from 'react';
import { PageLoader } from '../ui/Loader'; // Verify path
import { usePathname, useSearchParams } from 'next/navigation';

interface LoadingContextType {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

// Minimum time to show loader (in milliseconds)
const MIN_LOADING_TIME = 500; // Reduced slightly, adjust as needed

// NEW: Internal component to handle route change detection
function RouteChangeListener() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { startLoading, stopLoading } = useLoading(); // Get functions from context

  // Effect to trigger loading on route changes
  useEffect(() => {
    console.log('RouteChangeListener: Route changed, starting loading...');
    startLoading(); // Trigger loading state

    // Use a timer to ensure minimum loading time
    // Note: This simple timer might not perfectly align with actual page load,
    // but it provides a basic minimum display time.
    // More complex solutions might involve tracking actual loading states.
    const timer = setTimeout(() => {
      console.log('RouteChangeListener: Minimum load time elapsed, stopping loading...');
      stopLoading();
    }, MIN_LOADING_TIME);

    // Cleanup timer on component unmount or before next effect run
    return () => clearTimeout(timer);

    // Depend on pathname and searchParams to re-trigger on navigation
  }, [pathname, searchParams, startLoading, stopLoading]);

  // This component doesn't render anything itself
  return null;
}


export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false); // Start loading false by default
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);

  // Keep start/stop logic in the main provider
  const startLoading = React.useCallback(() => {
    setLoadingStartTime(Date.now());
    setIsLoading(true);
  }, []);

  const stopLoading = React.useCallback(() => {
    const currentTime = Date.now();
    // Use optional chaining and default value for safety
    const startTime = loadingStartTime ?? currentTime;
    const elapsedTime = currentTime - startTime;
    const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime);

    console.log(`Stopping loading. Elapsed: ${elapsedTime}ms, Remaining: ${remainingTime}ms`);

    if (remainingTime > 0) {
      const timer = setTimeout(() => {
        setIsLoading(false);
        setLoadingStartTime(null);
      }, remainingTime);
      // Optional: Store timer ID if cleanup needed on rapid start/stop
    } else {
      setIsLoading(false);
      setLoadingStartTime(null);
    }
  }, [loadingStartTime]);

  // Removed the initial useEffect that forced loading on mount

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {/* Conditionally render the PageLoader */}
      {isLoading && <PageLoader />}

      {/* Wrap the children and the RouteChangeListener */}
      {/* Hide children when loading */}
      <div className={isLoading ? 'hidden' : ''}>
        {children}
      </div>

      {/* Render the component that uses the hooks inside Suspense */}
      {/* Fallback can be null as RouteChangeListener doesn't render UI */}
      <Suspense fallback={null}>
        <RouteChangeListener />
      </Suspense>

    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}
