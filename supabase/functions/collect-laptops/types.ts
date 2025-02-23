
export interface OxylabsResult {
  asin: string;
  title: string;
  price?: number;
  price_strikethrough?: number;
  rating?: number;
  reviews_count?: number;
  url_image?: string;
  url?: string;
  manufacturer?: string;
  description?: string;
}

export interface OxylabsResponse {
  results: Array<{
    content: {
      results: {
        paid?: OxylabsResult[];
        organic?: OxylabsResult[];
      };
    };
  }>;
}

export interface ProcessedLaptopData {
  asin: string;
  processor: string | null;
  ram: string | null;
  storage: string | null;
  screen_size: string | null;
  screen_resolution: string | null;
  graphics: string | null;
  weight: string | null;
  battery_life: string | null;
  brand: string | null;
  model: string | null;
}
