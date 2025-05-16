'use client'; // This can often be a client component, or even server if PageLoader is simple enough

import { PageLoader } from '@/components/ui/Loaders/PageLoader'; // Verify this path


export default function RootLoading() {
  // Customize the message for the initial app load
  return <PageLoader message="Initializing KoruSync..." />;
}