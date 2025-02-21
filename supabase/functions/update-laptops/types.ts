
export interface OxylabsResponse {
  results: Array<{
    content: {
      url: string;
      asin: string;
      brand?: string;
      price?: number;
      stock?: string;
      title?: string;
      images?: string[];
      rating?: number;
      rating_count?: number;
      currency?: string;
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
    };
  }>;
}
