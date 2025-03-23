
import { useMemo } from 'react';
import type { Product } from '@/types/product';
import type { SpecRow } from '../SpecificationsTable';
import { compareScores } from '../comparisonUtils';
import { formatBenchmarkScore } from '../formatters';
import { calculateBenchmarkScore } from '../../../utils/benchmarkCalculator';

export const usePerformanceSpecs = (
  laptopLeft: Product | null,
  laptopRight: Product | null,
  leftSpecs?: any,
  rightSpecs?: any
): SpecRow[] => {
  // Calculate Benchmark Score
  const calculateAndFormatBenchmarkScore = (laptop: Product | null): string => {
    if (!laptop) return 'Not available';
    
    // Use the benchmark calculation utility
    const benchmarkScore = calculateBenchmarkScore(laptop);
    if (benchmarkScore === 0) return 'Not available';
    
    return formatBenchmarkScore(benchmarkScore);
  };

  return useMemo(() => {
    if (!laptopLeft || !laptopRight) return [];

    return [
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
        title: 'Benchmark Score', 
        leftValue: calculateAndFormatBenchmarkScore(laptopLeft), 
        rightValue: calculateAndFormatBenchmarkScore(laptopRight),
        compare: compareScores
      }
    ];
  }, [laptopLeft, laptopRight, leftSpecs, rightSpecs]);
};
