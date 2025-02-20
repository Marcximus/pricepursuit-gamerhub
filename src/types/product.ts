
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
  processor?: string;
  processor_score?: number;
  ram?: string;
  storage?: string;
  screen_size?: string;
  screen_resolution?: string;
  graphics?: string;
  benchmark_score?: number;
  weight?: string;
  battery_life?: string;
}

export interface PriceHistory {
  id: string;
  product_id: string;
  price: number;
  timestamp: string;
  created_at: string;
}
