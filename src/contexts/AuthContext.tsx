'use client'

import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth'; // Assuming useAuth returns all these values
import type { User } from '@supabase/auth-helpers-nextjs';

// Define the full shape of the context value, matching the return type of useAuth
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null; // Added from useAuth return
  success: string | null; // Added from useAuth return
  signIn: (provider: 'google' /*| 'twitter' | 'apple'*/) => Promise<void>; // Adjusted based on previous decisions
  // Ensure identifier is used if login allows username/email
  signInWithEmail: (identifier: string, password: string) => Promise<void>;
  // *** CORRECTED SIGNATURE FOR signUp ***
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  verifyOTP: (otp: string) => Promise<void>; // Added from useAuth return
  resendOTP: () => Promise<void>; // Added from useAuth return
}

// Create the context with the defined type, initially undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component that uses the useAuth hook and provides its value
export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth(); // Get all auth state and functions from the hook

  return (
    // Provide the entire auth object from useAuth as the context value
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to easily consume the AuthContext
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // This error ensures the hook is used within an AuthProvider
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
