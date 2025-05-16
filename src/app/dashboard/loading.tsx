'use client'; // Or remove if PageLoader is simple enough

import { PageLoader } from '@/components/ui/Loaders/PageLoader'; // Verify this path


export default function DashboardLoading() {
  return <PageLoader message="Preparing your dashboard..." />;
}