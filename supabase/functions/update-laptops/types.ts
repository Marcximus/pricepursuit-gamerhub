
export interface OxylabsResponse {
  results: Array<{
    pricing?: {
      current_price?: number;
      original_price?: number;
    };
    rating?: {
      rating?: number;
      rating_count?: number;
    };
    reviews?: {
      rating_breakdown?: Record<string, number>;
      recent_reviews?: Array<{
        rating: number;
        title?: string;
        content?: string;
        reviewer_name?: string;
        review_date?: string;
        verified_purchase?: boolean;
        helpful_votes?: number;
      }>;
    };
  }>;
}
