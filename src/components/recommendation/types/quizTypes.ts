
// Quiz question types
export type UsageType = 'general' | 'business' | 'gaming' | 'student' | 'creative' | '' | 'School/Education' | 'Business/Office Work' | 'Video Editing' | 'Photo Editing' | 'AI/Machine Learning' | 'Gaming' | 'Programming/Coding' | 'Web Browsing/Everyday Use' | 'Content Creation' | '3D Modeling/CAD';
export type BrandType = 'any' | 'apple' | 'dell' | 'hp' | 'lenovo' | 'asus' | 'acer' | 'microsoft' | 'msi' | 'samsung' | 'lg' | '' | 'No preference' | 'Dell' | 'HP' | 'Lenovo' | 'Apple' | 'ASUS' | 'Acer' | 'MSI' | 'Microsoft Surface' | 'Samsung' | 'Razer' | 'LG' | 'Gigabyte' | 'Toshiba';
export type ScreenSizeType = 'any' | 'small' | 'medium' | 'large' | '' | '10-13+ inches (ultra-portable)' | '14-16+ inches (balanced)' | '17-19+ inches (desktop replacement)';
export type GraphicsType = 'basic' | 'mid-range' | 'high-end' | '' | 'Integrated graphics (basic tasks)' | 'Dedicated GPU (gaming, design, video editing)' | 'High-end GPU (advanced rendering, AAA gaming)';
export type StorageType = 'small' | 'medium' | 'large' | '' | 'Not much (200 GB - 500GB)' | 'I need a bit (500 GB - 1000GB)' | 'I need a lot (1000GB - 8000GB)';
export type PriceRangeType = string | [number, number]; // Updated to accept both string and number tuple

// Quiz answers
export interface QuizAnswers {
  usage: UsageType;
  brand: BrandType;
  screenSize: ScreenSizeType;
  graphics: GraphicsType;
  storage: StorageType;
  priceRange: PriceRangeType;
  customMinPrice?: number; // Added as optional
  customMaxPrice?: number; // Added as optional
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
