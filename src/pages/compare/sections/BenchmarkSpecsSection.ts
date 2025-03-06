
import type { Product } from "@/types/product";
import type { ComparisonSection } from "../types";
import { calculateBenchmarkScore } from "../utils/benchmarkCalculator";

export const getBenchmarkSpecs = (
  laptopLeft: Product | null, 
  laptopRight: Product | null
): ComparisonSection[] => {
  // Format benchmark score with context
  const formatBenchmarkScore = (score: number | null | undefined): string => {
    if (score === null || score === undefined || score === 0) return 'N/A';
    return `${Math.round(score)}/100`;
  };

  // Calculate benchmark scores
  const getCalculatedBenchmarkScore = (laptop: Product | null): string => {
    if (!laptop) return 'N/A';
    
    // Calculate benchmark score
    const calculatedScore = calculateBenchmarkScore(laptop);
    return formatBenchmarkScore(calculatedScore);
  };

  // Compare numeric scores
  const compareScores = (a: string, b: string): 'better' | 'worse' | 'equal' | 'unknown' => {
    const aMatch = a.match(/(\d+)\/\d+/);
    const bMatch = b.match(/(\d+)\/\d+/);
    
    if (aMatch && bMatch) {
      const aScore = parseInt(aMatch[1], 10);
      const bScore = parseInt(bMatch[1], 10);
      
      if (aScore > bScore) return 'better';
      if (aScore < bScore) return 'worse';
      return 'equal';
    }
    
    return 'unknown';
  };

  return [
    {
      title: "Benchmark Score",
      leftValue: getCalculatedBenchmarkScore(laptopLeft),
      rightValue: getCalculatedBenchmarkScore(laptopRight),
      compare: compareScores
    }
  ];
};
