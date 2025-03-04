
import type { Product } from "@/types/product";
import type { ComparisonSection } from "../types";
import { calculateBenchmarkScore } from "../utils/benchmarkCalculator";

export const getBenchmarkSpecs = (
  laptopLeft: Product | null, 
  laptopRight: Product | null
): ComparisonSection[] => {
  // Format benchmark score with context
  const formatBenchmarkScore = (score: number | null | undefined): string => {
    if (score === null || score === undefined || isNaN(score)) return 'N/A';
    return `${score}/100`;
  };

  // Calculate benchmark scores for laptops that don't have them
  const getCalculatedBenchmarkScore = (laptop: Product | null): string => {
    if (!laptop) return 'N/A';
    
    // If laptop already has a benchmark score, use it
    if (laptop.benchmark_score) {
      return formatBenchmarkScore(laptop.benchmark_score);
    }
    
    // Otherwise calculate it
    const calculatedScore = calculateBenchmarkScore(laptop);
    return formatBenchmarkScore(calculatedScore);
  };

  // Format processor score with context
  const formatProcessorScore = (score: number | null | undefined): string => {
    if (score === null || score === undefined || isNaN(score)) return 'N/A';
    return `${score}/100`;
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
    },
    {
      title: "Processor Score",
      leftValue: formatProcessorScore(laptopLeft?.processor_score),
      rightValue: formatProcessorScore(laptopRight?.processor_score),
      compare: compareScores
    }
  ];
};
