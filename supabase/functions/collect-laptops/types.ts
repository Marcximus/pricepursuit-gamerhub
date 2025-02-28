
export interface OxylabsResponse {
  results: OxylabsResult[];
  [key: string]: any;
}

export interface OxylabsResult {
  content?: {
    results?: LaptopItem[];
    [key: string]: any;
  };
  [key: string]: any;
}

export interface LaptopItem {
  title?: string;
  asin?: string;
  price?: {
    value?: string;
    [key: string]: any;
  };
  price_original?: {
    value?: string;
    [key: string]: any;
  };
  rating?: string;
  ratings_total?: string;
  url?: string;
  images?: string[];
  description?: string;
  [key: string]: any;
}
