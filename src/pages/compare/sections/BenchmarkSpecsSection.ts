import type { Product } from "@/types/product";
import type { ComparisonSection } from "../types";
import { formatValue } from "../utils/formatters";
import { calculateBenchmarkScore } from "../utils/benchmarkCalculator";

export const getBenchmarkSpecs = (
  laptopLeft: Product | null, 
  laptopRight: Product | null
): ComparisonSection[] => {
  // Calculate benchmark scores for laptops that don't have them
  const getCalculatedBenchmarkScore = (laptop: Product | null): string => {
    if (!laptop) return 'N/A';
    
    // If laptop already has a benchmark score, use it
    if (laptop.benchmark_score) {
      return formatValue(laptop.benchmark_score);
    }
    
    // Otherwise calculate it
    const calculatedScore = calculateBenchmarkScore(laptop);
    return formatValue(calculatedScore);
  };

  return [
    {
      title: "Benchmark Score",
      leftValue: getCalculatedBenchmarkScore(laptopLeft),
      rightValue: getCalculatedBenchmarkScore(laptopRight),
      compare: (a: string, b: string) => {
        const scoreA = parseInt(a, 10);
        const scoreB = parseInt(b, 10);
        if (isNaN(scoreA) || isNaN(scoreB)) return 'equal';
        if (scoreA > scoreB) return 'better';
        if (scoreA < scoreB) return 'worse';
        return 'equal';
      }
    },
    {
      title: "Processor Score",
      leftValue: formatValue(laptopLeft?.processor_score),
      rightValue: formatValue(laptopRight?.processor_score),
      compare: (a: string, b: string) => {
        const scoreA = parseInt(a, 10);
        const scoreB = parseInt(b, 10);
        if (isNaN(scoreA) || isNaN(scoreB)) return 'equal';
        if (scoreA > scoreB) return 'better';
        if (scoreA < scoreB) return 'worse';
        return 'equal';
      }
    },
    {
      title: "Wilson Score",
      leftValue: formatValue(laptopLeft?.wilson_score),
      rightValue: formatValue(laptopRight?.wilson_score),
      compare: (a: string, b: string) => {
        const scoreA = parseFloat(a);
        const scoreB = parseFloat(b);
        if (isNaN(scoreA) || isNaN(scoreB)) return 'equal';
        if (scoreA > scoreB) return 'better';
        if (scoreA < scoreB) return 'worse';
        return 'equal';
      }
    }
  ];
};
