
import { useMemo } from 'react';
import type { Product } from '@/types/product';
import type { ComparisonResult } from '../../types';
import type { SpecRow } from './SpecificationsTable';
import {
  useBasicSpecs,
  usePerformanceSpecs,
  useDisplaySpecs,
  usePhysicalSpecs,
  useReviewSpecs
} from './hooks';

export const useSpecifications = (
  laptopLeft: Product | null,
  laptopRight: Product | null,
  comparisonResult: ComparisonResult
) => {
  // Extract specifications from comparison result
  const leftSpecs = comparisonResult.specifications?.left;
  const rightSpecs = comparisonResult.specifications?.right;

  // Use specialized hooks for each category
  const basicSpecs = useBasicSpecs(laptopLeft, laptopRight, leftSpecs, rightSpecs);
  const performanceSpecs = usePerformanceSpecs(laptopLeft, laptopRight, leftSpecs, rightSpecs);
  const displaySpecs = useDisplaySpecs(laptopLeft, laptopRight, leftSpecs, rightSpecs);
  const physicalSpecs = usePhysicalSpecs(laptopLeft, laptopRight, leftSpecs, rightSpecs);
  const reviewSpecs = useReviewSpecs(laptopLeft, laptopRight, leftSpecs, rightSpecs);

  // Combine all spec rows
  const specRows = useMemo(() => {
    if (!laptopLeft || !laptopRight) return [];

    // Combine all categories into a single array
    return [
      ...basicSpecs,
      ...performanceSpecs,
      ...displaySpecs,
      ...physicalSpecs,
      ...reviewSpecs
    ];
  }, [
    basicSpecs,
    performanceSpecs, 
    displaySpecs,
    physicalSpecs,
    reviewSpecs,
    laptopLeft,
    laptopRight
  ]);

  return specRows;
};
