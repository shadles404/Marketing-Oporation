export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15";
  };
  public: {
    Tables: {
      billboards: {
        Row: {
          city: string | null;
          created_at: string;
          end_date: string | null;
          id: string;
          location: string;
          monthly_rate: number;
          name: string;
          notes: string | null;
          size: string | null;
          start_date: string | null;
          status: string;
          updated_at: string;
          vendor: string | null;
        };
        Insert: {
          city?: string | null;
          created_at?: string;
          end_date?: string | null;
          id?: string;
          location: string;
          monthly_rate?: number;
          name: string;
          notes?: string | null;
          size?: string | null;
          start_date?: string | null;
          status?: string;
          updated_at?: string;
          vendor?: string | null;
        };
        Update: {
          city?: string | null;
          created_at?: string;
          end_date?: string | null;
          id?: string;
          location?: string;
          monthly_rate?: number;
          name?: string;
          notes?: string | null;
          size?: string | null;
          start_date?: string | null;
          status?: string;
          updated_at?: string;
          vendor?: string | null;
        };
        Relationships: [];
      };
      budgets: {
        Row: {
          allocated: number;
          category: string | null;
          created_at: string;
          currency: string;
          id: string;
          name: string;
          notes: string | null;
          period: string;
          scope: string;
          updated_at: string;
        };
        Insert: {
          allocated?: number;
          category?: string | null;
          created_at?: string;
          currency?: string;
          id?: string;
          name: string;
          notes?: string | null;
          period?: string;
          scope?: string;
          updated_at?: string;
        };
        Update: {
          allocated?: number;
          category?: string | null;
          created_at?: string;
          currency?: string;
          id?: string;
          name?: string;
          notes?: string | null;
          period?: string;
          scope?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      expenses: {
        Row: {
          amount: number;
          budget_id: string | null;
          category: string | null;
          created_at: string;
          description: string;
          expense_date: string;
          id: string;
          updated_at: string;
          vendor: string | null;
        };
        Insert: {
          amount?: number;
          budget_id?: string | null;
          category?: string | null;
          created_at?: string;
          description: string;
          expense_date?: string;
          id?: string;
          updated_at?: string;
          vendor?: string | null;
        };
        Update: {
          amount?: number;
          budget_id?: string | null;
          category?: string | null;
          created_at?: string;
          description?: string;
          expense_date?: string;
          id?: string;
          updated_at?: string;
          vendor?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "expenses_budget_id_fkey";
            columns: ["budget_id"];
            isOneToOne: false;
            referencedRelation: "budgets";
            referencedColumns: ["id"];
          },
        ];
      };
      influencer_deliveries: {
        Row: {
          content_type: string;
          content_url: string | null;
          created_at: string;
          delivery_date: string;
          engagement: number;
          id: string;
          influencer_id: string;
          status: string;
          title: string | null;
          updated_at: string;
          views: number;
        };
        Insert: {
          content_type?: string;
          content_url?: string | null;
          created_at?: string;
          delivery_date?: string;
          engagement?: number;
          id?: string;
          influencer_id: string;
          status?: string;
          title?: string | null;
          updated_at?: string;
          views?: number;
        };
        Update: {
          content_type?: string;
          content_url?: string | null;
          created_at?: string;
          delivery_date?: string;
          engagement?: number;
          id?: string;
          influencer_id?: string;
          status?: string;
          title?: string | null;
          updated_at?: string;
          views?: number;
        };
        Relationships: [
          {
            foreignKeyName: "influencer_deliveries_influencer_id_fkey";
            columns: ["influencer_id"];
            isOneToOne: false;
            referencedRelation: "influencers";
            referencedColumns: ["id"];
          },
        ];
      };
      influencer_targets: {
        Row: {
          achieved_posts: number;
          achieved_reach: number;
          created_at: string;
          id: string;
          influencer_id: string;
          period: string;
          target_posts: number;
          target_reach: number;
          updated_at: string;
        };
        Insert: {
          achieved_posts?: number;
          achieved_reach?: number;
          created_at?: string;
          id?: string;
          influencer_id: string;
          period: string;
          target_posts?: number;
          target_reach?: number;
          updated_at?: string;
        };
        Update: {
          achieved_posts?: number;
          achieved_reach?: number;
          created_at?: string;
          id?: string;
          influencer_id?: string;
          period?: string;
          target_posts?: number;
          target_reach?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "influencer_targets_influencer_id_fkey";
            columns: ["influencer_id"];
            isOneToOne: false;
            referencedRelation: "influencers";
            referencedColumns: ["id"];
          },
        ];
      };
      influencers: {
        Row: {
          agreement_end: string | null;
          agreement_start: string | null;
          category: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          country: string | null;
          created_at: string;
          followers: number;
          handle: string | null;
          id: string;
          name: string;
          notes: string | null;
          platform: string;
          rate: number;
          status: string;
          target_videos_month: number;
          updated_at: string;
        };
        Insert: {
          agreement_end?: string | null;
          agreement_start?: string | null;
          category?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          country?: string | null;
          created_at?: string;
          followers?: number;
          handle?: string | null;
          id?: string;
          name: string;
          notes?: string | null;
          platform?: string;
          rate?: number;
          status?: string;
          target_videos_month?: number;
          updated_at?: string;
        };
        Update: {
          agreement_end?: string | null;
          agreement_start?: string | null;
          category?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          country?: string | null;
          created_at?: string;
          followers?: number;
          handle?: string | null;
          id?: string;
          name?: string;
          notes?: string | null;
          platform?: string;
          rate?: number;
          status?: string;
          target_videos_month?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      lcd_screens: {
        Row: {
          city: string | null;
          created_at: string;
          end_date: string | null;
          id: string;
          location: string;
          monthly_rate: number;
          name: string;
          resolution: string | null;
          slot_seconds: number;
          start_date: string | null;
          status: string;
          updated_at: string;
          vendor: string | null;
        };
        Insert: {
          city?: string | null;
          created_at?: string;
          end_date?: string | null;
          id?: string;
          location: string;
          monthly_rate?: number;
          name: string;
          resolution?: string | null;
          slot_seconds?: number;
          start_date?: string | null;
          status?: string;
          updated_at?: string;
          vendor?: string | null;
        };
        Update: {
          city?: string | null;
          created_at?: string;
          end_date?: string | null;
          id?: string;
          location?: string;
          monthly_rate?: number;
          name?: string;
          resolution?: string | null;
          slot_seconds?: number;
          start_date?: string | null;
          status?: string;
          updated_at?: string;
          vendor?: string | null;
        };
        Relationships: [];
      };
      lcd_videos: {
        Row: {
          created_at: string;
          daily_plays: number;
          duration_seconds: number;
          end_date: string | null;
          id: string;
          screen_id: string;
          start_date: string | null;
          status: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          daily_plays?: number;
          duration_seconds?: number;
          end_date?: string | null;
          id?: string;
          screen_id: string;
          start_date?: string | null;
          status?: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          daily_plays?: number;
          duration_seconds?: number;
          end_date?: string | null;
          id?: string;
          screen_id?: string;
          start_date?: string | null;
          status?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lcd_videos_screen_id_fkey";
            columns: ["screen_id"];
            isOneToOne: false;
            referencedRelation: "lcd_screens";
            referencedColumns: ["id"];
          },
        ];
      };
      payments: {
        Row: {
          amount: number;
          billboard_id: string | null;
          category: string;
          created_at: string;
          currency: string;
          due_date: string | null;
          id: string;
          influencer_id: string | null;
          invoice_number: string | null;
          method: string | null;
          notes: string | null;
          paid_date: string | null;
          payee: string;
          screen_id: string | null;
          status: string;
          updated_at: string;
        };
        Insert: {
          amount?: number;
          billboard_id?: string | null;
          category?: string;
          created_at?: string;
          currency?: string;
          due_date?: string | null;
          id?: string;
          influencer_id?: string | null;
          invoice_number?: string | null;
          method?: string | null;
          notes?: string | null;
          paid_date?: string | null;
          payee: string;
          screen_id?: string | null;
          status?: string;
          updated_at?: string;
        };
        Update: {
          amount?: number;
          billboard_id?: string | null;
          category?: string;
          created_at?: string;
          currency?: string;
          due_date?: string | null;
          id?: string;
          influencer_id?: string | null;
          invoice_number?: string | null;
          method?: string | null;
          notes?: string | null;
          paid_date?: string | null;
          payee?: string;
          screen_id?: string | null;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payments_billboard_id_fkey";
            columns: ["billboard_id"];
            isOneToOne: false;
            referencedRelation: "billboards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_influencer_id_fkey";
            columns: ["influencer_id"];
            isOneToOne: false;
            referencedRelation: "influencers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_screen_id_fkey";
            columns: ["screen_id"];
            isOneToOne: false;
            referencedRelation: "lcd_screens";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string | null;
          full_name: string | null;
          id: string;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id: string;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
