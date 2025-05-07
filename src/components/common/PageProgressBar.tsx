// src/components/common/PageProgressBar.tsx
'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css'; // Standard NProgress CSS

function PageProgressBarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Configure NProgress for faster feel
  useEffect(() => {
    NProgress.configure({
      showSpinner: false,
      trickleSpeed: 300, // Slow down the trickle effect
      speed: 250, // Make the main animation faster (ms)
      minimum: 0.1
    });
    // Clear any stuck bar on initial mount
    NProgress.done();
  }, []);

  // Handle route changes
  useEffect(() => {
    // Start progress on route change
    NProgress.start();

    // Call done directly after starting. NProgress handles animating
    // to completion smoothly based on its internal logic and speed settings.
    // This often feels more in sync than relying solely on cleanup for 'done'.
    NProgress.done();

    // Cleanup is still good practice, though NProgress might already be done.
    return () => {
      NProgress.done();
    };
  }, [pathname, searchParams]); // Re-run effect if path or query params change

  return null;
}

export function PageProgressBar() {
  return (
    <Suspense fallback={null}>
      <PageProgressBarContent />
    </Suspense>
  );
}