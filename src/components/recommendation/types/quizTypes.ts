
// Quiz question types
export type UsageType = 'general' | 'business' | 'gaming' | 'student' | 'creative';
export type BrandType = 'any' | 'apple' | 'dell' | 'hp' | 'lenovo' | 'asus' | 'acer' | 'microsoft' | 'msi' | 'samsung' | 'lg';
export type ScreenSizeType = 'any' | 'small' | 'medium' | 'large';
export type GraphicsType = 'basic' | 'mid-range' | 'high-end';
export type StorageType = 'small' | 'medium' | 'large';
export type PriceRangeType = [number, number];

// Quiz answers
export interface QuizAnswers {
  usage: UsageType;
  brand: BrandType;
  screenSize: ScreenSizeType;
  graphics: GraphicsType;
  storage: StorageType;
  priceRange: PriceRangeType;
}

// Product type for recommendation results
export interface RecommendedProduct {
  asin: string;
  product_title: string;
  product_price: string | number;
  product_original_price?: string | number;
  product_url: string;
  product_photo: string;
  product_star_rating: number;
  product_num_ratings: number;
  is_prime?: boolean;
  delivery?: string;
}

// Recommendation with reasoning
export interface Recommendation {
  model: string;
  searchQuery: string;
  priceRange: { min: number; max: number };
  reason: string;
}

// Combined recommendation result
export interface RecommendationResult {
  recommendation: Recommendation;
  product: RecommendedProduct | null;
}

// Quiz state
export interface QuizState {
  step: number;
  answers: QuizAnswers;
  loading: boolean;
  results: RecommendationResult[];
  error: string | null;
}
