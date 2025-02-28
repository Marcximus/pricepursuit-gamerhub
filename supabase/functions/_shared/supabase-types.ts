
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
      collection_progress: {
        Row: {
          created_at: string | null
          id: string
          last_updated: string | null
          progress_data: Json | null
          progress_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_updated?: string | null
          progress_data?: Json | null
          progress_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_updated?: string | null
          progress_data?: Json | null
          progress_type?: string
        }
      }
      price_history: {
        Row: {
          created_at: string | null
          id: string
          price: number
          product_id: string | null
          timestamp: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          price: number
          product_id?: string | null
          timestamp?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          price?: number
          product_id?: string | null
          timestamp?: string | null
        }
      }
      product_reviews: {
        Row: {
          content: string | null
          created_at: string | null
          helpful_votes: number | null
          id: string
          product_id: string
          rating: number
          review_date: string | null
          reviewer_name: string | null
          title: string | null
          verified_purchase: boolean | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          helpful_votes?: number | null
          id?: string
          product_id: string
          rating: number
          review_date?: string | null
          reviewer_name?: string | null
          title?: string | null
          verified_purchase?: boolean | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          helpful_votes?: number | null
          id?: string
          product_id?: string
          rating?: number
          review_date?: string | null
          reviewer_name?: string | null
          title?: string | null
          verified_purchase?: boolean | null
        }
      }
      products: {
        Row: {
          ai_processed_at: string | null
          ai_processing_status: string | null
          asin: string
          average_rating: number | null
          battery_life: string | null
          benchmark_score: number | null
          brand: string | null
          category: string | null
          collection_status: string | null
          created_at: string | null
          current_price: number | null
          description: string | null
          graphics: string | null
          id: string
          image_url: string | null
          is_laptop: boolean | null
          last_checked: string | null
          last_collection_attempt: string | null
          last_updated: string | null
          model: string | null
          original_price: number | null
          processor: string | null
          processor_score: number | null
          product_url: string | null
          ram: string | null
          rating: number | null
          rating_count: number | null
          review_data: Json | null
          screen_resolution: string | null
          screen_size: string | null
          storage: string | null
          title: string | null
          total_reviews: number | null
          update_status: string | null
          weight: string | null
          wilson_score: number | null
        }
        Insert: {
          ai_processed_at?: string | null
          ai_processing_status?: string | null
          asin: string
          average_rating?: number | null
          battery_life?: string | null
          benchmark_score?: number | null
          brand?: string | null
          category?: string | null
          collection_status?: string | null
          created_at?: string | null
          current_price?: number | null
          description?: string | null
          graphics?: string | null
          id?: string
          image_url?: string | null
          is_laptop?: boolean | null
          last_checked?: string | null
          last_collection_attempt?: string | null
          last_updated?: string | null
          model?: string | null
          original_price?: number | null
          processor?: string | null
          processor_score?: number | null
          product_url?: string | null
          ram?: string | null
          rating?: number | null
          rating_count?: number | null
          review_data?: Json | null
          screen_resolution?: string | null
          screen_size?: string | null
          storage?: string | null
          title?: string | null
          total_reviews?: number | null
          update_status?: string | null
          weight?: string | null
          wilson_score?: number | null
        }
        Update: {
          ai_processed_at?: string | null
          ai_processing_status?: string | null
          asin?: string
          average_rating?: number | null
          battery_life?: string | null
          benchmark_score?: number | null
          brand?: string | null
          category?: string | null
          collection_status?: string | null
          created_at?: string | null
          current_price?: number | null
          description?: string | null
          graphics?: string | null
          id?: string
          image_url?: string | null
          is_laptop?: boolean | null
          last_checked?: string | null
          last_collection_attempt?: string | null
          last_updated?: string | null
          model?: string | null
          original_price?: number | null
          processor?: string | null
          processor_score?: number | null
          product_url?: string | null
          ram?: string | null
          rating?: number | null
          rating_count?: number | null
          review_data?: Json | null
          screen_resolution?: string | null
          screen_size?: string | null
          storage?: string | null
          title?: string | null
          total_reviews?: number | null
          update_status?: string | null
          weight?: string | null
          wilson_score?: number | null
        }
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: "admin" | "user"
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: "admin" | "user"
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: "admin" | "user"
          user_id?: string
        }
      }
    }
    Views: {}
    Functions: {
      coalesce_price_for_sort: {
        Args: { price: number }
        Returns: number
      }
      get_duplicate_asins: {
        Args: Record<PropertyKey, never>
        Returns: { asin: string; count: number }[]
      }
      has_role: {
        Args: { _role: "admin" | "user" }
        Returns: boolean
      }
      update_product_with_price_history: {
        Args: { p_product_id: string; p_price: number; p_update_data: Json }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
  }
}
