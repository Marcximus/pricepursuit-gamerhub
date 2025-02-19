
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
}

export interface PriceHistory {
  id: string;
  product_id: string;
  price: number;
  timestamp: string;
  created_at: string;
}
