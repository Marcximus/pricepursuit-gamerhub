
import { useMemo } from 'react';
import type { Product } from '@/types/product';
import type { SpecRow } from '../SpecificationsTable';
import { compareScores, compareInverseScores } from '../comparisonUtils';

export const usePhysicalSpecs = (
  laptopLeft: Product | null,
  laptopRight: Product | null,
  leftSpecs?: any,
  rightSpecs?: any
): SpecRow[] => {
  return useMemo(() => {
    if (!laptopLeft || !laptopRight) return [];

    return [
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
      }
    ];
  }, [laptopLeft, laptopRight, leftSpecs, rightSpecs]);
};
