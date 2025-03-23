
import { useMemo } from 'react';
import type { Product } from '@/types/product';
import type { SpecRow } from '../SpecificationsTable';
import { comparePrices } from '../comparisonUtils';
import { formatWilsonScore } from '../formatters';

export const useBasicSpecs = (
  laptopLeft: Product | null,
  laptopRight: Product | null,
  leftSpecs?: any,
  rightSpecs?: any
): SpecRow[] => {
  return useMemo(() => {
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
      }
    ];
  }, [laptopLeft, laptopRight, leftSpecs, rightSpecs]);
};

// Helper comparison function
const compareScores = (a: string, b: string): 'better' | 'worse' | 'equal' | 'unknown' => {
  if (a === 'Not available' || b === 'Not available') return 'unknown';
  
  const aMatch = a.match(/^(\d+(?:\.\d+)?)/);
  const bMatch = b.match(/^(\d+(?:\.\d+)?)/);
  
  if (aMatch && bMatch) {
    const aValue = parseFloat(aMatch[1]);
    const bValue = parseFloat(bMatch[1]);
    
    if (aValue > bValue) return 'better';
    if (aValue < bValue) return 'worse';
    return 'equal';
  }
  
  return 'unknown';
};
