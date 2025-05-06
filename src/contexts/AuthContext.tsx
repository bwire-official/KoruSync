'use client'

import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { User } from '@supabase/auth-helpers-nextjs';

/**
 * Auth provider types supported by the application
 */
type AuthProvider = 'google'; // Expandable: 'twitter' | 'apple'

/**
 * Complete authentication context interface defining all
 * available authentication methods and state
 */
interface AuthContextType {
  // Authentication state
  user: User | null;
  loading: boolean;
  error: string | null;
  success: string | null;
  
  // Authentication methods
  signIn: (provider: AuthProvider) => Promise<void>;
  signInWithEmail: (identifier: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  
  // OTP related methods
  verifyOTP: (otp: string) => Promise<void>;
  resendOTP: () => Promise<void>;
}

// Create context with proper typing and undefined initial value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication Provider component that wraps the application
 * and provides authentication state and methods to all children
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  // Get all auth state and functions from the hook
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to access authentication context from any component
 * @returns {AuthContextType} The authentication context value
 * @throws {Error} If used outside of AuthProvider
 */
export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  
  return context;
}