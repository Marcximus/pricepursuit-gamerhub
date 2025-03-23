
import { useMemo } from 'react';
import type { Product } from '@/types/product';
import type { SpecRow } from '../SpecificationsTable';
import { compareScores } from '../comparisonUtils';
import { formatWilsonScore } from '../formatters';

export const useReviewSpecs = (
  laptopLeft: Product | null,
  laptopRight: Product | null,
  leftSpecs?: any,
  rightSpecs?: any
): SpecRow[] => {
  return useMemo(() => {
    if (!laptopLeft || !laptopRight) return [];

    return [
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
        leftValue: formatWilsonScore(laptopLeft?.wilson_score), 
        rightValue: formatWilsonScore(laptopRight?.wilson_score),
        compare: compareScores
      }
    ];
  }, [laptopLeft, laptopRight, leftSpecs, rightSpecs]);
};
