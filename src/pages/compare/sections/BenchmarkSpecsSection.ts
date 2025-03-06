import type { Product } from "@/types/product";
import type { ComparisonSection } from "../types";
import { calculateBenchmarkScore } from "../utils/benchmarkCalculator";
import { calculateProcessorScore } from "../utils/benchmark/processorScore";

export const getBenchmarkSpecs = (
  laptopLeft: Product | null, 
  laptopRight: Product | null
): ComparisonSection[] => {
  // Format benchmark score with context
  const formatBenchmarkScore = (score: number | null | undefined): string => {
    if (score === null || score === undefined || isNaN(score)) return 'N/A';
    return `${Math.round(score)}/100`;
  };

  // Calculate benchmark scores for laptops that don't have them
  const getCalculatedBenchmarkScore = (laptop: Product | null): string => {
    if (!laptop) return 'N/A';
    
    // If laptop already has a benchmark score, use it
    if (laptop.benchmark_score != null && !isNaN(laptop.benchmark_score)) {
      return formatBenchmarkScore(laptop.benchmark_score);
    }
    
    // Otherwise calculate it - make sure we have enough data to calculate a meaningful score
    if (laptop.processor || laptop.ram || laptop.storage || laptop.graphics) {
      const calculatedScore = calculateBenchmarkScore(laptop);
      return formatBenchmarkScore(calculatedScore);
    }
    
    return 'N/A';
  };

  // Format processor score with context
  const formatProcessorScore = (score: number | null | undefined): string => {
    if (score === null || score === undefined || isNaN(score)) return 'N/A';
    return `${Math.round(score)}/100`;
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
      leftValue: laptopLeft && laptopLeft.processor 
                ? formatProcessorScore(laptopLeft.processor_score || calculateProcessorScore(laptopLeft.processor))
                : 'N/A',
      rightValue: laptopRight && laptopRight.processor 
                ? formatProcessorScore(laptopRight.processor_score || calculateProcessorScore(laptopRight.processor))
                : 'N/A',
      compare: compareScores
    }
  ];
};
