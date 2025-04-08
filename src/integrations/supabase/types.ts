export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      blog_posts: {
        Row: {
          additional_images: string[] | null
          author: string
          category: string
          content: string
          created_at: string
          excerpt: string
          id: string
          image_url: string | null
          published: boolean
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          additional_images?: string[] | null
          author: string
          category: string
          content: string
          created_at?: string
          excerpt: string
          id?: string
          image_url?: string | null
          published?: boolean
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          additional_images?: string[] | null
          author?: string
          category?: string
          content?: string
          created_at?: string
          excerpt?: string
          id?: string
          image_url?: string | null
          published?: boolean
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
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
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: "price_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
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
          operating_system: string | null
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
          operating_system?: string | null
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
          operating_system?: string | null
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
        Relationships: []
      }
      system_config: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
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
          role?: Database["public"]["Enums"]["app_role"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      coalesce_price_for_sort: {
        Args: { price: number }
        Returns: number
      }
      create_laptop_update_schedule: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      delete_blog_post: {
        Args: { post_id: string }
        Returns: boolean
      }
      get_duplicate_asins: {
        Args: Record<PropertyKey, never>
        Returns: {
          asin: string
          count: number
        }[]
      }
      has_role: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      remove_laptop_update_schedule: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      update_product_with_price_history: {
        Args: { p_product_id: string; p_price: number; p_update_data: Json }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
