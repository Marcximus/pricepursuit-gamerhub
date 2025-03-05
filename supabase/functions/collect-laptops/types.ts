
import { Database } from "../_shared/supabase-types.ts";

// Stats object to track collection results
export interface CollectionStats {
  processed: number;
  updated: number;
  added: number;
  failed: number;
  skipped?: number;
}

export interface ProcessedLaptopData {
  asin: string;
  title: string;
  description?: string;
  brand?: string;
  current_price?: number;
  original_price?: number;
  image_url?: string;
  product_url?: string;
  rating?: number | string;
  rating_count?: number;
  processor?: string;
  ram?: string;
  storage?: string;
  graphics?: string;
  screen_size?: string;
  operating_system?: string;
  weight?: string;
  [key: string]: any;
}

export interface OxylabsResult {
  title: string;
  asin: string;
  price: string | number;
  rating: any;
  reviews_count: number;
  manufacturer: string;
  description?: string;
  url?: string;
  image?: string;
  price_information?: {
    current_price?: string | number;
    previous_price?: string | number;
  };
  [key: string]: any;
}

export interface BrandProcessingResult {
  brand: string;
  stats: CollectionStats;
}

export interface PageResult {
  success: boolean;
  page: number;
  brand: string;
  stats?: CollectionStats;
  error?: any;
}

export interface ProgressData {
  groupIndex: number;
  brandIndex: number;
  timestamp: string;
  stats: CollectionStats;
}
