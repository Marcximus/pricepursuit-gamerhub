
import type { Product } from "@/types/product";
import type { ComparisonSection } from "../types";
import { compareRatings, formatRating } from "../utils/comparisons/ratingComparison";
import { formatValue } from "../utils/formatters";

export const getReviewSpecs = (
  laptopLeft: Product | null, 
  laptopRight: Product | null
): ComparisonSection[] => {
  // Format Wilson Score in its standard format (-1 to 1 scale)
  const formatWilsonScore = (score: number | null | undefined): string => {
    if (score === null || score === undefined || isNaN(score)) return 'N/A';
    
    // Format Wilson score in standard format
    return score.toFixed(2);
  };

  // Compare Wilson scores in standard format (-1 to 1 scale)
  const compareWilsonScores = (a: string, b: string): 'better' | 'worse' | 'equal' | 'unknown' => {
    if (a === 'N/A' || b === 'N/A') return 'unknown';
    
    const aScore = parseFloat(a);
    const bScore = parseFloat(b);
    
    if (isNaN(aScore) || isNaN(bScore)) return 'unknown';
    
    if (aScore > bScore) return 'better';
    if (aScore < bScore) return 'worse';
    return 'equal';
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
