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
      careers: {
        Row: {
          created_at: string
          degree_paths: string[] | null
          description: string | null
          difficulty: string | null
          future_scope: string | null
          id: string
          name: string
          salary_range: string | null
          skills: string[] | null
          streams: string[] | null
          tags: string[] | null
          why_fit_template: string | null
        }
        Insert: {
          created_at?: string
          degree_paths?: string[] | null
          description?: string | null
          difficulty?: string | null
          future_scope?: string | null
          id?: string
          name: string
          salary_range?: string | null
          skills?: string[] | null
          streams?: string[] | null
          tags?: string[] | null
          why_fit_template?: string | null
        }
        Update: {
          created_at?: string
          degree_paths?: string[] | null
          description?: string | null
          difficulty?: string | null
          future_scope?: string | null
          id?: string
          name?: string
          salary_range?: string | null
          skills?: string[] | null
          streams?: string[] | null
          tags?: string[] | null
          why_fit_template?: string | null
        }
        Relationships: []
      }
      colleges: {
        Row: {
          city: string | null
          courses: string[] | null
          created_at: string
          cutoff_min: number | null
          fees_max: number | null
          fees_min: number | null
          id: string
          name: string
          notes: string | null
          state: string | null
          streams: string[] | null
          tags: string[] | null
          type: string | null
        }
        Insert: {
          city?: string | null
          courses?: string[] | null
          created_at?: string
          cutoff_min?: number | null
          fees_max?: number | null
          fees_min?: number | null
          id?: string
          name: string
          notes?: string | null
          state?: string | null
          streams?: string[] | null
          tags?: string[] | null
          type?: string | null
        }
        Update: {
          city?: string | null
          courses?: string[] | null
          created_at?: string
          cutoff_min?: number | null
          fees_max?: number | null
          fees_min?: number | null
          id?: string
          name?: string
          notes?: string | null
          state?: string | null
          streams?: string[] | null
          tags?: string[] | null
          type?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          budget_max: number | null
          budget_min: number | null
          career_interests: string[] | null
          class: string | null
          college_type: string | null
          completed_onboarding: boolean
          created_at: string
          entrance_exams: Json | null
          extracurriculars: string | null
          gender: string | null
          id: string
          income_bracket: string | null
          marks_percent: number | null
          minority_category: string | null
          name: string | null
          preferred_location: string | null
          skills: string[] | null
          social_category: string | null
          state: string | null
          stream: string | null
          subjects: string[] | null
          updated_at: string
        }
        Insert: {
          budget_max?: number | null
          budget_min?: number | null
          career_interests?: string[] | null
          class?: string | null
          college_type?: string | null
          completed_onboarding?: boolean
          created_at?: string
          entrance_exams?: Json | null
          extracurriculars?: string | null
          gender?: string | null
          id: string
          income_bracket?: string | null
          marks_percent?: number | null
          minority_category?: string | null
          name?: string | null
          preferred_location?: string | null
          skills?: string[] | null
          social_category?: string | null
          state?: string | null
          stream?: string | null
          subjects?: string[] | null
          updated_at?: string
        }
        Update: {
          budget_max?: number | null
          budget_min?: number | null
          career_interests?: string[] | null
          class?: string | null
          college_type?: string | null
          completed_onboarding?: boolean
          created_at?: string
          entrance_exams?: Json | null
          extracurriculars?: string | null
          gender?: string | null
          id?: string
          income_bracket?: string | null
          marks_percent?: number | null
          minority_category?: string | null
          name?: string | null
          preferred_location?: string | null
          skills?: string[] | null
          social_category?: string | null
          state?: string | null
          stream?: string | null
          subjects?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          careers: Json
          colleges: Json
          generated_at: string
          id: string
          scholarships: Json
          user_id: string
        }
        Insert: {
          careers?: Json
          colleges?: Json
          generated_at?: string
          id?: string
          scholarships?: Json
          user_id: string
        }
        Update: {
          careers?: Json
          colleges?: Json
          generated_at?: string
          id?: string
          scholarships?: Json
          user_id?: string
        }
        Relationships: []
      }
      scholarships: {
        Row: {
          amount: string | null
          created_at: string
          deadline: string | null
          description: string | null
          eligibility_text: string | null
          gender: string | null
          id: string
          income_bracket: string | null
          link: string | null
          min_marks: number | null
          minority_category: string | null
          name: string
          state: string | null
          stream: string | null
          tags: string[] | null
        }
        Insert: {
          amount?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          eligibility_text?: string | null
          gender?: string | null
          id?: string
          income_bracket?: string | null
          link?: string | null
          min_marks?: number | null
          minority_category?: string | null
          name: string
          state?: string | null
          stream?: string | null
          tags?: string[] | null
        }
        Update: {
          amount?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          eligibility_text?: string | null
          gender?: string | null
          id?: string
          income_bracket?: string | null
          link?: string | null
          min_marks?: number | null
          minority_category?: string | null
          name?: string
          state?: string | null
          stream?: string | null
          tags?: string[] | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
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
