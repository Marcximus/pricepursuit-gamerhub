
export interface Product {
  id: string;
  asin: string;
  title: string;
  current_price: number;
  original_price: number;
  rating: number;
  rating_count: number;
  image_url: string;
  product_url: string;
  last_checked: string;
  created_at: string;
  update_status?: 'pending' | 'in_progress' | 'completed' | 'error';
  processor?: string;
  processor_score?: number;
  ram?: string;
  storage?: string;
  screen_size?: string;
  screen_resolution?: string;
  graphics?: string; // GPU information
  benchmark_score?: number;
  weight?: string;
  battery_life?: string;
  brand: string; // Brand like Dell, HP, Apple
  model?: string; // Model identifier
  total_reviews?: number;
  average_rating?: number;
  wilson_score?: number;
  review_data?: {
    rating_breakdown?: {
      [key: string]: number;
    };
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
}

export interface PriceHistory {
  id: string;
  product_id: string;
  price: number;
  timestamp: string;
  created_at: string;
}

