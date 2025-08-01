export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ai_conversations: {
        Row: {
          created_at: string | null
          id: string
          model_id: string | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          model_id?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          model_id?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversations_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "ai_models"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_generations: {
        Row: {
          created_at: string | null
          credits_consumed: number | null
          height: number | null
          id: string
          image_url: string | null
          model_used: string | null
          prompt: string
          seed: string | null
          status: string | null
          translated_prompt: string | null
          user_id: string | null
          width: number | null
        }
        Insert: {
          created_at?: string | null
          credits_consumed?: number | null
          height?: number | null
          id?: string
          image_url?: string | null
          model_used?: string | null
          prompt: string
          seed?: string | null
          status?: string | null
          translated_prompt?: string | null
          user_id?: string | null
          width?: number | null
        }
        Update: {
          created_at?: string | null
          credits_consumed?: number | null
          height?: number | null
          id?: string
          image_url?: string | null
          model_used?: string | null
          prompt?: string
          seed?: string | null
          status?: string | null
          translated_prompt?: string | null
          user_id?: string | null
          width?: number | null
        }
        Relationships: []
      }
      ai_messages: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string | null
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_models: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          max_tokens: number | null
          model_id: string
          name: string
          provider: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_tokens?: number | null
          model_id: string
          name: string
          provider: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_tokens?: number | null
          model_id?: string
          name?: string
          provider?: string
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          order_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          order_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          order_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_assets: {
        Row: {
          asset_type: string
          content_source: string | null
          created_at: string | null
          description: string | null
          id: string
          pain_points: Json | null
          priority_score: number | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          asset_type: string
          content_source?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          pain_points?: Json | null
          priority_score?: number | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          asset_type?: string
          content_source?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          pain_points?: Json | null
          priority_score?: number | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      generated_images: {
        Row: {
          aspect_ratio: string | null
          created_at: string | null
          id: string
          image_url: string
          model: string | null
          negative_prompt: string | null
          prompt: string
          seed: number | null
          user_id: string
        }
        Insert: {
          aspect_ratio?: string | null
          created_at?: string | null
          id?: string
          image_url: string
          model?: string | null
          negative_prompt?: string | null
          prompt: string
          seed?: number | null
          user_id: string
        }
        Update: {
          aspect_ratio?: string | null
          created_at?: string | null
          id?: string
          image_url?: string
          model?: string | null
          negative_prompt?: string | null
          prompt?: string
          seed?: number | null
          user_id?: string
        }
        Relationships: []
      }
      membership_plans: {
        Row: {
          created_at: string | null
          description: string | null
          duration_days: number | null
          duration_months: number | null
          features: Json | null
          id: string
          is_active: boolean | null
          name: string
          price: number
          type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_days?: number | null
          duration_months?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          price: number
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_days?: number | null
          duration_months?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount: number
          commission_processed: boolean | null
          created_at: string | null
          id: string
          order_number: string | null
          order_type: string | null
          payment_id: string | null
          payment_method: string | null
          product_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          commission_processed?: boolean | null
          created_at?: string | null
          id?: string
          order_number?: string | null
          order_type?: string | null
          payment_id?: string | null
          payment_method?: string | null
          product_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          commission_processed?: boolean | null
          created_at?: string | null
          id?: string
          order_number?: string | null
          order_type?: string | null
          payment_id?: string | null
          payment_method?: string | null
          product_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "membership_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_configs: {
        Row: {
          created_at: string | null
          id: string
          is_sandbox: boolean | null
          mapay_api_url: string | null
          mapay_key: string
          mapay_pid: string
          notify_url: string
          return_url: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_sandbox?: boolean | null
          mapay_api_url?: string | null
          mapay_key?: string
          mapay_pid?: string
          notify_url: string
          return_url: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_sandbox?: boolean | null
          mapay_api_url?: string | null
          mapay_key?: string
          mapay_pid?: string
          notify_url?: string
          return_url?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      payment_orders: {
        Row: {
          agent_id: string
          agent_name: string
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          out_trade_no: string | null
          payment_method: string | null
          status: string | null
          trade_no: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          agent_id: string
          agent_name: string
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          out_trade_no?: string | null
          payment_method?: string | null
          status?: string | null
          trade_no?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          agent_id?: string
          agent_name?: string
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          out_trade_no?: string | null
          payment_method?: string | null
          status?: string | null
          trade_no?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      priority_matrix: {
        Row: {
          asset_id: string | null
          calculated_priority: number | null
          created_at: string | null
          demand_intensity: number
          development_cost: number
          id: string
          urgency_level: number
        }
        Insert: {
          asset_id?: string | null
          calculated_priority?: number | null
          created_at?: string | null
          demand_intensity: number
          development_cost: number
          id?: string
          urgency_level: number
        }
        Update: {
          asset_id?: string | null
          calculated_priority?: number | null
          created_at?: string | null
          demand_intensity?: number
          development_cost?: number
          id?: string
          urgency_level?: number
        }
        Relationships: [
          {
            foreignKeyName: "priority_matrix_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "digital_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          height: number | null
          id: string
          image_url: string | null
          model_used: string | null
          price: number
          prompt: string | null
          seed: string | null
          status: string | null
          title: string
          updated_at: string | null
          width: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          height?: number | null
          id?: string
          image_url?: string | null
          model_used?: string | null
          price?: number
          prompt?: string | null
          seed?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          width?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          height?: number | null
          id?: string
          image_url?: string | null
          model_used?: string | null
          price?: number
          prompt?: string | null
          seed?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          width?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          agent_code: string | null
          balance: number | null
          commission_rate: number | null
          created_at: string | null
          email: string | null
          id: string
          membership_expires_at: string | null
          membership_type: string | null
          referrer_id: string | null
          role: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          agent_code?: string | null
          balance?: number | null
          commission_rate?: number | null
          created_at?: string | null
          email?: string | null
          id: string
          membership_expires_at?: string | null
          membership_type?: string | null
          referrer_id?: string | null
          role?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          agent_code?: string | null
          balance?: number | null
          commission_rate?: number | null
          created_at?: string | null
          email?: string | null
          id?: string
          membership_expires_at?: string | null
          membership_type?: string | null
          referrer_id?: string | null
          role?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      redirect_links: {
        Row: {
          click_count: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_paid: boolean | null
          original_url: string
          price: number | null
          short_code: string
          title: string
          updated_at: string | null
        }
        Insert: {
          click_count?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_paid?: boolean | null
          original_url: string
          price?: number | null
          short_code: string
          title: string
          updated_at?: string | null
        }
        Update: {
          click_count?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_paid?: boolean | null
          original_url?: string
          price?: number | null
          short_code?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          setting_type: string
          settings: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          setting_type: string
          settings?: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          setting_type?: string
          settings?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          created_at: string | null
          credits: number | null
          free_trials_used: number | null
          id: string
          total_spent: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credits?: number | null
          free_trials_used?: number | null
          id?: string
          total_spent?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          credits?: number | null
          free_trials_used?: number | null
          id?: string
          total_spent?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      activate_membership: {
        Args: { p_user_id: string; p_plan_id: string; p_order_id?: string }
        Returns: undefined
      }
      add_credits: {
        Args: { user_uuid: string; credit_amount: number; order_uuid?: string }
        Returns: undefined
      }
      consume_credits: {
        Args: {
          user_uuid: string
          credit_amount: number
          description_text?: string
        }
        Returns: boolean
      }
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
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
