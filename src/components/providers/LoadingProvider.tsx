'use client';

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  Suspense, // Import Suspense
  useCallback, // Import useCallback
} from 'react';
import { PageLoader } from '../ui/Loader'; // Verify path is correct
import { usePathname, useSearchParams } from 'next/navigation';

// Define the shape of the context value
interface LoadingContextType {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

// Create the context
const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

// Minimum time to display the loader (in milliseconds) to prevent flashing
const MIN_LOADING_TIME = 500; // Adjust as needed

/**
 * Internal component specifically to listen for route changes using client hooks.
 * This component is wrapped in Suspense by the provider.
 */
function RouteChangeListener() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Get loading functions from the context provider
  const { startLoading, stopLoading } = useLoading();

  // This effect runs when the pathname or searchParams change
  useEffect(() => {
    console.log('RouteChangeListener: Route changed, starting loading...');
    startLoading(); // Show the loader

    // Set a timer to ensure the loader shows for at least MIN_LOADING_TIME
    const timer = setTimeout(() => {
      console.log('RouteChangeListener: Minimum load time elapsed, stopping loading...');
      stopLoading(); // Hide the loader
    }, MIN_LOADING_TIME);

    // Cleanup function: clear the timer if the route changes again
    // before the minimum time is up, or when the component unmounts.
    return () => {
        console.log('RouteChangeListener: Effect cleanup (clearing timer).');
        clearTimeout(timer);
    }
    // ** CORRECTED DEPENDENCIES **
    // Only depend on pathname and searchParams. startLoading/stopLoading
    // are stable references thanks to useCallback in the provider.
  }, [pathname, searchParams]);

  // This component does not render any UI itself
  return null;
}

/**
 * Provides loading state and functions to the application.
 * Manages the display of a page loader during route transitions.
 */
export function LoadingProvider({ children }: { children: ReactNode }) {
  // State to track if the loader should be visible
  const [isLoading, setIsLoading] = useState(false); // Start false, loader triggered by RouteChangeListener
  // State to track when loading started, for minimum display time calculation
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);

  // Memoized function to start the loading indicator
  const startLoading = useCallback(() => {
    console.log('LoadingProvider: startLoading called.');
    setLoadingStartTime(Date.now()); // Record start time
    setIsLoading(true); // Show loader
  }, []); // Empty dependency array: function reference is stable

  // Memoized function to stop the loading indicator
  const stopLoading = useCallback(() => {
    const currentTime = Date.now();
    const startTime = loadingStartTime ?? currentTime; // Use current time if start time is null
    const elapsedTime = currentTime - startTime;
    // Calculate how much longer the loader needs to show (if any)
    const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime);

    console.log(`LoadingProvider: stopLoading called. Elapsed: ${elapsedTime}ms, Remaining: ${remainingTime}ms`);

    if (remainingTime > 0) {
      // If minimum time hasn't passed, wait before hiding
      const timer = setTimeout(() => {
        console.log('LoadingProvider: Hiding loader after delay.');
        setIsLoading(false);
        setLoadingStartTime(null);
      }, remainingTime);
      // Note: Could store timer ID if complex cleanup on rapid calls is needed
    } else {
      // If minimum time has passed, hide immediately
      console.log('LoadingProvider: Hiding loader immediately.');
      setIsLoading(false);
      setLoadingStartTime(null);
    }
  }, [loadingStartTime]); // Depends only on loadingStartTime

  // Context value containing state and control functions
  const contextValue = { isLoading, startLoading, stopLoading };

  return (
    <LoadingContext.Provider value={contextValue}>
      {/* Display the PageLoader overlay when isLoading is true */}
      {isLoading && <PageLoader />}

      {/* Render the actual application content */}
      {/* Hide children visually when loading to prevent interaction/layout shifts */}
      {/* Using opacity and pointer-events might be smoother than 'hidden' */}
      <div className={isLoading ? 'opacity-0 pointer-events-none' : 'opacity-100 transition-opacity duration-300'}>
        {children}
      </div>

      {/* Render the RouteChangeListener wrapped in Suspense */}
      {/* Suspense handles the client-side hooks used within RouteChangeListener */}
      <Suspense fallback={null}>
        <RouteChangeListener />
      </Suspense>

    </LoadingContext.Provider>
  );
}

/**
 * Custom hook to easily consume the LoadingContext.
 */
export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}
