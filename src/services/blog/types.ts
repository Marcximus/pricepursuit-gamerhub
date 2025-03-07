
import { supabase } from '@/integrations/supabase/client';

export interface GeneratedBlogContent {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags?: string[];
  productData?: {
    asin: string;
    title: string;
    brand: string;
    price: number;
    rating: number;
    reviewCount: number;
    imageUrl: string;
    productUrl: string;
  };
  comparisonData?: {
    product1: {
      asin: string;
      title: string;
      brand: string;
      price: number;
      rating: number;
      reviewCount: number;
      imageUrl: string;
      productUrl: string;
    };
    product2: {
      asin: string;
      title: string;
      brand: string;
      price: number;
      rating: number;
      reviewCount: number;
      imageUrl: string;
      productUrl: string;
    };
  };
}

export interface SearchParam {
  brand?: string;
  processor?: string;
  minPrice?: number;
  maxPrice?: number;
  ram?: string;
  storage?: string;
  graphics?: string;
}
