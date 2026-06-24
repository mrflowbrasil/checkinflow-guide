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
      admin_action_log: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string
          id: string
          metadata: Json | null
          reason: string | null
          target_email: string | null
          target_user_id: string | null
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          reason?: string | null
          target_email?: string | null
          target_user_id?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          reason?: string | null
          target_email?: string | null
          target_user_id?: string | null
        }
        Relationships: []
      }
      content_blocks: {
        Row: {
          created_at: string
          data: Json
          id: string
          page_id: string
          position: number
          source: string
          type: Database["public"]["Enums"]["block_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          data?: Json
          id?: string
          page_id: string
          position?: number
          source?: string
          type: Database["public"]["Enums"]["block_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          page_id?: string
          position?: number
          source?: string
          type?: Database["public"]["Enums"]["block_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_blocks_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "property_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      first_property_reminders: {
        Row: {
          email_status: string | null
          sent_at: string
          user_id: string
          webhook_status: string | null
        }
        Insert: {
          email_status?: string | null
          sent_at?: string
          user_id: string
          webhook_status?: string | null
        }
        Update: {
          email_status?: string | null
          sent_at?: string
          user_id?: string
          webhook_status?: string | null
        }
        Relationships: []
      }
      guide_translations: {
        Row: {
          content_hash: string
          created_at: string
          id: string
          locale: string
          payload: Json
          property_id: string
          updated_at: string
        }
        Insert: {
          content_hash: string
          created_at?: string
          id?: string
          locale: string
          payload?: Json
          property_id: string
          updated_at?: string
        }
        Update: {
          content_hash?: string
          created_at?: string
          id?: string
          locale?: string
          payload?: Json
          property_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      integration_webhooks: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          provider: string
          updated_at: string
          webhook_url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          provider: string
          updated_at?: string
          webhook_url: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          provider?: string
          updated_at?: string
          webhook_url?: string
        }
        Relationships: []
      }
      invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          plan_code: string
          revoked_at: string | null
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          plan_code?: string
          revoked_at?: string | null
          token?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          plan_code?: string
          revoked_at?: string | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_plan_code_fkey"
            columns: ["plan_code"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["code"]
          },
        ]
      }
      onboarding_profiles: {
        Row: {
          completed_at: string
          created_at: string
          pms: string
          pms_other: string | null
          properties_count: string
          state: string
          tenant_id: string
          updated_at: string
          user_id: string
          whatsapp: string
        }
        Insert: {
          completed_at?: string
          created_at?: string
          pms: string
          pms_other?: string | null
          properties_count: string
          state: string
          tenant_id: string
          updated_at?: string
          user_id: string
          whatsapp: string
        }
        Update: {
          completed_at?: string
          created_at?: string
          pms?: string
          pms_other?: string | null
          properties_count?: string
          state?: string
          tenant_id?: string
          updated_at?: string
          user_id?: string
          whatsapp?: string
        }
        Relationships: []
      }
      pending_purchases: {
        Row: {
          billing_interval: string
          claimed_at: string | null
          claimed_by_user_id: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          email: string
          environment: string
          id: string
          plan_code: string
          price_id: string
          product_id: string | null
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at: string
        }
        Insert: {
          billing_interval?: string
          claimed_at?: string | null
          claimed_by_user_id?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          email: string
          environment?: string
          id?: string
          plan_code: string
          price_id: string
          product_id?: string | null
          status?: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at?: string
        }
        Update: {
          billing_interval?: string
          claimed_at?: string | null
          claimed_by_user_id?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          email?: string
          environment?: string
          id?: string
          plan_code?: string
          price_id?: string
          product_id?: string | null
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          address: string | null
          base_price: number | null
          booking_url: string | null
          city: string | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          external_data: Json | null
          external_id: string | null
          external_provider: string | null
          id: string
          max_guests: number | null
          name: string
          public_slug: string
          source: string
          status: Database["public"]["Enums"]["property_status"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          base_price?: number | null
          booking_url?: string | null
          city?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          external_data?: Json | null
          external_id?: string | null
          external_provider?: string | null
          id?: string
          max_guests?: number | null
          name: string
          public_slug: string
          source?: string
          status?: Database["public"]["Enums"]["property_status"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          base_price?: number | null
          booking_url?: string | null
          city?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          external_data?: Json | null
          external_id?: string | null
          external_provider?: string | null
          id?: string
          max_guests?: number | null
          name?: string
          public_slug?: string
          source?: string
          status?: Database["public"]["Enums"]["property_status"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "properties_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      property_details: {
        Row: {
          checkin_instructions: string | null
          checkin_time: string | null
          checkout_instructions: string | null
          checkout_time: string | null
          emergency_contacts: Json | null
          extras: Json | null
          latitude: number | null
          lock_code: string | null
          longitude: number | null
          parking: string | null
          property_id: string
          rules: string | null
          trash: string | null
          updated_at: string
          wifi_password: string | null
          wifi_ssid: string | null
        }
        Insert: {
          checkin_instructions?: string | null
          checkin_time?: string | null
          checkout_instructions?: string | null
          checkout_time?: string | null
          emergency_contacts?: Json | null
          extras?: Json | null
          latitude?: number | null
          lock_code?: string | null
          longitude?: number | null
          parking?: string | null
          property_id: string
          rules?: string | null
          trash?: string | null
          updated_at?: string
          wifi_password?: string | null
          wifi_ssid?: string | null
        }
        Update: {
          checkin_instructions?: string | null
          checkin_time?: string | null
          checkout_instructions?: string | null
          checkout_time?: string | null
          emergency_contacts?: Json | null
          extras?: Json | null
          latitude?: number | null
          lock_code?: string | null
          longitude?: number | null
          parking?: string | null
          property_id?: string
          rules?: string | null
          trash?: string | null
          updated_at?: string
          wifi_password?: string | null
          wifi_ssid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_details_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: true
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_images: {
        Row: {
          created_at: string
          id: string
          position: number
          property_id: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          position?: number
          property_id: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          position?: number
          property_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_images_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_pages: {
        Row: {
          created_at: string
          icon: string
          id: string
          is_enabled: boolean
          page_key: string
          position: number
          property_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          icon: string
          id?: string
          is_enabled?: boolean
          page_key: string
          position?: number
          property_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          icon?: string
          id?: string
          is_enabled?: boolean
          page_key?: string
          position?: number
          property_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_pages_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_slug_history: {
        Row: {
          property_id: string
          rotated_at: string
          slug: string
        }
        Insert: {
          property_id: string
          rotated_at?: string
          slug: string
        }
        Update: {
          property_id?: string
          rotated_at?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_slug_history_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          code: string
          created_at: string
          description: string | null
          is_active: boolean
          name: string
          position: number
          price_cents: number
          price_yearly_cents: number
          property_limit: number
          stripe_price_id: string | null
          stripe_price_id_monthly: string | null
          stripe_price_id_yearly: string | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          is_active?: boolean
          name: string
          position?: number
          price_cents?: number
          price_yearly_cents?: number
          property_limit: number
          stripe_price_id?: string | null
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          is_active?: boolean
          name?: string
          position?: number
          price_cents?: number
          price_yearly_cents?: number
          property_limit?: number
          stripe_price_id?: string | null
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          billing_interval: string
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          plan_code: string
          price_id: string
          product_id: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_interval?: string
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          plan_code: string
          price_id: string
          product_id: string
          status?: string
          stripe_customer_id: string
          stripe_subscription_id: string
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_interval?: string
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          plan_code?: string
          price_id?: string
          product_id?: string
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      tenant_api_keys: {
        Row: {
          created_at: string
          id: string
          key_ciphertext: string | null
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          revoked_at: string | null
          tenant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          key_ciphertext?: string | null
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name?: string
          revoked_at?: string | null
          tenant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          key_ciphertext?: string | null
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          revoked_at?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_api_keys_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_integrations: {
        Row: {
          created_at: string
          credentials_encrypted: string | null
          id: string
          last_error: string | null
          last_sync_at: string | null
          provider: string
          public_site_url: string | null
          status: string
          system_url: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          credentials_encrypted?: string | null
          id?: string
          last_error?: string | null
          last_sync_at?: string | null
          provider: string
          public_site_url?: string | null
          status?: string
          system_url?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          credentials_encrypted?: string | null
          id?: string
          last_error?: string | null
          last_sync_at?: string | null
          provider?: string
          public_site_url?: string | null
          status?: string
          system_url?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_integrations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          catalog_bio: string | null
          created_at: string
          facebook_url: string | null
          id: string
          instagram_url: string | null
          is_active: boolean
          logo_url: string | null
          name: string
          plan_code: string
          plan_expires_at: string | null
          plan_status: string
          primary_color: string
          secondary_color: string
          show_logo: boolean
          slug: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          support_whatsapp: string | null
          template: Database["public"]["Enums"]["tenant_template"]
          updated_at: string
        }
        Insert: {
          catalog_bio?: string | null
          created_at?: string
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          is_active?: boolean
          logo_url?: string | null
          name: string
          plan_code?: string
          plan_expires_at?: string | null
          plan_status?: string
          primary_color?: string
          secondary_color?: string
          show_logo?: boolean
          slug: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          support_whatsapp?: string | null
          template?: Database["public"]["Enums"]["tenant_template"]
          updated_at?: string
        }
        Update: {
          catalog_bio?: string | null
          created_at?: string
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          is_active?: boolean
          logo_url?: string | null
          name?: string
          plan_code?: string
          plan_expires_at?: string | null
          plan_status?: string
          primary_color?: string
          secondary_color?: string
          show_logo?: boolean
          slug?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          support_whatsapp?: string | null
          template?: Database["public"]["Enums"]["tenant_template"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenants_plan_code_fkey"
            columns: ["plan_code"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["code"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          tenant_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          tenant_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          tenant_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_tenant_id: { Args: never; Returns: string }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      find_valid_invitation: {
        Args: { _email: string }
        Returns: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          plan_code: string
          revoked_at: string | null
          token: string
        }
        SetofOptions: {
          from: "*"
          to: "invitations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_invitation_by_token: {
        Args: { _token: string }
        Returns: {
          accepted_at: string
          email: string
          expires_at: string
          id: string
          plan_code: string
          revoked_at: string
        }[]
      }
      get_launch_slots: { Args: never; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_property_active: { Args: { _property_id: string }; Returns: boolean }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      rotate_property_slug: { Args: { _property_id: string }; Returns: string }
      tenant_has_feature: {
        Args: { _feature: string; _tenant_id: string }
        Returns: boolean
      }
      tenant_property_count: { Args: { _tenant_id: string }; Returns: number }
      unaccent_safe: { Args: { input: string }; Returns: string }
    }
    Enums: {
      app_role: "super_admin" | "tenant_owner"
      block_type:
        | "text"
        | "subtitle"
        | "image"
        | "video"
        | "steps"
        | "tip"
        | "button"
        | "list"
        | "password"
        | "divider"
      property_status: "active" | "inactive"
      tenant_template:
        | "clean"
        | "dark"
        | "luxury"
        | "boho_fun"
        | "pop_vibes"
        | "arcade"
        | "jungle"
        | "serene_coast"
        | "coastal_boho"
        | "studio_minimal"
        | "aegean"
        | "surf"
        | "urban_oasis"
        | "modular"
        | "monochrome"
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
      app_role: ["super_admin", "tenant_owner"],
      block_type: [
        "text",
        "subtitle",
        "image",
        "video",
        "steps",
        "tip",
        "button",
        "list",
        "password",
        "divider",
      ],
      property_status: ["active", "inactive"],
      tenant_template: [
        "clean",
        "dark",
        "luxury",
        "boho_fun",
        "pop_vibes",
        "arcade",
        "jungle",
        "serene_coast",
        "coastal_boho",
        "studio_minimal",
        "aegean",
        "surf",
        "urban_oasis",
        "modular",
        "monochrome",
      ],
    },
  },
} as const
