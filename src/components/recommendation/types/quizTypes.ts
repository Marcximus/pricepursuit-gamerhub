
export interface RecommendationQuizState {
  answers: UserAnswers;
  currentQuestion: number;
  results: RecommendationResult[] | null;
  loading: boolean;
}

export interface UserAnswers {
  usage: string;
  priceRange: [number, number];
  brand: string;
  screenSize: string;
  graphics: string;
  storage: string;
}

export interface Recommendation {
  model: string;
  searchQuery: string;
  priceRange: {
    min: number;
    max: number;
  };
  reason: string;
  usage?: string;
}

export interface Product {
  id?: string; // Make ID field optional
  asin: string;
  product_title: string;
  product_photo?: string;
  product_url?: string;
  product_price: number;
  product_original_price?: number;
  product_star_rating?: number;
  product_num_ratings?: number;
  is_prime?: boolean;
  delivery?: string;
  processor?: string;
  ram?: string;
  storage?: string;
  graphics?: string;
  battery_life?: string;
  weight?: string;
  screen_size?: string;
  screen_resolution?: string;
}

export interface RecommendationResult {
  recommendation: Recommendation;
  product?: Product;
}

// Add the missing type definitions
export type UsageType = string;
export type BrandType = string;
export type ScreenSizeType = string;
export type GraphicsType = string;
export type StorageType = string;
export type PriceRangeType = string | [number, number];

// QuizAnswers type for useQuizState.ts
export interface QuizAnswers {
  usage: UsageType;
  priceRange: PriceRangeType;
  customMinPrice: number;
  customMaxPrice: number;
  brand: BrandType;
  screenSize: ScreenSizeType;
  graphics: GraphicsType;
  storage: StorageType;
}

// HighlightItem interface for ProductHighlights component
export interface HighlightItem {
  text: string;
  icon: React.ReactNode;
}
