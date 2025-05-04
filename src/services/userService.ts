import { supabase } from '@/lib/supabase'

export interface UserProfile {
  id: string
  username: string
  full_name: string
  avatar_url?: string
  role: 'user' | 'admin'
  timezone: string
  x_handle?: string
  email_verified: boolean
  email_verification_status: 'pending' | 'verified' | 'expired'
  last_verification_sent_at?: string
  created_at: string
  updated_at: string
}

export interface LifePillar {
  id: string
  user_id: string
  name: string
  color: string
  is_default: boolean
  created_at: string
  updated_at: string
}

export const userService = {
  // Profile operations
  async updateProfile(userId: string, data: Partial<UserProfile>) {
    const { data: profile, error } = await supabase
      .from('users')
      .update(data)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return profile
  },

  async getProfile(userId: string) {
    const { data: profile, error } = await supabase
      .from('users')
      .select()
      .eq('id', userId)
      .single()

    if (error) throw error
    return profile
  },

  // Life pillars operations
  async getPillars(userId: string) {
    const { data: pillars, error } = await supabase
      .from('life_pillars')
      .select()
      .eq('user_id', userId)
      .order('created_at')

    if (error) throw error
    return pillars
  },

  async setPillars(userId: string, pillars: Omit<LifePillar, 'id' | 'user_id' | 'created_at' | 'updated_at'>[]) {
    // First, delete existing pillars
    const { error: deleteError } = await supabase
      .from('life_pillars')
      .delete()
      .eq('user_id', userId)

    if (deleteError) throw deleteError

    // Then, insert new pillars
    const pillarsToInsert = pillars.map(pillar => ({
      ...pillar,
      user_id: userId,
      color: pillar.color || '#10B981' // Default to emerald-500 if not provided
    }))

    const { data: newPillars, error: insertError } = await supabase
      .from('life_pillars')
      .insert(pillarsToInsert)
      .select()

    if (insertError) throw insertError
    return newPillars
  }
} 