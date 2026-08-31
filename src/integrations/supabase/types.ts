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
      demand_flex_contacts: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      demand_flex_responses: {
        Row: {
          additional_information: string | null
          created_at: string
          current_program_participation: string | null
          electricity_provider: string | null
          id: string
          notification_interest: string | null
          resources: string[]
          respondent_type: string | null
          zip_code: string
        }
        Insert: {
          additional_information?: string | null
          created_at?: string
          current_program_participation?: string | null
          electricity_provider?: string | null
          id?: string
          notification_interest?: string | null
          resources?: string[]
          respondent_type?: string | null
          zip_code: string
        }
        Update: {
          additional_information?: string | null
          created_at?: string
          current_program_participation?: string | null
          electricity_provider?: string | null
          id?: string
          notification_interest?: string | null
          resources?: string[]
          respondent_type?: string | null
          zip_code?: string
        }
        Relationships: []
      }
      demand_flex_submissions: {
        Row: {
          additional_information: string | null
          asset_types: string[]
          consent_to_contact: boolean
          created_at: string
          customer_type: string | null
          electricity_provider: string | null
          email: string
          existing_program_participation: string | null
          id: string
          name: string
          notify_preference: string | null
          participant_type: string
          zip_code: string
        }
        Insert: {
          additional_information?: string | null
          asset_types?: string[]
          consent_to_contact?: boolean
          created_at?: string
          customer_type?: string | null
          electricity_provider?: string | null
          email: string
          existing_program_participation?: string | null
          id?: string
          name: string
          notify_preference?: string | null
          participant_type: string
          zip_code: string
        }
        Update: {
          additional_information?: string | null
          asset_types?: string[]
          consent_to_contact?: boolean
          created_at?: string
          customer_type?: string | null
          electricity_provider?: string | null
          email?: string
          existing_program_participation?: string | null
          id?: string
          name?: string
          notify_preference?: string | null
          participant_type?: string
          zip_code?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      utility_access_audit: {
        Row: {
          action: string
          actor_user_id: string | null
          connection_id: string | null
          created_at: string
          id: string
          occurred_at: string
          result: string
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          connection_id?: string | null
          created_at?: string
          id?: string
          occurred_at?: string
          result: string
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          connection_id?: string | null
          created_at?: string
          id?: string
          occurred_at?: string
          result?: string
        }
        Relationships: [
          {
            foreignKeyName: "utility_access_audit_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "utility_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      utility_authorizations: {
        Row: {
          authorization_ref: string | null
          connection_id: string
          created_at: string
          expires_at: string | null
          granted_at: string | null
          id: string
          revoked_at: string | null
          scope: string | null
          status: string
          updated_at: string
        }
        Insert: {
          authorization_ref?: string | null
          connection_id: string
          created_at?: string
          expires_at?: string | null
          granted_at?: string | null
          id?: string
          revoked_at?: string | null
          scope?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          authorization_ref?: string | null
          connection_id?: string
          created_at?: string
          expires_at?: string | null
          granted_at?: string | null
          id?: string
          revoked_at?: string | null
          scope?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "utility_authorizations_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "utility_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      utility_connections: {
        Row: {
          authorization_status: string
          authorized_at: string | null
          connection_status: string
          created_at: string
          customer_ref: string
          id: string
          last_sync_at: string | null
          last_sync_status: string | null
          service_agreement_ref: string | null
          subscription_ref: string | null
          updated_at: string
          user_id: string
          utility: string
        }
        Insert: {
          authorization_status?: string
          authorized_at?: string | null
          connection_status?: string
          created_at?: string
          customer_ref: string
          id?: string
          last_sync_at?: string | null
          last_sync_status?: string | null
          service_agreement_ref?: string | null
          subscription_ref?: string | null
          updated_at?: string
          user_id: string
          utility?: string
        }
        Update: {
          authorization_status?: string
          authorized_at?: string | null
          connection_status?: string
          created_at?: string
          customer_ref?: string
          id?: string
          last_sync_at?: string | null
          last_sync_status?: string | null
          service_agreement_ref?: string | null
          subscription_ref?: string | null
          updated_at?: string
          user_id?: string
          utility?: string
        }
        Relationships: []
      }
      utility_data_metadata: {
        Row: {
          connection_id: string
          created_at: string
          id: string
          period_end: string | null
          period_start: string | null
          processing_status: string
          record_count: number
          updated_at: string
          verification_status: string
        }
        Insert: {
          connection_id: string
          created_at?: string
          id?: string
          period_end?: string | null
          period_start?: string | null
          processing_status?: string
          record_count?: number
          updated_at?: string
          verification_status?: string
        }
        Update: {
          connection_id?: string
          created_at?: string
          id?: string
          period_end?: string | null
          period_start?: string | null
          processing_status?: string
          record_count?: number
          updated_at?: string
          verification_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "utility_data_metadata_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "utility_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      utility_oauth_states: {
        Row: {
          code_verifier: string | null
          consumed_at: string | null
          created_at: string
          expires_at: string
          id: string
          state: string
          user_id: string
        }
        Insert: {
          code_verifier?: string | null
          consumed_at?: string | null
          created_at?: string
          expires_at: string
          id?: string
          state: string
          user_id: string
        }
        Update: {
          code_verifier?: string | null
          consumed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          state?: string
          user_id?: string
        }
        Relationships: []
      }
      utility_oauth_tokens: {
        Row: {
          access_token_encrypted: string
          connection_id: string
          created_at: string
          id: string
          refresh_token_encrypted: string | null
          token_expires_at: string | null
          updated_at: string
        }
        Insert: {
          access_token_encrypted: string
          connection_id: string
          created_at?: string
          id?: string
          refresh_token_encrypted?: string | null
          token_expires_at?: string | null
          updated_at?: string
        }
        Update: {
          access_token_encrypted?: string
          connection_id?: string
          created_at?: string
          id?: string
          refresh_token_encrypted?: string | null
          token_expires_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "utility_oauth_tokens_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: true
            referencedRelation: "utility_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      utility_sync_events: {
        Row: {
          connection_id: string
          created_at: string
          error_category: string | null
          id: string
          occurred_at: string
          record_count: number | null
          status: string
        }
        Insert: {
          connection_id: string
          created_at?: string
          error_category?: string | null
          id?: string
          occurred_at?: string
          record_count?: number | null
          status: string
        }
        Update: {
          connection_id?: string
          created_at?: string
          error_category?: string | null
          id?: string
          occurred_at?: string
          record_count?: number | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "utility_sync_events_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "utility_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      utility_usage_intervals: {
        Row: {
          connection_id: string
          created_at: string
          id: string
          interval_duration_seconds: number
          interval_start: string
          quality: string | null
          usage_point_ref: string | null
          value_wh: number
        }
        Insert: {
          connection_id: string
          created_at?: string
          id?: string
          interval_duration_seconds: number
          interval_start: string
          quality?: string | null
          usage_point_ref?: string | null
          value_wh: number
        }
        Update: {
          connection_id?: string
          created_at?: string
          id?: string
          interval_duration_seconds?: number
          interval_start?: string
          quality?: string | null
          usage_point_ref?: string | null
          value_wh?: number
        }
        Relationships: [
          {
            foreignKeyName: "utility_usage_intervals_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "utility_connections"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "utility_data_viewer" | "customer"
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
    Enums: {
      app_role: ["admin", "utility_data_viewer", "customer"],
    },
  },
} as const
