
export interface LaptopUpdateRequest {
  laptops: LaptopToUpdate[];
}

export interface LaptopToUpdate {
  id: string;
  asin: string;
  current_price?: number;
  title?: string;
  last_checked?: string;
}

export interface LaptopData {
  asin: string;
  title: string | null;
  current_price: number | null;
  original_price: number | null;
  rating: number | null;
  rating_count: number | null;
  total_reviews: number | null;
  image_url: string | null;
  product_url: string | null;
  description: string | null;
  processor: string | null;
  ram: string | null;
  storage: string | null;
  graphics: string | null;
  screen_size: string | null;
  screen_resolution: string | null;
  weight: string | null;
  battery_life: string | null;
  brand: string | null;
  model: string | null;
  review_data: {
    rating_breakdown: Record<string, any> | null;
    recent_reviews: Array<{
      rating: number | null;
      title: string | null;
      content: string | null;
      reviewer_name: string | null;
      review_date: string | null;
      verified_purchase: boolean;
      helpful_votes: number;
    }>;
  };
  category: string | null;
  features: string[] | null;
  availability: string | null;
}

export interface LaptopUpdateResult {
  success: boolean;
  message: string;
  updatedId?: string;
  updatedData?: Record<string, any>;
  error?: string;
}

export interface UpdateResponse {
  success: boolean;
  message: string;
  updatedCount: number;
  failedCount: number;
  results: {
    updated: Array<{
      id: string;
      asin: string;
      success: boolean;
      message?: string;
    }>;
    failed: Array<{
      id: string;
      asin: string;
      error: string;
    }>;
  };
}
