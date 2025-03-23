
import { useMemo } from 'react';
import type { Product } from '@/types/product';
import type { SpecRow } from '../SpecificationsTable';
import { compareScores } from '../comparisonUtils';

export const useDisplaySpecs = (
  laptopLeft: Product | null,
  laptopRight: Product | null,
  leftSpecs?: any,
  rightSpecs?: any
): SpecRow[] => {
  return useMemo(() => {
    if (!laptopLeft || !laptopRight) return [];

    return [
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
      }
    ];
  }, [laptopLeft, laptopRight, leftSpecs, rightSpecs]);
};
