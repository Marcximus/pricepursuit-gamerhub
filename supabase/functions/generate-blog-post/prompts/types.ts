
/**
 * Type definitions for system prompts
 */
export type BlogCategory = 'Top10' | 'Review' | 'Comparison' | 'How-To';

export interface ProductData {
  title?: string;
  brand?: string;
  price?: {
    current: number;
  };
  rating?: {
    rating: number;
    rating_count: number;
  };
  asin?: string;
  url?: string;
  features?: string[];
  specifications?: Record<string, any>;
  images?: string[];
}
