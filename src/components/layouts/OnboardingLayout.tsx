import { ReactNode } from "react";
import Image from "next/image";

interface OnboardingLayoutProps {
  children: ReactNode;
  step: number;
  totalSteps: number;
}

export function OnboardingLayout({ children, step, totalSteps }: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 font-inter">
      {/* Logo */}
      <div className="mb-4">
        <Image src="/logo.svg" alt="KoruSync Logo" width={48} height={48} priority />
      </div>
      {/* Progress Indicator */}
      <div className="mb-3 text-sm text-gray-500 dark:text-gray-400 font-medium">
        Step {step} of {totalSteps}
      </div>
      {/* Card */}
      <div className="w-full max-w-sm bg-white/95 dark:bg-gray-800/95 rounded-xl shadow-lg p-6">
        {children}
      </div>
    </div>
  );
} 