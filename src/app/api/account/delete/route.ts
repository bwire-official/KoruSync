import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Database } from '@/types/database'

export async function POST() {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('Auth error:', userError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Attempting to delete account for user:', user.id)

    // Delete user data in reverse order of dependencies
    const tables = [
      'task_categories',
      'tasks',
      'time_entries',
      'goals',
      'categories',
      'life_pillars',
      'journal_entries',
      'mood_logs',
      'user_preferences',
      'social_connections',
      'user_gamification',
      'user_badges',
      'friendships',
      'users'
    ]

    for (const table of tables) {
      let query = supabase.from(table)

      if (table === 'task_categories') {
        // Special handling for task_categories
        const { data: tasks } = await supabase
          .from('tasks')
          .select('id')
          .eq('user_id', user.id)
        
        if (tasks && tasks.length > 0) {
          const taskIds = tasks.map(t => t.id)
          const { error: deleteError } = await query
            .delete()
            .in('task_id', taskIds)
          
          if (deleteError) {
            console.error(`Failed to delete from ${table}:`, deleteError)
            return NextResponse.json({ 
              error: `Failed to delete user data from ${table}`,
              details: deleteError.message 
            }, { status: 500 })
          }
        }
      } else if (table === 'friendships') {
        // Special handling for friendships
        const { error: deleteError } = await query
          .delete()
          .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`)
        
        if (deleteError) {
          console.error(`Failed to delete from ${table}:`, deleteError)
          return NextResponse.json({ 
            error: `Failed to delete user data from ${table}`,
            details: deleteError.message 
          }, { status: 500 })
        }
      } else if (table === 'users') {
        // Special handling for users table (using 'id' instead of 'user_id')
        const { error: deleteError } = await query
          .delete()
          .eq('id', user.id)
        
        if (deleteError) {
          console.error(`Failed to delete from ${table}:`, deleteError)
          return NextResponse.json({ 
            error: `Failed to delete user data from ${table}`,
            details: deleteError.message 
          }, { status: 500 })
        }

        // Create a service role client to delete from auth.users
        const serviceRoleClient = createClient<Database>(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          {
            auth: {
              autoRefreshToken: false,
              persistSession: false
            }
          }
        )

        // Delete from auth.users using the service role client
        const { error: authDeleteError } = await serviceRoleClient.auth.admin.deleteUser(user.id)
        if (authDeleteError) {
          console.error('Failed to delete user from auth system:', authDeleteError)
          return NextResponse.json({ 
            error: 'Failed to delete user from auth system',
            details: authDeleteError.message 
          }, { status: 500 })
        }
      } else {
        // Standard handling for user-owned tables
        const { error: deleteError } = await query
          .delete()
          .eq('user_id', user.id)
        
        if (deleteError) {
          console.error(`Failed to delete from ${table}:`, deleteError)
          return NextResponse.json({ 
            error: `Failed to delete user data from ${table}`,
            details: deleteError.message 
          }, { status: 500 })
        }
      }
      console.log(`Successfully deleted data from ${table}`)
    }

    // Sign out the user
    const { error: signOutError } = await supabase.auth.signOut()
    if (signOutError) {
      console.error('Failed to sign out user:', signOutError)
      return NextResponse.json({ 
        error: 'Failed to sign out user',
        details: signOutError.message 
      }, { status: 500 })
    }

    console.log('Successfully signed out user')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in account deletion:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 