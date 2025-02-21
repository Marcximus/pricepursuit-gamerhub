
export interface CollectLaptopsRequest {
  brands: string[];
  pages_per_brand: number;
}

export interface OxylabsResult {
  content: {
    results?: {
      asin?: string;
      title?: string;
      price?: {
        value?: string | number;
        original_price?: string | number;
      };
      rating?: string;
      reviews?: {
        rating_count?: string;
      };
      image?: {
        url?: string;
      };
      url?: string;
    }[];
  };
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

