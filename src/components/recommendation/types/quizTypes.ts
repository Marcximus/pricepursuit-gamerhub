
export interface QuizAnswers {
  usage: string;
  priceRange: string;
  customMinPrice: number;
  customMaxPrice: number;
  brand: string;
  screenSize: string;
  graphics: string;
  storage: string;
}

export interface QuizQuestion {
  id: keyof QuizAnswers;
  question: string;
  options: string[];
  emojis?: string[];
}

export interface RecommendationResult {
  recommendation: {
    model: string;
    searchQuery: string;
    priceRange: {
      min: number;
      max: number;
    };
    reason: string;
  };
  product: {
    asin: string;
    product_title: string;
    product_price: string;
    product_original_price: string;
    currency: string;
    product_star_rating: string;
    product_num_ratings: number;
    product_url: string;
    product_photo: string;
    is_prime: boolean;
    delivery: string;
  } | null;
}
