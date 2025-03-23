
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

export interface LaptopSpecifications {
  brand: string;
  model: string;
  price: string;
  os: string;
  releaseYear: string;
  processor: string;
  ram: string;
  storage: string;
  graphics: string;
  screenSize: string;
  screenResolution: string;
  refreshRate: string;
  weight: string;
  batteryLife: string;
  ports: string;
  rating: string;
  ratingCount: string;
  totalReviews: string;
  wilsonScore: string;
  benchmarkScore: string;
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
  specifications: {
    left: LaptopSpecifications;
    right: LaptopSpecifications;
  };
}
