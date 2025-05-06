'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Keep Link if used elsewhere, otherwise remove if unused
import Image from 'next/image'; // Keep Image if used elsewhere, otherwise remove if unused
import { ChevronLeft, Sun, Moon, User, Clock, Layers, CheckCircle, Loader2, AlertCircle } from 'lucide-react'; // Added Loader2, AlertCircle
import { Button } from '@/components/ui/Button'; // Ensure path is correct
import { UsernameStep } from './components/UsernameStep'; // Ensure path is correct
import { TimezoneStep } from './components/TimezoneStep'; // Ensure path is correct
import { PillarsStep } from './components/PillarsStep'; // Ensure path is correct
import { IntroStep } from './components/IntroStep'; // Ensure path is correct
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database'; // Assuming types exist
import { useTheme } from '@/contexts/ThemeContext'; // Assuming this context exists
// *** ADDED/VERIFIED IMPORTS FOR ALERT ***
import { Alert, AlertDescription } from "@/components/ui/alert"; // Verify this path is correct for your project

// Define the possible steps
type Step = 'welcome' | 'username' | 'timezone' | 'pillars' | 'intro';

// Define the structure for data collected across steps
// *** NOTE: Ensure PillarsStepProps in PillarsStep.tsx expects this type ***
export interface OnboardingStepData {
  username: string;
  timezone: string;
  pillars: { name: string; color: string }[];
}

export default function OnboardingPage() {
  // State for current step
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  // State for loading during async operations (like final submission)
  const [loading, setLoading] = useState(false);
  // State to hold data collected from all steps
  const [stepData, setStepData] = useState<OnboardingStepData>({
    username: '',
    // Attempt to get initial timezone, default to UTC if fails
    timezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC',
    // Initialize with default pillars (ideally fetch these defaults)
    pillars: [
      { name: 'Web3', color: '#10B981' }, // Example color
      { name: 'School', color: '#06B6D4' }, // Example color
      { name: 'Personal / Life', color: '#9CA3AF' }, // Example color
    ]
  });
  // State for displaying errors
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClientComponentClient<Database>(); // Typed client
  const { theme, toggleTheme } = useTheme(); // Assuming useTheme provides theme state and toggle function

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // If no session, redirect to login (middleware should ideally handle this too)
        console.log('Onboarding: No session found, redirecting to login.');
        router.push('/auth/login');
      }
      // Optionally fetch user data here if needed for pre-filling steps
    };
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Function to handle moving to the next step
  const handleNextStep = async (data: Partial<OnboardingStepData>) => {
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      // Ensure data is merged correctly, especially pillars array
       const updatedData = {
         ...stepData,
         ...data,
         // If data contains pillars, make sure it overwrites correctly
         pillars: data.pillars ? [...data.pillars] : [...stepData.pillars]
       };
      setStepData(updatedData); // Update state immediately for UI consistency

      // If this is the final step ('intro'), save all data and redirect
      if (currentStep === 'intro') {
        console.log('Starting final step completion with data:', updatedData);

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          console.error('Session error or not found:', sessionError);
          throw new Error('Authentication error. Please log in again.');
        }
        const userId = session.user.id;
        console.log('Session found:', userId);

        // --- Database Updates ---
        // 1. Update user profile (username, timezone) in public.users
        console.log('Attempting to update user profile...');
        const { error: userUpdateError } = await supabase
          .from('users')
          .update({
            username: updatedData.username,
            timezone: updatedData.timezone
          })
          .eq('id', userId); // Use id for public.users

        console.log('Update user profile result:', { userUpdateError });
        if (userUpdateError) {
          throw new Error(`Failed to update user profile: ${userUpdateError.message}`);
        }

        // 2. Update onboarding completion status in user_preferences
        console.log('Attempting to update onboarding completion status...');
        const { error: prefUpdateError } = await supabase
          .from('user_preferences')
          .update({ onboarding_completed: true })
          .eq('user_id', userId); // Use user_id for user_preferences

        console.log('Update preferences result:', { prefUpdateError });
        if (prefUpdateError) {
          // Note: Even if this fails, user profile might be updated. Decide on rollback strategy if needed.
          throw new Error(`Failed to update onboarding status: ${prefUpdateError.message}`);
        }

        // 3. Update/Insert life_pillars based on updatedData.pillars
        console.log('Attempting to update/insert life pillars:', updatedData.pillars);
        // Delete existing default pillars for the user first (optional, depends on desired logic)
        // Or implement upsert logic
        const pillarUpserts = updatedData.pillars.map(pillar => ({
            user_id: userId,
            name: pillar.name,
            color: pillar.color,
            // is_default: false // Mark customized pillars as not default? Or handle in component
        }));

        // Example using upsert (insert or update based on unique constraint user_id, name)
        const { error: pillarError } = await supabase
            .from('life_pillars')
            .upsert(pillarUpserts, { onConflict: 'user_id, name' });

        if (pillarError) {
            console.error('ERROR updating/inserting pillars:', pillarError);
            throw new Error(`Failed to save pillar configuration: ${pillarError.message}`);
        }
        console.log('Pillar update/insert successful.');


        console.log('All updates successful, attempting redirect to /dashboard...');
        router.push('/dashboard');
        return; // Exit function after redirect
      }

      // Move to the next step in the sequence
      const steps: Step[] = ['welcome', 'username', 'timezone', 'pillars', 'intro'];
      const currentIndex = steps.indexOf(currentStep);
      if (currentIndex < steps.length - 1) {
        setCurrentStep(steps[currentIndex + 1]);
      } else {
         console.warn("Tried to advance past the last step."); // Should be handled by intro step logic
      }

    } catch (err) {
      console.error('Error in handleNextStep:', err);
      const message = err instanceof Error ? err.message : 'An unexpected error occurred during setup.';
      // Ensure error message is always a string
      setError(message.includes('Failed to fetch') ? 'Could not connect to server. Please check your connection.' : String(message));
    } finally {
      setLoading(false);
    }
  };

  // Function to handle moving to the previous step
  const handleBack = () => {
    const steps: Step[] = ['welcome', 'username', 'timezone', 'pillars', 'intro'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0 && !loading) { // Prevent going back while loading
      setCurrentStep(steps[currentIndex - 1]);
      setError(null); // Clear errors when going back
    }
  };

  // Function to render the component for the current step
  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500 dark:bg-emerald-600 flex items-center justify-center shadow-lg">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome to KoruSync!
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Let's quickly set up your workspace for balanced productivity.
            </p>
            <div className="space-y-3 text-left pt-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                We'll help you configure:
              </p>
              <ul className="space-y-2">
                {[
                  { icon: User, text: 'Your unique username' },
                  { icon: Clock, text: 'Your local timezone' },
                  { icon: Layers, text: 'Your core life pillars' },
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-200">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Button
              onClick={() => handleNextStep({})}
              isLoading={loading}
              disabled={loading}
              className="w-full mt-6"
              variant="primary"
            >
              Let's Go!
            </Button>
          </div>
        );
      case 'username':
        return (
          <UsernameStep
            initialUsername={stepData.username || ''}
            // Ensure data passed back matches expected structure if UsernameStep modifies StepData directly
            onComplete={(data) => handleNextStep(data as Partial<OnboardingStepData>)}
            loading={loading}
          />
        );
      case 'timezone':
        return (
          <TimezoneStep
            initialTimezone={stepData.timezone}
            onComplete={(data) => handleNextStep(data as Partial<OnboardingStepData>)}
            loading={loading}
          />
        );
      case 'pillars':
        // *** IMPORTANT: Ensure PillarsStepProps in PillarsStep.tsx accepts/returns this type ***
        return (
          <PillarsStep
            initialPillars={stepData.pillars}
            // Ensure data passed back matches expected structure
            onComplete={(data) => handleNextStep(data as Partial<OnboardingStepData>)}
            loading={loading}
          />
        );
      case 'intro':
        return (
          <IntroStep
            onComplete={() => handleNextStep({})} // Final submission triggered here
            loading={loading}
          />
        );
      default:
         return <div>Unknown step</div>;
    }
  };

  // Main return for the OnboardingPage component
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col font-inter">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-8 space-y-6 relative overflow-hidden">

            {/* Loading Overlay */}
            {loading && (
              <div className="absolute inset-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              {currentStep !== 'welcome' ? (
                <Button
                  type="button"
                  variant="secondary" // Changed from ghost
                  onClick={handleBack}
                  disabled={loading}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  aria-label="Go back"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              ) : (
                 <div className="w-9 h-9"></div> // Placeholder for alignment
              )}
              {/* Progress Indicator */}
              <div className="flex justify-center gap-2">
                {['welcome', 'username', 'timezone', 'pillars', 'intro'].map((step, index, arr) => (
                  <div
                    key={step}
                    className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                      index <= arr.indexOf(currentStep)
                        ? 'bg-emerald-500 dark:bg-emerald-400'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={toggleTheme}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700" />
                )}
              </button>
            </div>

            {/* Display overall error message if exists */}
            {/* *** ENSURE Alert components are imported correctly *** */}
            {error && (
               <Alert variant="destructive" className="mb-4">
                 {/* Added key prop for list rendering */}
                 <AlertCircle className="h-4 w-4" key="error-icon"/>
                 <AlertDescription key="error-desc">{error}</AlertDescription>
               </Alert>
            )}

            {/* Step Content */}
            <div className="mt-4 min-h-[300px]">
              {renderStep()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
