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
          created_at: string
          updated_at: string
          name: string
          slug: string
          description: string | null
          logo_url: string | null
          website_url: string | null
          billing_email: string | null
          subscription_plan: 'free' | 'starter' | 'professional' | 'enterprise'
          subscription_status: 'active' | 'canceled' | 'past_due'
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          slug: string
          description?: string | null
          logo_url?: string | null
          website_url?: string | null
          billing_email?: string | null
          subscription_plan?: 'free' | 'starter' | 'professional' | 'enterprise'
          subscription_status?: 'active' | 'canceled' | 'past_due'
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          slug?: string
          description?: string | null
          logo_url?: string | null
          website_url?: string | null
          billing_email?: string | null
          subscription_plan?: 'free' | 'starter' | 'professional' | 'enterprise'
          subscription_status?: 'active' | 'canceled' | 'past_due'
          metadata?: Json | null
        }
      }
      organization_members: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          created_at: string
          updated_at: string
          role: 'owner' | 'admin' | 'member' | 'viewer'
          invited_at: string | null
          invited_email: string | null
          accepted_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          created_at?: string
          updated_at?: string
          role?: 'owner' | 'admin' | 'member' | 'viewer'
          invited_at?: string | null
          invited_email?: string | null
          accepted_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          created_at?: string
          updated_at?: string
          role?: 'owner' | 'admin' | 'member' | 'viewer'
          invited_at?: string | null
          invited_email?: string | null
          accepted_at?: string | null
        }
      }
      clients: {
        Row: {
          id: string
          organization_id: string
          created_at: string
          updated_at: string
          name: string
          website_url: string
          location: string | null
          industry: string | null
          status: 'active' | 'paused' | 'archived'
          metadata: Json | null
        }
        Insert: {
          id?: string
          organization_id: string
          created_at?: string
          updated_at?: string
          name: string
          website_url: string
          location?: string | null
          industry?: string | null
          status?: 'active' | 'paused' | 'archived'
          metadata?: Json | null
        }
        Update: {
          id?: string
          organization_id?: string
          created_at?: string
          updated_at?: string
          name?: string
          website_url?: string
          location?: string | null
          industry?: string | null
          status?: 'active' | 'paused' | 'archived'
          metadata?: Json | null
        }
      }
      seo_keywords: {
        Row: {
          id: string
          client_id: string
          created_at: string
          updated_at: string
          keyword: string
          search_volume: number | null
          difficulty: number | null
          intent: 'commercial' | 'informational' | 'navigational' | 'transactional' | null
          target_url: string | null
          status: 'tracking' | 'paused' | 'completed'
          notes: string | null
        }
        Insert: {
          id?: string
          client_id: string
          created_at?: string
          updated_at?: string
          keyword: string
          search_volume?: number | null
          difficulty?: number | null
          intent?: 'commercial' | 'informational' | 'navigational' | 'transactional' | null
          target_url?: string | null
          status?: 'tracking' | 'paused' | 'completed'
          notes?: string | null
        }
        Update: {
          id?: string
          client_id?: string
          created_at?: string
          updated_at?: string
          keyword?: string
          search_volume?: number | null
          difficulty?: number | null
          intent?: 'commercial' | 'informational' | 'navigational' | 'transactional' | null
          target_url?: string | null
          status?: 'tracking' | 'paused' | 'completed'
          notes?: string | null
        }
      }
      rank_history: {
        Row: {
          id: string
          keyword_id: string
          created_at: string
          rank_position: number
          url: string | null
          device: 'desktop' | 'mobile'
          location: string | null
          search_engine: 'google' | 'bing'
        }
        Insert: {
          id?: string
          keyword_id: string
          created_at?: string
          rank_position: number
          url?: string | null
          device?: 'desktop' | 'mobile'
          location?: string | null
          search_engine?: 'google' | 'bing'
        }
        Update: {
          id?: string
          keyword_id?: string
          created_at?: string
          rank_position?: number
          url?: string | null
          device?: 'desktop' | 'mobile'
          location?: string | null
          search_engine?: 'google' | 'bing'
        }
      }
      grid_scans: {
        Row: {
          id: string
          client_id: string
          created_at: string
          updated_at: string
          location: string
          keyword: string
          results: Json
          notes: string | null
        }
        Insert: {
          id?: string
          client_id: string
          created_at?: string
          updated_at?: string
          location: string
          keyword: string
          results: Json
          notes?: string | null
        }
        Update: {
          id?: string
          client_id?: string
          created_at?: string
          updated_at?: string
          location?: string
          keyword?: string
          results?: Json
          notes?: string | null
        }
      }
      seo_tasks: {
        Row: {
          id: string
          client_id: string
          created_at: string
          updated_at: string
          title: string
          description: string | null
          status: 'todo' | 'in_progress' | 'completed'
          priority: 'low' | 'medium' | 'high' | 'critical'
          due_date: string | null
          assigned_to: string | null
          category: string | null
        }
        Insert: {
          id?: string
          client_id: string
          created_at?: string
          updated_at?: string
          title: string
          description?: string | null
          status?: 'todo' | 'in_progress' | 'completed'
          priority?: 'low' | 'medium' | 'high' | 'critical'
          due_date?: string | null
          assigned_to?: string | null
          category?: string | null
        }
        Update: {
          id?: string
          client_id?: string
          created_at?: string
          updated_at?: string
          title?: string
          description?: string | null
          status?: 'todo' | 'in_progress' | 'completed'
          priority?: 'low' | 'medium' | 'high' | 'critical'
          due_date?: string | null
          assigned_to?: string | null
          category?: string | null
        }
      }
      cannibalization_alerts: {
        Row: {
          id: string
          client_id: string
          created_at: string
          keyword_id_1: string
          keyword_id_2: string
          similarity_score: number
          impact_level: 'low' | 'medium' | 'high'
          status: 'open' | 'resolved'
          notes: string | null
        }
        Insert: {
          id?: string
          client_id: string
          created_at?: string
          keyword_id_1: string
          keyword_id_2: string
          similarity_score: number
          impact_level?: 'low' | 'medium' | 'high'
          status?: 'open' | 'resolved'
          notes?: string | null
        }
        Update: {
          id?: string
          client_id?: string
          created_at?: string
          keyword_id_1?: string
          keyword_id_2?: string
          similarity_score?: number
          impact_level?: 'low' | 'medium' | 'high'
          status?: 'open' | 'resolved'
          notes?: string | null
        }
      }
      api_usage_log: {
        Row: {
          id: string
          organization_id: string
          created_at: string
          endpoint: string
          method: string
          status_code: number
          response_time_ms: number
          user_id: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          created_at?: string
          endpoint: string
          method: string
          status_code: number
          response_time_ms: number
          user_id?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          created_at?: string
          endpoint?: string
          method?: string
          status_code?: number
          response_time_ms?: number
          user_id?: string | null
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
