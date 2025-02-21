
export interface CollectLaptopsRequest {
  brands: string[];
  pages_per_brand: number;
}

export interface OxylabsResult {
  content: {
    url: string;
    page: number;
    query: string;
    results: {
      paid?: Array<ProductResult>;
      organic?: Array<ProductResult>;
    };
  };
}

interface ProductResult {
  url?: string;
  asin?: string;
  title?: string;
  rating?: number;
  currency?: string;
  url_image?: string;
  price?: {
    value?: string | number;
    original_price?: string | number;
  };
  reviews_count?: number;
  manufacturer?: string;
  is_sponsored?: boolean;
  is_amazons_choice?: boolean;
}

export interface ProductData {
  asin: string;
  title: string;
  current_price: number | null;
  original_price: number | null;
  rating: number;
  rating_count: number;
  image_url: string;
  product_url: string;
  is_laptop: boolean;
  brand: string;
  collection_status: string;
  last_checked: string;
  last_collection_attempt: string;
}
