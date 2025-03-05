
export type ComparisonResult = {
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
};

export type ComparisonOutcome = 'better' | 'worse' | 'equal' | 'unknown';

export type CompareFunction = (a: string, b: string) => ComparisonOutcome;

export interface ComparisonSection {
  title: string;
  leftValue: string;
  rightValue: string;
  compare?: CompareFunction;
  specInfo?: string; // Added missing property
}

export type BenchmarkScores = {
  totalScore: number;
  processorScore: number;
  graphicsScore: number;
  ramScore: number;
  storageScore: number;
  displayScore: number;
};
