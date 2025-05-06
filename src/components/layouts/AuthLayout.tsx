import { ReactNode } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter for navigation
import { ArrowLeft } from 'lucide-react'; // Import an icon for the back button
import { Button } from '@/components/ui/Button'; // Verify path

// Define an interface for the component's props
interface AuthLayoutProps {
  children: ReactNode;
  showBackButton?: boolean; // Optional showBackButton prop
  title?: string;          // <<< ADDED: Optional title prop
}

// Update the component to use the props interface and destructure the new prop
export default function AuthLayout({ children, showBackButton = false, title }: AuthLayoutProps) { // <<< ADDED title HERE
  const router = useRouter(); // Get router instance

  const handleBack = () => {
    router.back(); // Navigate to the previous page in history
  };

  // You can optionally use the 'title' prop here if needed, e.g., for Head component
  // import Head from 'next/head';
  // <Head><title>{title ? `${title} - KoruSync` : 'KoruSync'}</title></Head>
  // Note: Managing title might be better done in the specific page component itself using Metadata API

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 font-inter p-4 relative">
      {/* Conditionally render the back button based on the prop */}
      {showBackButton && (
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10">
           {/* Use your reusable Button component or a simple button */}
           <Button
             type="button"
             variant="secondary" // Or 'ghost' if you added it
             onClick={handleBack}
             className="p-2 rounded-full" // Example styling - adjust as needed
             aria-label="Go back"
           >
             <ArrowLeft className="h-5 w-5" />
           </Button>
        </div>
      )}
      {/* The main content passed to the layout */}
      {/* Added a container to ensure content doesn't overlap with absolute positioned button */}
      <div className="w-full">
         {children}
      </div>
    </div>
  );
}
