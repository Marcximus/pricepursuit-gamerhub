
export interface Product {
  id: string;
  asin?: string;
  brand?: string;
  model?: string;
  title?: string;
  processor?: string;
  ram?: string;
  storage?: string;
  graphics?: string;
  screen_size?: string;
  screen_resolution?: string;
  operating_system?: string;
  weight?: string;
  battery_life?: string;
  price?: number;
  original_price?: number;
  rating?: number;
  rating_count?: number;
  benchmark_score?: number;
  wilson_score?: number;
}

export interface ComparisonResult {
  winner: 'left' | 'right' | 'tie';
  analysis: string;
  advantages: {
    left: string[];
    right: string[];
  };
  recommendation: string;
  valueForMoney: {
    left: string;
    right: string;
  };
}
