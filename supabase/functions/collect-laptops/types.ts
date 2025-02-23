
export type OxylabsResult = {
  asin: string;
  title?: string;
  description?: string;
  price?: number;
  rating?: number;
  reviews_count?: number;
  manufacturer?: string;
  reviews?: Array<{
    rating: number;
    title?: string;
    content?: string;
    reviewer_name?: string;
    review_date?: string;
    verified_purchase?: boolean;
    helpful_votes?: number;
  }>;
  [key: string]: any; // Allow for additional fields from Oxylabs
};

export type ProcessedLaptopData = {
  asin: string;
  processor: string | null;
  ram: string | null;
  storage: string | null;
  screen_size: string | null;
  screen_resolution: string | null;
  graphics: string | null;
  weight: string | null;
  battery_life: string | null;
  brand: string | null;
  model: string | null;
  rating: number | null;
  rating_count: number | null;
  average_rating: number | null;
  total_reviews: number | null;
  review_data: {
    rating_breakdown: {
      [key: string]: number;
    };
    recent_reviews: Array<{
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
