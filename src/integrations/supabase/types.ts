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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          description: string | null
          image: string
          is_active: boolean
          item_count: number | null
          name: string
          name_en: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          image: string
          is_active?: boolean
          item_count?: number | null
          name: string
          name_en: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          image?: string
          is_active?: boolean
          item_count?: number | null
          name?: string
          name_en?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          city: string | null
          company: string | null
          cr_number: string | null
          created_at: string
          credit_limit: number | null
          district: string | null
          email: string | null
          id: string
          name: string
          phone: string
          tier: string
          updated_at: string
          vat_number: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          company?: string | null
          cr_number?: string | null
          created_at?: string
          credit_limit?: number | null
          district?: string | null
          email?: string | null
          id?: string
          name: string
          phone: string
          tier?: string
          updated_at?: string
          vat_number?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          company?: string | null
          cr_number?: string | null
          created_at?: string
          credit_limit?: number | null
          district?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string
          tier?: string
          updated_at?: string
          vat_number?: string | null
        }
        Relationships: []
      }
      contact_inquiries: {
        Row: {
          created_at: string
          email: string | null
          id: string
          message: string
          name: string
          phone: string
          status: string
          subject: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          message: string
          name: string
          phone: string
          status?: string
          subject: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          message?: string
          name?: string
          phone?: string
          status?: string
          subject?: string
        }
        Relationships: []
      }
      courier_telemetry: {
        Row: {
          courier_id: string | null
          humidity_pct: number | null
          id: string
          latitude: number
          longitude: number
          recorded_at: string
          speed_kmh: number | null
          temperature_celsius: number
        }
        Insert: {
          courier_id?: string | null
          humidity_pct?: number | null
          id?: string
          latitude: number
          longitude: number
          recorded_at?: string
          speed_kmh?: number | null
          temperature_celsius?: number
        }
        Update: {
          courier_id?: string | null
          humidity_pct?: number | null
          id?: string
          latitude?: number
          longitude?: number
          recorded_at?: string
          speed_kmh?: number | null
          temperature_celsius?: number
        }
        Relationships: [
          {
            foreignKeyName: "courier_telemetry_courier_id_fkey"
            columns: ["courier_id"]
            isOneToOne: false
            referencedRelation: "couriers"
            referencedColumns: ["id"]
          },
        ]
      }
      couriers: {
        Row: {
          active: boolean
          city: string
          created_at: string
          id: string
          name: string
          phone: string
          temperature_celsius: number | null
          total_deliveries: number | null
          vehicle: string
        }
        Insert: {
          active?: boolean
          city: string
          created_at?: string
          id: string
          name: string
          phone: string
          temperature_celsius?: number | null
          total_deliveries?: number | null
          vehicle: string
        }
        Update: {
          active?: boolean
          city?: string
          created_at?: string
          id?: string
          name?: string
          phone?: string
          temperature_celsius?: number | null
          total_deliveries?: number | null
          vehicle?: string
        }
        Relationships: []
      }
      crm_deals: {
        Row: {
          business_type: string
          city: string
          company: string
          contact_person: string
          created_at: string
          deal_value: number
          id: string
          next_follow_up: string | null
          notes: string | null
          owner: string
          source: string
          stage: string
          updated_at: string
        }
        Insert: {
          business_type: string
          city: string
          company: string
          contact_person: string
          created_at?: string
          deal_value?: number
          id: string
          next_follow_up?: string | null
          notes?: string | null
          owner: string
          source: string
          stage?: string
          updated_at?: string
        }
        Update: {
          business_type?: string
          city?: string
          company?: string
          contact_person?: string
          created_at?: string
          deal_value?: number
          id?: string
          next_follow_up?: string | null
          notes?: string | null
          owner?: string
          source?: string
          stage?: string
          updated_at?: string
        }
        Relationships: []
      }
      delivery_tasks: {
        Row: {
          city: string
          courier_id: string | null
          created_at: string
          customer_name: string
          customer_phone: string
          delivery_date: string
          delivery_slot: string
          delivery_temp: number | null
          district: string
          failure_reason: string | null
          id: string
          instruction: string | null
          items: Json
          order_id: string | null
          priority: string
          recipient_name: string | null
          status: string
          street: string
          timeline: Json
          updated_at: string
        }
        Insert: {
          city: string
          courier_id?: string | null
          created_at?: string
          customer_name: string
          customer_phone: string
          delivery_date: string
          delivery_slot: string
          delivery_temp?: number | null
          district: string
          failure_reason?: string | null
          id: string
          instruction?: string | null
          items?: Json
          order_id?: string | null
          priority?: string
          recipient_name?: string | null
          status?: string
          street: string
          timeline?: Json
          updated_at?: string
        }
        Update: {
          city?: string
          courier_id?: string | null
          created_at?: string
          customer_name?: string
          customer_phone?: string
          delivery_date?: string
          delivery_slot?: string
          delivery_temp?: number | null
          district?: string
          failure_reason?: string | null
          id?: string
          instruction?: string | null
          items?: Json
          order_id?: string | null
          priority?: string
          recipient_name?: string | null
          status?: string
          street?: string
          timeline?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_tasks_courier_id_fkey"
            columns: ["courier_id"]
            isOneToOne: false
            referencedRelation: "couriers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_tasks_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_adjustments: {
        Row: {
          adjusted_by: string
          batch_id: string | null
          created_at: string
          id: string
          notes: string | null
          product_slug: string
          quantity_change: number
          reason: string
        }
        Insert: {
          adjusted_by?: string
          batch_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          product_slug: string
          quantity_change: number
          reason: string
        }
        Update: {
          adjusted_by?: string
          batch_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          product_slug?: string
          quantity_change?: number
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_adjustments_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "perishable_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          buyer_city: string
          buyer_district: string | null
          buyer_name: string
          buyer_phone: string
          buyer_vat_number: string | null
          created_at: string
          id: string
          invoice_number: string
          issue_date: string
          order_id: string | null
          pdf_url: string | null
          seller_commercial_register: string
          seller_name: string
          seller_vat_number: string
          subtotal_excluding_vat: number
          total_with_vat: number
          vat_amount: number
          zatca_hash: string | null
          zatca_invoice_uuid: string | null
          zatca_qr: string | null
          zatca_status: string
        }
        Insert: {
          buyer_city: string
          buyer_district?: string | null
          buyer_name: string
          buyer_phone: string
          buyer_vat_number?: string | null
          created_at?: string
          id?: string
          invoice_number: string
          issue_date?: string
          order_id?: string | null
          pdf_url?: string | null
          seller_commercial_register?: string
          seller_name?: string
          seller_vat_number?: string
          subtotal_excluding_vat: number
          total_with_vat: number
          vat_amount: number
          zatca_hash?: string | null
          zatca_invoice_uuid?: string | null
          zatca_qr?: string | null
          zatca_status?: string
        }
        Update: {
          buyer_city?: string
          buyer_district?: string | null
          buyer_name?: string
          buyer_phone?: string
          buyer_vat_number?: string | null
          created_at?: string
          id?: string
          invoice_number?: string
          issue_date?: string
          order_id?: string | null
          pdf_url?: string | null
          seller_commercial_register?: string
          seller_name?: string
          seller_vat_number?: string
          subtotal_excluding_vat?: number
          total_with_vat?: number
          vat_amount?: number
          zatca_hash?: string | null
          zatca_invoice_uuid?: string | null
          zatca_qr?: string | null
          zatca_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_templates: {
        Row: {
          email_body: string | null
          email_subject: string | null
          key: string
          sms_template: string | null
          title_ar: string
          updated_at: string
          whatsapp_template: string
        }
        Insert: {
          email_body?: string | null
          email_subject?: string | null
          key: string
          sms_template?: string | null
          title_ar: string
          updated_at?: string
          whatsapp_template: string
        }
        Update: {
          email_body?: string | null
          email_subject?: string | null
          key?: string
          sms_template?: string | null
          title_ar?: string
          updated_at?: string
          whatsapp_template?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          discount_amount: number
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          product_slug: string
          quantity: number
          sku: string
          total_price: number
          unit: string
          unit_price: number
          vat_amount: number
          vat_rate: number
        }
        Insert: {
          created_at?: string
          discount_amount?: number
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          product_slug: string
          quantity: number
          sku: string
          total_price?: number
          unit?: string
          unit_price?: number
          vat_amount?: number
          vat_rate?: number
        }
        Update: {
          created_at?: string
          discount_amount?: number
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          product_slug?: string
          quantity?: number
          sku?: string
          total_price?: number
          unit?: string
          unit_price?: number
          vat_amount?: number
          vat_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          city: string
          client_email: string | null
          client_name: string
          client_phone: string
          client_tier: string
          cold_chain_status: string
          created_at: string
          delivery_method: string
          delivery_slot: string
          district: string
          events: Json
          id: string
          items: Json
          notes: string | null
          payment_method: string
          status: string
          street: string
          subtotal: number
          tier_discount_savings: number
          total: number
          updated_at: string
          vat_amount: number
          whatsapp_notified: boolean
        }
        Insert: {
          city: string
          client_email?: string | null
          client_name: string
          client_phone: string
          client_tier?: string
          cold_chain_status?: string
          created_at?: string
          delivery_method: string
          delivery_slot: string
          district: string
          events?: Json
          id: string
          items?: Json
          notes?: string | null
          payment_method: string
          status?: string
          street: string
          subtotal?: number
          tier_discount_savings?: number
          total: number
          updated_at?: string
          vat_amount?: number
          whatsapp_notified?: boolean
        }
        Update: {
          city?: string
          client_email?: string | null
          client_name?: string
          client_phone?: string
          client_tier?: string
          cold_chain_status?: string
          created_at?: string
          delivery_method?: string
          delivery_slot?: string
          district?: string
          events?: Json
          id?: string
          items?: Json
          notes?: string | null
          payment_method?: string
          status?: string
          street?: string
          subtotal?: number
          tier_discount_savings?: number
          total?: number
          updated_at?: string
          vat_amount?: number
          whatsapp_notified?: boolean
        }
        Relationships: []
      }
      perishable_batches: {
        Row: {
          airway_bill: string
          arrival_date: string
          cold_storage_temp: string
          created_at: string
          expiry_date: string
          farm: string
          flight_number: string
          id: string
          on_hand_qty: number
          origin: string
          product_name: string
          product_slug: string
          reserved_qty: number
          sku: string
          status: string
          unit: string
          updated_at: string
          vase_life_days: number
        }
        Insert: {
          airway_bill: string
          arrival_date: string
          cold_storage_temp?: string
          created_at?: string
          expiry_date: string
          farm: string
          flight_number: string
          id: string
          on_hand_qty: number
          origin: string
          product_name: string
          product_slug: string
          reserved_qty?: number
          sku: string
          status?: string
          unit?: string
          updated_at?: string
          vase_life_days?: number
        }
        Update: {
          airway_bill?: string
          arrival_date?: string
          cold_storage_temp?: string
          created_at?: string
          expiry_date?: string
          farm?: string
          flight_number?: string
          id?: string
          on_hand_qty?: number
          origin?: string
          product_name?: string
          product_slug?: string
          reserved_qty?: number
          sku?: string
          status?: string
          unit?: string
          updated_at?: string
          vase_life_days?: number
        }
        Relationships: []
      }
      pricing_tiers: {
        Row: {
          benefits: Json | null
          discount_pct: number
          is_active: boolean
          label_ar: string
          label_en: string
          min_spend: number
          tier: string
        }
        Insert: {
          benefits?: Json | null
          discount_pct?: number
          is_active?: boolean
          label_ar: string
          label_en: string
          min_spend?: number
          tier: string
        }
        Update: {
          benefits?: Json | null
          discount_pct?: number
          is_active?: boolean
          label_ar?: string
          label_en?: string
          min_spend?: number
          tier?: string
        }
        Relationships: []
      }
      product_reviews: {
        Row: {
          client_name: string
          comment: string | null
          created_at: string
          id: string
          is_verified_florist: boolean
          product_slug: string
          rating: number
          vase_life_observed_days: number | null
        }
        Insert: {
          client_name: string
          comment?: string | null
          created_at?: string
          id?: string
          is_verified_florist?: boolean
          product_slug: string
          rating: number
          vase_life_observed_days?: number | null
        }
        Update: {
          client_name?: string
          comment?: string | null
          created_at?: string
          id?: string
          is_verified_florist?: boolean
          product_slug?: string
          rating?: number
          vase_life_observed_days?: number | null
        }
        Relationships: []
      }
      products: {
        Row: {
          available: boolean
          base_price: number
          bunches_per_carton: number | null
          category_slug: string
          color: string
          color_code: string | null
          created_at: string
          description: string | null
          grade: string
          id: string
          image: string | null
          moq: number
          name: string
          name_en: string
          origin: string
          sku: string
          slug: string
          stem_length: string | null
          stems_per_bunch: number | null
          storage_temp: string | null
          unit: string
        }
        Insert: {
          available?: boolean
          base_price?: number
          bunches_per_carton?: number | null
          category_slug: string
          color: string
          color_code?: string | null
          created_at?: string
          description?: string | null
          grade?: string
          id?: string
          image?: string | null
          moq?: number
          name: string
          name_en: string
          origin: string
          sku: string
          slug: string
          stem_length?: string | null
          stems_per_bunch?: number | null
          storage_temp?: string | null
          unit?: string
        }
        Update: {
          available?: boolean
          base_price?: number
          bunches_per_carton?: number | null
          category_slug?: string
          color?: string
          color_code?: string | null
          created_at?: string
          description?: string | null
          grade?: string
          id?: string
          image?: string | null
          moq?: number
          name?: string
          name_en?: string
          origin?: string
          sku?: string
          slug?: string
          stem_length?: string | null
          stems_per_bunch?: number | null
          storage_temp?: string | null
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_slug_fkey"
            columns: ["category_slug"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["slug"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          city: string | null
          commercial_register: string | null
          company_name: string | null
          created_at: string
          district: string | null
          email: string | null
          full_name: string
          id: string
          is_verified: boolean
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          tier: string
          updated_at: string
          vat_number: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          commercial_register?: string | null
          company_name?: string | null
          created_at?: string
          district?: string | null
          email?: string | null
          full_name?: string
          id: string
          is_verified?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          tier?: string
          updated_at?: string
          vat_number?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          commercial_register?: string | null
          company_name?: string | null
          created_at?: string
          district?: string | null
          email?: string | null
          full_name?: string
          id?: string
          is_verified?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          tier?: string
          updated_at?: string
          vat_number?: string | null
        }
        Relationships: []
      }
      quotations: {
        Row: {
          city: string
          client_email: string | null
          client_name: string
          client_phone: string
          company_name: string | null
          created_at: string
          discount_amount: number
          id: string
          items: Json
          notes: string | null
          status: string
          subtotal: number
          tier: string
          total: number
          updated_at: string
          valid_until: string | null
          vat_amount: number
        }
        Insert: {
          city: string
          client_email?: string | null
          client_name: string
          client_phone: string
          company_name?: string | null
          created_at?: string
          discount_amount?: number
          id: string
          items?: Json
          notes?: string | null
          status?: string
          subtotal?: number
          tier?: string
          total?: number
          updated_at?: string
          valid_until?: string | null
          vat_amount?: number
        }
        Update: {
          city?: string
          client_email?: string | null
          client_name?: string
          client_phone?: string
          company_name?: string | null
          created_at?: string
          discount_amount?: number
          id?: string
          items?: Json
          notes?: string | null
          status?: string
          subtotal?: number
          tier?: string
          total?: number
          updated_at?: string
          valid_until?: string | null
          vat_amount?: number
        }
        Relationships: []
      }
      security_logs: {
        Row: {
          actor_name: string
          created_at: string
          description: string
          details: Json | null
          event_type: string
          id: string
          ip_address: string | null
          severity: string
          tone: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          actor_name?: string
          created_at?: string
          description: string
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          severity?: string
          tone?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          actor_name?: string
          created_at?: string
          description?: string
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          severity?: string
          tone?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      stock_reservations: {
        Row: {
          batch_id: string | null
          expires_at: string
          id: string
          order_id: string
          product_slug: string
          quantity: number
          reserved_at: string
          status: string
        }
        Insert: {
          batch_id?: string | null
          expires_at?: string
          id?: string
          order_id: string
          product_slug: string
          quantity: number
          reserved_at?: string
          status?: string
        }
        Update: {
          batch_id?: string | null
          expires_at?: string
          id?: string
          order_id?: string
          product_slug?: string
          quantity?: number
          reserved_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_reservations_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "perishable_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      store_settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      supplier_farms: {
        Row: {
          active: boolean
          cold_chain_certified: boolean
          contact_person: string | null
          country: string
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          rating: number | null
          region: string
        }
        Insert: {
          active?: boolean
          cold_chain_certified?: boolean
          contact_person?: string | null
          country: string
          created_at?: string
          email?: string | null
          id: string
          name: string
          phone?: string | null
          rating?: number | null
          region: string
        }
        Update: {
          active?: boolean
          cold_chain_certified?: boolean
          contact_person?: string | null
          country?: string
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          rating?: number | null
          region?: string
        }
        Relationships: []
      }
      tickets: {
        Row: {
          category: string
          client_phone: string
          created_at: string
          id: string
          order_id: string | null
          replies: Json
          status: string
          subject: string
        }
        Insert: {
          category: string
          client_phone: string
          created_at?: string
          id: string
          order_id?: string | null
          replies?: Json
          status?: string
          subject: string
        }
        Update: {
          category?: string
          client_phone?: string
          created_at?: string
          id?: string
          order_id?: string | null
          replies?: Json
          status?: string
          subject?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_by: string | null
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_by?: string | null
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string
          device: string
          id: string
          ip_address: string | null
          is_current: boolean | null
          last_active: string
          location: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          device: string
          id?: string
          ip_address?: string | null
          is_current?: boolean | null
          last_active?: string
          location?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          device?: string
          id?: string
          ip_address?: string | null
          is_current?: boolean | null
          last_active?: string
          location?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      whatsapp_logs: {
        Row: {
          cost_sar: number | null
          created_at: string
          event_type: string
          id: string
          message_body: string
          meta_message_id: string | null
          order_id: string | null
          recipient_phone: string
          status: string
        }
        Insert: {
          cost_sar?: number | null
          created_at?: string
          event_type: string
          id?: string
          message_body: string
          meta_message_id?: string | null
          order_id?: string | null
          recipient_phone: string
          status?: string
        }
        Update: {
          cost_sar?: number | null
          created_at?: string
          event_type?: string
          id?: string
          message_body?: string
          meta_message_id?: string | null
          order_id?: string | null
          recipient_phone?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
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
          p_role: Database["public"]["Enums"]["app_role"]
          p_user_id: string
        }
        Returns: boolean
      }
      reserve_flower_stock: {
        Args: { p_order_id: string; p_product_slug: string; p_quantity: number }
        Returns: Json
      }
      update_vase_life_statuses: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role:
        | "admin"
        | "manager"
        | "sales"
        | "inventory"
        | "courier"
        | "client"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "manager", "sales", "inventory", "courier", "client"],
    },
  },
} as const
