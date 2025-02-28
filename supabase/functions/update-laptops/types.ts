
/**
 * Laptop object passed from client for update
 */
export interface LaptopUpdate {
  id: string;
  asin: string;
  current_price?: number | null;
  title?: string;
  last_checked?: string | null;
  image_url?: string | null;
}

/**
 * Result of a laptop update operation
 */
export interface UpdateResult {
  success: boolean;
  priceUpdated: boolean;
  imageUpdated: boolean;
  specsUpdated: boolean;
  error?: string;
}

/**
 * Statistics about update operations
 */
export interface UpdateStats {
  total: number;
  successful: number;
  failed: number;
  priceUpdated: number;
  imageUpdated: number;
  specsUpdated: number;
}

/**
 * Enhanced laptop data after processing
 */
export interface EnhancedLaptopData {
  asin: string;
  title?: string;
  brand?: string;
  model?: string;
  current_price?: number | null;
  original_price?: number | null;
  image_url?: string | null;
  product_url?: string;
  rating?: number | null;
  rating_count?: number | null;
  description?: string;
  processor?: string;
  ram?: string;
  storage?: string;
  screen_size?: string;
  screen_resolution?: string;
  graphics?: string;
  weight?: string;
  operating_system?: string;
  touchscreen?: boolean;
  color?: string;
  review_data?: Record<string, any>;
  last_checked?: string;
}
