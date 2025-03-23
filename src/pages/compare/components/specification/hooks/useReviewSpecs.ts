
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
        leftValue: leftSpecs?.rating || laptopLeft?.rating?.toString() || 'Not available', 
        rightValue: rightSpecs?.rating || laptopRight?.rating?.toString() || 'Not available',
        compare: compareScores
      },
      { 
        title: 'Rating Count', 
        leftValue: leftSpecs?.ratingCount || laptopLeft?.rating_count?.toString() || 'Not available', 
        rightValue: rightSpecs?.ratingCount || laptopRight?.rating_count?.toString() || 'Not available',
        compare: compareScores
      },
      { 
        title: 'Total Reviews', 
        leftValue: leftSpecs?.totalReviews || laptopLeft?.total_reviews?.toString() || 'Not available', 
        rightValue: rightSpecs?.totalReviews || laptopRight?.total_reviews?.toString() || 'Not available',
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
