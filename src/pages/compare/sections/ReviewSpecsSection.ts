
import type { Product } from "@/types/product";
import type { ComparisonSection } from "../types";
import { compareRatings, formatRating } from "../utils/comparisons/ratingComparison";
import { formatValue } from "../utils/formatters";

export const getReviewSpecs = (
  laptopLeft: Product | null, 
  laptopRight: Product | null
): ComparisonSection[] => {
  // Format Wilson Score (convert from -1 to 1 range to 0-100 scale)
  const formatWilsonScore = (score: number | null | undefined): string => {
    if (score === null || score === undefined || isNaN(score)) return 'N/A';
    
    // Convert Wilson score (-1 to 1) to a 0-100 scale
    const normalizedScore = Math.max(0, (score + 1) * 50);
    return `${normalizedScore.toFixed(0)}/100`;
  };

  // Compare Wilson scores
  const compareWilsonScores = (a: string, b: string): 'better' | 'worse' | 'equal' | 'unknown' => {
    const aMatch = a.match(/(\d+)\/100/);
    const bMatch = b.match(/(\d+)\/100/);
    
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
