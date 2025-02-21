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
          asin: string
          average_rating: number | null
          battery_life: string | null
          benchmark_score: number | null
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
        }
        Insert: {
          asin: string
          average_rating?: number | null
          battery_life?: string | null
          benchmark_score?: number | null
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
        }
        Update: {
          asin?: string
          average_rating?: number | null
          battery_life?: string | null
          benchmark_score?: number | null
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
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
