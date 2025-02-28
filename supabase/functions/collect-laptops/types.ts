
export interface OxylabsResponse {
  results: OxylabsResult[];
  job_id?: string;
  status_code?: number;
  status_message?: string;
}

export interface OxylabsResult {
  content: {
    results: LaptopResult[];
    total_results?: number;
    page?: number;
    organic_results?: any[];
    page_info?: any;
  };
  created_at?: string;
  updated_at?: string;
  page?: number;
  url?: string;
  job_id?: string;
  status_code?: number;
  parser_type?: string;
}

export interface LaptopResult {
  asin: string;
  title: string;
  price?: {
    value: string;
    currency: string;
  };
  price_original?: {
    value: string;
    currency: string;
  };
  url?: string;
  rating?: string;
  ratings_total?: string;
  images?: string[];
  description?: string;
  features?: string[];
  attributes?: Record<string, string>;
  variants?: any[];
  sponsored?: boolean;
  position?: number;
}
