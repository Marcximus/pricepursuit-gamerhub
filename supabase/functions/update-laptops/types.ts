
// Types for update-laptops function

// Request Types
export interface LaptopUpdateRequest {
  laptops: Array<{
    id: string;
    asin: string;
    current_price?: number;
    title?: string;
    last_checked?: string;
  }>;
}

// Response Types
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

// Laptop Update Types
export interface LaptopUpdate {
  id: string;
  asin: string;
  title?: string;
  current_price?: number | null;
  original_price?: number | null;
  rating?: number | null;
  rating_count?: number | null;
  total_reviews?: number | null;
  image_url?: string;
  processor?: string;
  ram?: string;
  storage?: string;
  graphics?: string;
  screen_size?: string;
  screen_resolution?: string;
  weight?: string;
  battery_life?: string;
  brand?: string;
  model?: string;
}

export interface LaptopUpdateResult {
  id: string;
  asin: string;
  success: boolean;
  message?: string;
  error?: string;
}
