export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_versions: {
        Row: {
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          label: string | null
          snapshot: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          label?: string | null
          snapshot: Json
          user_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          label?: string | null
          snapshot?: Json
          user_id?: string
        }
        Relationships: []
      }
      coach_conversations: {
        Row: {
          created_at: string
          id: string
          messages: Json
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          messages?: Json
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          messages?: Json
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      interview_sessions: {
        Row: {
          company: string | null
          completed_at: string | null
          created_at: string
          difficulty: string
          id: string
          interview_type: string
          interviewer_style: string
          jd_analysis: Json | null
          job_description: string | null
          job_title: string
          overall_score: number | null
          questions: Json
          readiness_level: string | null
          report: Json | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company?: string | null
          completed_at?: string | null
          created_at?: string
          difficulty?: string
          id?: string
          interview_type?: string
          interviewer_style?: string
          jd_analysis?: Json | null
          job_description?: string | null
          job_title: string
          overall_score?: number | null
          questions?: Json
          readiness_level?: string | null
          report?: Json | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company?: string | null
          completed_at?: string | null
          created_at?: string
          difficulty?: string
          id?: string
          interview_type?: string
          interviewer_style?: string
          jd_analysis?: Json | null
          job_description?: string | null
          job_title?: string
          overall_score?: number | null
          questions?: Json
          readiness_level?: string | null
          report?: Json | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          current_position: string | null
          email: string | null
          full_name: string | null
          id: string
          last_practice_date: string | null
          resume_file_name: string | null
          resume_text: string | null
          streak: number
          target_company: string | null
          target_role: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          current_position?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          last_practice_date?: string | null
          resume_file_name?: string | null
          resume_text?: string | null
          streak?: number
          target_company?: string | null
          target_role?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          current_position?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          last_practice_date?: string | null
          resume_file_name?: string | null
          resume_text?: string | null
          streak?: number
          target_company?: string | null
          target_role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      resumes: {
        Row: {
          analysis: Json | null
          content: string
          created_at: string
          file_name: string | null
          id: string
          job_description: string | null
          match_score: number | null
          user_id: string
        }
        Insert: {
          analysis?: Json | null
          content: string
          created_at?: string
          file_name?: string | null
          id?: string
          job_description?: string | null
          match_score?: number | null
          user_id: string
        }
        Update: {
          analysis?: Json | null
          content?: string
          created_at?: string
          file_name?: string | null
          id?: string
          job_description?: string | null
          match_score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      roadmaps: {
        Row: {
          created_at: string
          current_position: string | null
          id: string
          plan: Json | null
          progress: Json
          target_company: string | null
          target_role: string
          timeline: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_position?: string | null
          id?: string
          plan?: Json | null
          progress?: Json
          target_company?: string | null
          target_role: string
          timeline?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_position?: string | null
          id?: string
          plan?: Json | null
          progress?: Json
          target_company?: string | null
          target_role?: string
          timeline?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      study_plans: {
        Row: {
          created_at: string
          id: string
          plan: Json | null
          session_id: string | null
          title: string | null
          topics: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          plan?: Json | null
          session_id?: string | null
          title?: string | null
          topics?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          plan?: Json | null
          session_id?: string | null
          title?: string | null
          topics?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_plans_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "interview_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      leaderboard: {
        Row: {
          avg_score: number | null
          best_score: number | null
          display_name: string | null
          interview_count: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
