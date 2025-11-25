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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      dashboard: {
        Row: {
          articles_this_week: number | null
          articles_today: number | null
          avg_sentiment_score: number | null
          business_count: number | null
          "citizen.digital": number | null
          "corofm.kbc.co.ke": number | null
          date: string
          gbv_count: number | null
          "ghafla.co.ke": number | null
          "habarinow.com": number | null
          "kenyans.co.ke": number | null
          "kiswahili.tuko.co.ke": number | null
          location_mentions: string[] | null
          "mpasho.co.ke": number | null
          "nairobileo.co.ke": number | null
          "nation.africa": number | null
          negative_count: number | null
          neutral_count: number | null
          organization_mentions: string[] | null
          other_count: number | null
          person_mentions: string[] | null
          politics_count: number | null
          positive_count: number | null
          "pressrelease.co.ke": number | null
          "pulselive.co.ke": number | null
          scams_count: number | null
          "standardmedia.co.ke": number | null
          "swahili.kbc.co.ke": number | null
          "the-star.co.ke": number | null
          total_articles: number | null
          "tuko.co.ke": number | null
          updated_at: string | null
        }
        Insert: {
          articles_this_week?: number | null
          articles_today?: number | null
          avg_sentiment_score?: number | null
          business_count?: number | null
          "citizen.digital"?: number | null
          "corofm.kbc.co.ke"?: number | null
          date: string
          gbv_count?: number | null
          "ghafla.co.ke"?: number | null
          "habarinow.com"?: number | null
          "kenyans.co.ke"?: number | null
          "kiswahili.tuko.co.ke"?: number | null
          location_mentions?: string[] | null
          "mpasho.co.ke"?: number | null
          "nairobileo.co.ke"?: number | null
          "nation.africa"?: number | null
          negative_count?: number | null
          neutral_count?: number | null
          organization_mentions?: string[] | null
          other_count?: number | null
          person_mentions?: string[] | null
          politics_count?: number | null
          positive_count?: number | null
          "pressrelease.co.ke"?: number | null
          "pulselive.co.ke"?: number | null
          scams_count?: number | null
          "standardmedia.co.ke"?: number | null
          "swahili.kbc.co.ke"?: number | null
          "the-star.co.ke"?: number | null
          total_articles?: number | null
          "tuko.co.ke"?: number | null
          updated_at?: string | null
        }
        Update: {
          articles_this_week?: number | null
          articles_today?: number | null
          avg_sentiment_score?: number | null
          business_count?: number | null
          "citizen.digital"?: number | null
          "corofm.kbc.co.ke"?: number | null
          date?: string
          gbv_count?: number | null
          "ghafla.co.ke"?: number | null
          "habarinow.com"?: number | null
          "kenyans.co.ke"?: number | null
          "kiswahili.tuko.co.ke"?: number | null
          location_mentions?: string[] | null
          "mpasho.co.ke"?: number | null
          "nairobileo.co.ke"?: number | null
          "nation.africa"?: number | null
          negative_count?: number | null
          neutral_count?: number | null
          organization_mentions?: string[] | null
          other_count?: number | null
          person_mentions?: string[] | null
          politics_count?: number | null
          positive_count?: number | null
          "pressrelease.co.ke"?: number | null
          "pulselive.co.ke"?: number | null
          scams_count?: number | null
          "standardmedia.co.ke"?: number | null
          "swahili.kbc.co.ke"?: number | null
          "the-star.co.ke"?: number | null
          total_articles?: number | null
          "tuko.co.ke"?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      scraped_articles: {
        Row: {
          article_url: string
          created_at: string | null
          entities: string | null
          full_text: string | null
          id: number
          keyword_category: string | null
          publish_date: string | null
          sentiment: string | null
          sentiment_score: number | null
          site_url: string
          summary_snippet: string | null
          title: string
        }
        Insert: {
          article_url: string
          created_at?: string | null
          entities?: string | null
          full_text?: string | null
          id?: number
          keyword_category?: string | null
          publish_date?: string | null
          sentiment?: string | null
          sentiment_score?: number | null
          site_url: string
          summary_snippet?: string | null
          title: string
        }
        Update: {
          article_url?: string
          created_at?: string | null
          entities?: string | null
          full_text?: string | null
          id?: number
          keyword_category?: string | null
          publish_date?: string | null
          sentiment?: string | null
          sentiment_score?: number | null
          site_url?: string
          summary_snippet?: string | null
          title?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      refresh_dashboard_for_date: {
        Args: { target_date?: string }
        Returns: undefined
      }
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
