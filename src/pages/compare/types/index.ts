
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
    left: {
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
    };
    right: {
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
    };
  };
}

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
