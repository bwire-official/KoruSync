import { createClient } from '@supabase/supabase-js'
// Import the Database type generated by Supabase CLI
import type { Database } from '@/types/database' // Ensure this path is correct

// Ensure environment variables are loaded correctly
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if the environment variables are set
if (!supabaseUrl) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL");
}
if (!supabaseAnonKey) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

// Create and export the Supabase client, typed with the generated Database type
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Type for auth error responses (Keep this if used elsewhere)
export type AuthError = {
  message: string;
  status?: number;
};

// Helper to handle auth errors (Keep this if used elsewhere)
export const handleAuthError = (error: any): AuthError => {
  console.error("Auth Error Raw:", error); // Log raw error for debugging
  if (error && typeof error === 'object' && 'message' in error) {
    // Handle Supabase AuthApiError or similar objects with a message property
    return { message: String(error.message), status: typeof error.status === 'number' ? error.status : undefined };
  } else if (error instanceof Error) {
     return { message: error.message };
  }
  return { message: 'An unexpected authentication error occurred.' };
};

// REMOVED the conflicting manual 'export interface Database { ... }' block.
// The types are now correctly imported from '@/types/database'.

// REMOVED the manual 'export type Json = ...' block as it should also
// be part of the generated types if needed, or defined elsewhere if truly custom.

