
import { useMemo } from 'react';
import type { Product } from '@/types/product';
import type { SpecRow } from '../SpecificationsTable';
import { compareScores } from '../comparisonUtils';

export const useReviewDetails = (
  laptopLeft: Product | null,
  laptopRight: Product | null,
  leftSpecs?: any,
  rightSpecs?: any
): SpecRow[] => {
  return useMemo(() => {
    if (!laptopLeft || !laptopRight) return [];

    // Format the review counts for display
    const formatReviewCount = (count: number | null | undefined): string => {
      if (count === null || count === undefined) return 'Not available';
      return count.toLocaleString();
    };

    // Check if we have any review breakdown data
    const hasLeftReviewBreakdown = laptopLeft?.review_data?.rating_breakdown && 
      Object.keys(laptopLeft.review_data.rating_breakdown).length > 0;
    
    const hasRightReviewBreakdown = laptopRight?.review_data?.rating_breakdown && 
      Object.keys(laptopRight.review_data.rating_breakdown).length > 0;

    // Create an array to hold our spec rows
    const reviewDetails: SpecRow[] = [];

    // Add the recent reviews count if available
    reviewDetails.push({
      title: 'Recent Reviews', 
      leftValue: laptopLeft?.review_data?.recent_reviews?.length 
        ? `${laptopLeft.review_data.recent_reviews.length} reviews`
        : 'Not available', 
      rightValue: laptopRight?.review_data?.recent_reviews?.length 
        ? `${laptopRight.review_data.recent_reviews.length} reviews`
        : 'Not available',
    });

    // Add 5-star review counts if available
    if (hasLeftReviewBreakdown || hasRightReviewBreakdown) {
      reviewDetails.push({
        title: '5-Star Reviews', 
        leftValue: hasLeftReviewBreakdown && laptopLeft?.review_data?.rating_breakdown['5'] 
          ? formatReviewCount(laptopLeft.review_data.rating_breakdown['5']) 
          : 'Not available',
        rightValue: hasRightReviewBreakdown && laptopRight?.review_data?.rating_breakdown['5'] 
          ? formatReviewCount(laptopRight.review_data.rating_breakdown['5']) 
          : 'Not available',
        compare: compareScores
      });
    }

    return reviewDetails;
  }, [laptopLeft, laptopRight, leftSpecs, rightSpecs]);
};
