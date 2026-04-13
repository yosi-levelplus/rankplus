export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          stripe_customer_id: string | null
          plan: string
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          stripe_customer_id?: string | null
          plan?: string
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          stripe_customer_id?: string | null
          plan?: string
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      organization_members: {
        Row: {
          id: string
          org_id: string
          user_id: string
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          user_id: string
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          user_id?: string
          role?: string
          created_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          org_id: string
          business_name: string
          website_url: string | null
          google_place_id: string | null
          business_address: string | null
          business_lat: number | null
          business_lng: number | null
          is_archived: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          business_name: string
          website_url?: string | null
          google_place_id?: string | null
          business_address?: string | null
          business_lat?: number | null
          business_lng?: number | null
          is_archived?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          business_name?: string
          website_url?: string | null
          google_place_id?: string | null
          business_address?: string | null
          business_lat?: number | null
          business_lng?: number | null
          is_archived?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      campaigns: {
        Row: {
          id: string
          org_id: string
          client_id: string
          name: string
          grid_size: number
          radius_miles: number
          scan_frequency: string
          status: string
          last_run_at: string | null
          next_run_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          client_id: string
          name: string
          grid_size?: number
          radius_miles?: number
          scan_frequency?: string
          status?: string
          last_run_at?: string | null
          next_run_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          client_id?: string
          name?: string
          grid_size?: number
          radius_miles?: number
          scan_frequency?: string
          status?: string
          last_run_at?: string | null
          next_run_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      campaign_keywords: {
        Row: {
          id: string
          campaign_id: string
          keyword: string
          created_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          keyword: string
          created_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          keyword?: string
          created_at?: string
        }
      }
      seo_keywords: {
        Row: {
          id: string
          client_id: string
          org_id: string
          term: string
          geo_location: string
          language_code: string
          device: string
          target_url: string | null
          tags: string[]
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          org_id: string
          term: string
          geo_location?: string
          language_code?: string
          device?: string
          target_url?: string | null
          tags?: string[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          org_id?: string
          term?: string
          geo_location?: string
          language_code?: string
          device?: string
          target_url?: string | null
          tags?: string[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      rank_history: {
        Row: {
          id: string
          keyword_id: string
          org_id: string
          rank: number | null
          previous_rank: number | null
          url: string | null
          date: string
          serp_features: Json
          competitor_data: Json
          created_at: string
        }
        Insert: {
          id?: string
          keyword_id: string
          org_id: string
          rank?: number | null
          previous_rank?: number | null
          url?: string | null
          date?: string
          serp_features?: Json
          competitor_data?: Json
          created_at?: string
        }
        Update: {
          id?: string
          keyword_id?: string
          org_id?: string
          rank?: number | null
          previous_rank?: number | null
          url?: string | null
          date?: string
          serp_features?: Json
          competitor_data?: Json
          created_at?: string
        }
      }
      grid_scans: {
        Row: {
          id: string
          client_id: string
          org_id: string
          business_name: string
          place_id: string | null
          center_lat: number
          center_lng: number
          radius_miles: number
          grid_size: number
          search_term: string
          results_json: Json
          average_rank: number | null
          scan_date: string
          created_at: string
          campaign_id: string | null
          keyword_id: string | null
          scan_status: string
        }
        Insert: {
          id?: string
          client_id: string
          org_id: string
          business_name: string
          place_id?: string | null
          center_lat: number
          center_lng: number
          radius_miles?: number
          grid_size?: number
          search_term: string
          results_json?: Json
          average_rank?: number | null
          scan_date?: string
          created_at?: string
          campaign_id?: string | null
          keyword_id?: string | null
          scan_status?: string
        }
        Update: {
          id?: string
          client_id?: string
          org_id?: string
          business_name?: string
          place_id?: string | null
          center_lat?: number
          center_lng?: number
          radius_miles?: number
          grid_size?: number
          search_term?: string
          results_json?: Json
          average_rank?: number | null
          scan_date?: string
          created_at?: string
          campaign_id?: string | null
          keyword_id?: string | null
          scan_status?: string
        }
      }
      grid_scan_points: {
        Row: {
          id: string
          scan_id: string
          grid_row: number
          grid_col: number
          lat: number
          lng: number
          rank: number | null
          found_business_name: string | null
          found_place_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          scan_id: string
          grid_row: number
          grid_col: number
          lat: number
          lng: number
          rank?: number | null
          found_business_name?: string | null
          found_place_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          scan_id?: string
          grid_row?: number
          grid_col?: number
          lat?: number
          lng?: number
          rank?: number | null
          found_business_name?: string | null
          found_place_id?: string | null
          created_at?: string
        }
      }
      seo_tasks: {
        Row: {
          id: string
          client_id: string
          org_id: string
          linked_keyword_id: string | null
          linked_grid_scan_id: string | null
          title: string
          description: string | null
          task_type: string
          priority: string
          status: string
          assigned_to: string | null
          due_date: string | null
          trigger_rule: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          org_id: string
          linked_keyword_id?: string | null
          linked_grid_scan_id?: string | null
          title: string
          description?: string | null
          task_type?: string
          priority?: string
          status?: string
          assigned_to?: string | null
          due_date?: string | null
          trigger_rule?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          org_id?: string
          linked_keyword_id?: string | null
          linked_grid_scan_id?: string | null
          title?: string
          description?: string | null
          task_type?: string
          priority?: string
          status?: string
          assigned_to?: string | null
          due_date?: string | null
          trigger_rule?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      cannibalization_alerts: {
        Row: {
          id: string
          org_id: string
          client_id: string
          keyword_id: string
          url_a: string
          url_b: string
          rank_a: number | null
          rank_b: number | null
          detected_date: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          client_id: string
          keyword_id: string
          url_a: string
          url_b: string
          rank_a?: number | null
          rank_b?: number | null
          detected_date?: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          client_id?: string
          keyword_id?: string
          url_a?: string
          url_b?: string
          rank_a?: number | null
          rank_b?: number | null
          detected_date?: string
          status?: string
          created_at?: string
        }
      }
      api_usage_log: {
        Row: {
          id: string
          org_id: string
          api_provider: string
          endpoint: string
          credits_used: number
          request_payload: Json | null
          response_status: number | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          api_provider?: string
          endpoint: string
          credits_used?: number
          request_payload?: Json | null
          response_status?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          api_provider?: string
          endpoint?: string
          credits_used?: number
          request_payload?: Json | null
          response_status?: number | null
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
