
import { useMemo } from 'react';
import type { Product } from '@/types/product';
import type { ComparisonResult } from '../../types';
import { compareScores, compareInverseScores, comparePrices } from './comparisonUtils';
import { formatWilsonScore, formatBenchmarkScore } from './formatters';
import { calculateBenchmarkScore } from '../../utils/benchmarkCalculator';

interface SpecRow {
  title: string;
  leftValue: string;
  rightValue: string;
  compare?: (a: string, b: string) => 'better' | 'worse' | 'equal' | 'unknown';
}

export const useSpecifications = (
  laptopLeft: Product | null,
  laptopRight: Product | null,
  comparisonResult: ComparisonResult
) => {
  // Extract specifications from comparison result
  const leftSpecs = comparisonResult.specifications?.left;
  const rightSpecs = comparisonResult.specifications?.right;

  // Calculate Benchmark Score
  const calculateAndFormatBenchmarkScore = (laptop: Product | null): string => {
    if (!laptop) return 'Not available';
    
    // Use the benchmark calculation utility
    const benchmarkScore = calculateBenchmarkScore(laptop);
    if (benchmarkScore === 0) return 'Not available';
    
    return formatBenchmarkScore(benchmarkScore);
  };

  // Generate specification rows
  const specRows = useMemo(() => {
    if (!laptopLeft || !laptopRight) return [];

    return [
      { 
        title: 'Brand', 
        leftValue: leftSpecs?.brand || 'Not available', 
        rightValue: rightSpecs?.brand || 'Not available' 
      },
      { 
        title: 'Model', 
        leftValue: leftSpecs?.model || 'Not available', 
        rightValue: rightSpecs?.model || 'Not available' 
      },
      { 
        title: 'Price', 
        leftValue: leftSpecs?.price || 'Not available', 
        rightValue: rightSpecs?.price || 'Not available',
        compare: comparePrices
      },
      { 
        title: 'Operating System', 
        leftValue: leftSpecs?.os || 'Not available', 
        rightValue: rightSpecs?.os || 'Not available' 
      },
      { 
        title: 'Release Year', 
        leftValue: leftSpecs?.releaseYear || 'Not available', 
        rightValue: rightSpecs?.releaseYear || 'Not available',
        compare: compareScores
      },
      { 
        title: 'Processor', 
        leftValue: leftSpecs?.processor || 'Not available', 
        rightValue: rightSpecs?.processor || 'Not available' 
      },
      { 
        title: 'RAM', 
        leftValue: leftSpecs?.ram || 'Not available', 
        rightValue: rightSpecs?.ram || 'Not available',
        compare: compareScores
      },
      { 
        title: 'Storage', 
        leftValue: leftSpecs?.storage || 'Not available', 
        rightValue: rightSpecs?.storage || 'Not available',
        compare: compareScores
      },
      { 
        title: 'Graphics', 
        leftValue: leftSpecs?.graphics || 'Not available', 
        rightValue: rightSpecs?.graphics || 'Not available' 
      },
      { 
        title: 'Screen Size', 
        leftValue: leftSpecs?.screenSize || 'Not available', 
        rightValue: rightSpecs?.screenSize || 'Not available',
        compare: compareScores
      },
      { 
        title: 'Screen Resolution', 
        leftValue: leftSpecs?.screenResolution || 'Not available', 
        rightValue: rightSpecs?.screenResolution || 'Not available',
        compare: compareScores
      },
      { 
        title: 'Refresh Rate', 
        leftValue: leftSpecs?.refreshRate || 'Not available', 
        rightValue: rightSpecs?.refreshRate || 'Not available',
        compare: compareScores
      },
      { 
        title: 'Weight', 
        leftValue: leftSpecs?.weight || 'Not available', 
        rightValue: rightSpecs?.weight || 'Not available',
        compare: compareInverseScores
      },
      { 
        title: 'Battery Life', 
        leftValue: leftSpecs?.batteryLife || 'Not available', 
        rightValue: rightSpecs?.batteryLife || 'Not available',
        compare: compareScores
      },
      { 
        title: 'Ports', 
        leftValue: leftSpecs?.ports || 'Not available', 
        rightValue: rightSpecs?.ports || 'Not available' 
      },
      { 
        title: 'Rating', 
        leftValue: leftSpecs?.rating || 'Not available', 
        rightValue: rightSpecs?.rating || 'Not available',
        compare: compareScores
      },
      { 
        title: 'Rating Count', 
        leftValue: leftSpecs?.ratingCount || 'Not available', 
        rightValue: rightSpecs?.ratingCount || 'Not available',
        compare: compareScores
      },
      { 
        title: 'Total Reviews', 
        leftValue: leftSpecs?.totalReviews || 'Not available', 
        rightValue: rightSpecs?.totalReviews || 'Not available',
        compare: compareScores
      },
      { 
        title: 'Wilson Score', 
        leftValue: formatWilsonScore(laptopLeft.wilson_score), 
        rightValue: formatWilsonScore(laptopRight.wilson_score),
        compare: compareScores
      },
      { 
        title: 'Benchmark Score', 
        leftValue: calculateAndFormatBenchmarkScore(laptopLeft), 
        rightValue: calculateAndFormatBenchmarkScore(laptopRight),
        compare: compareScores
      }
    ];
  }, [laptopLeft, laptopRight, leftSpecs, rightSpecs]);

  return specRows;
};
