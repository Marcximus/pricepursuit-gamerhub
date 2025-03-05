
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
