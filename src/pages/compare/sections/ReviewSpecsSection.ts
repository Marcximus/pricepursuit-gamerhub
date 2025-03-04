
import type { Product } from "@/types/product";
import type { ComparisonSection } from "../types";
import { compareRatings, formatRating } from "../utils/comparisons/ratingComparison";
import { formatValue } from "../utils/formatters";

export const getReviewSpecs = (
  laptopLeft: Product | null, 
  laptopRight: Product | null
): ComparisonSection[] => {
  // Format Wilson Score (from -1 to 1 range to a percentage with proper explanation)
  const formatWilsonScore = (score: number | null | undefined): string => {
    if (score === null || score === undefined || isNaN(score)) return 'N/A';
    
    // Wilson score is typically between -1 and 1, 
    // convert to a confidence percentage (0-100%)
    const confidencePercentage = Math.min(100, Math.max(0, Math.round((score + 1) * 50)));
    return `${confidencePercentage}% confidence`;
  };

  // Compare Wilson scores
  const compareWilsonScores = (a: string, b: string): 'better' | 'worse' | 'equal' | 'unknown' => {
    const aMatch = a.match(/(\d+)%/);
    const bMatch = b.match(/(\d+)%/);
    
    if (aMatch && bMatch) {
      const aScore = parseInt(aMatch[1], 10);
      const bScore = parseInt(bMatch[1], 10);
      
      if (aScore > bScore) return 'better';
      if (aScore < bScore) return 'worse';
      return 'equal';
    }
    
    return 'unknown';
  };

  return [
    {
      title: "Rating",
      leftValue: formatRating(laptopLeft?.rating),
      rightValue: formatRating(laptopRight?.rating),
      compare: compareRatings
    },
    {
      title: "Rating Count",
      leftValue: formatValue(laptopLeft?.rating_count),
      rightValue: formatValue(laptopRight?.rating_count)
    },
    {
      title: "Total Reviews",
      leftValue: formatValue(laptopLeft?.total_reviews),
      rightValue: formatValue(laptopRight?.total_reviews)
    },
    {
      title: "Wilson Score",
      leftValue: formatWilsonScore(laptopLeft?.wilson_score),
      rightValue: formatWilsonScore(laptopRight?.wilson_score),
      compare: compareWilsonScores
    }
  ];
};
