
export type { ComparisonResult } from "../components/ComparisonDataProvider";

export interface ComparisonSection {
  title: string;
  leftValue: string;
  rightValue: string;
  compare?: (a: string, b: string) => 'better' | 'worse' | 'equal' | 'unknown';
  specInfo?: {
    icon?: string;
    explanation?: string;
  };
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
