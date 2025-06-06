export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      badges: {
        Row: {
          created_at: string
          criteria: string | null
          description: string
          icon_key: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          criteria?: string | null
          description: string
          icon_key?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          criteria?: string | null
          description?: string
          icon_key?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      default_pillars: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          color: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      email_verification_tokens: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          token: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          token: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          token?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_verification_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      friendships: {
        Row: {
          accepted_at: string | null
          requested_at: string
          status: Database["public"]["Enums"]["friendship_status"]
          user_id_1: string
          user_id_2: string
        }
        Insert: {
          accepted_at?: string | null
          requested_at?: string
          status: Database["public"]["Enums"]["friendship_status"]
          user_id_1: string
          user_id_2: string
        }
        Update: {
          accepted_at?: string | null
          requested_at?: string
          status?: Database["public"]["Enums"]["friendship_status"]
          user_id_1?: string
          user_id_2?: string
        }
        Relationships: [
          {
            foreignKeyName: "friendships_user_id_1_fkey"
            columns: ["user_id_1"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friendships_user_id_2_fkey"
            columns: ["user_id_2"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          end_date: string | null
          goal_type: Database["public"]["Enums"]["goal_type"]
          id: string
          pillar_id: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["goal_status"]
          target_unit: string
          target_value: number
          time_period: Database["public"]["Enums"]["goal_time_period"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          goal_type: Database["public"]["Enums"]["goal_type"]
          id?: string
          pillar_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["goal_status"]
          target_unit: string
          target_value: number
          time_period: Database["public"]["Enums"]["goal_time_period"]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          goal_type?: Database["public"]["Enums"]["goal_type"]
          id?: string
          pillar_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["goal_status"]
          target_unit?: string
          target_value?: number
          time_period?: Database["public"]["Enums"]["goal_time_period"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_pillar_id_fkey"
            columns: ["pillar_id"]
            isOneToOne: false
            referencedRelation: "life_pillars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          created_at: string
          entry_text: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entry_text: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          entry_text?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      life_pillars: {
        Row: {
          color: string
          created_at: string
          id: string
          is_default: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color: string
          created_at?: string
          id?: string
          is_default?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "life_pillars_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      mood_logs: {
        Row: {
          created_at: string
          id: string
          log_date: string
          mood_value: Database["public"]["Enums"]["mood_rating"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          log_date?: string
          mood_value: Database["public"]["Enums"]["mood_rating"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          log_date?: string
          mood_value?: Database["public"]["Enums"]["mood_rating"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mood_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      social_connections: {
        Row: {
          created_at: string
          id: string
          provider: Database["public"]["Enums"]["social_provider"]
          provider_user_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          provider: Database["public"]["Enums"]["social_provider"]
          provider_user_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          provider?: Database["public"]["Enums"]["social_provider"]
          provider_user_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      task_categories: {
        Row: {
          assigned_at: string
          category_id: string
          task_id: string
        }
        Insert: {
          assigned_at?: string
          category_id: string
          task_id: string
        }
        Update: {
          assigned_at?: string
          category_id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_categories_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          created_at: string
          description: string | null
          due_date: string | null
          estimated_duration: unknown | null
          id: string
          is_recurring: boolean
          parent_task_id: string | null
          pillar_id: string | null
          priority: Database["public"]["Enums"]["task_priority"]
          recurrence_rule: string | null
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          estimated_duration?: unknown | null
          id?: string
          is_recurring?: boolean
          parent_task_id?: string | null
          pillar_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"]
          recurrence_rule?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          estimated_duration?: unknown | null
          id?: string
          is_recurring?: boolean
          parent_task_id?: string | null
          pillar_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"]
          recurrence_rule?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_pillar_id_fkey"
            columns: ["pillar_id"]
            isOneToOne: false
            referencedRelation: "life_pillars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entries: {
        Row: {
          created_at: string
          duration: unknown | null
          end_time: string | null
          id: string
          notes: string | null
          start_time: string
          task_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration?: unknown | null
          end_time?: string | null
          id?: string
          notes?: string | null
          start_time: string
          task_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration?: unknown | null
          end_time?: string | null
          id?: string
          notes?: string | null
          start_time?: string
          task_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_gamification: {
        Row: {
          current_streak: number
          level: number
          longest_streak: number
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          current_streak?: number
          level?: number
          longest_streak?: number
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          current_streak?: number
          level?: number
          longest_streak?: number
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_gamification_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string
          notifications_enabled: boolean
          onboarding_completed: boolean
          theme: Database["public"]["Enums"]["app_theme"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          notifications_enabled?: boolean
          onboarding_completed?: boolean
          theme?: Database["public"]["Enums"]["app_theme"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          notifications_enabled?: boolean
          onboarding_completed?: boolean
          theme?: Database["public"]["Enums"]["app_theme"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          timezone: string
          updated_at: string
          username: string | null
          x_handle: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          timezone?: string
          updated_at?: string
          username?: string | null
          x_handle?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          timezone?: string
          updated_at?: string
          username?: string | null
          x_handle?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_username_availability: {
        Args: { username_to_check: string }
        Returns: boolean
      }
      delete_user_account: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_email_by_username: {
        Args: { p_username: string }
        Returns: string
      }
    }
    Enums: {
      app_theme: "light" | "dark" | "system"
      email_verification_status: "pending" | "verified" | "expired"
      friendship_status: "pending" | "accepted" | "blocked"
      goal_status: "active" | "achieved" | "archived"
      goal_time_period: "daily" | "weekly" | "monthly" | "custom"
      goal_type: "time_allocation" | "task_completion" | "consistency"
      mood_rating: "great" | "good" | "okay" | "bad" | "awful"
      social_provider: "google" | "twitter" | "apple"
      task_priority: "low" | "medium" | "high"
      task_status: "todo" | "in_progress" | "completed"
      user_role: "user" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_theme: ["light", "dark", "system"],
      email_verification_status: ["pending", "verified", "expired"],
      friendship_status: ["pending", "accepted", "blocked"],
      goal_status: ["active", "achieved", "archived"],
      goal_time_period: ["daily", "weekly", "monthly", "custom"],
      goal_type: ["time_allocation", "task_completion", "consistency"],
      mood_rating: ["great", "good", "okay", "bad", "awful"],
      social_provider: ["google", "twitter", "apple"],
      task_priority: ["low", "medium", "high"],
      task_status: ["todo", "in_progress", "completed"],
      user_role: ["user", "admin"],
    },
  },
} as const
