
import type { Product } from "@/types/product";
import type { ComparisonSection } from "../types";
import { compareRatings } from "../utils/comparisonHelpers";
import { formatValue } from "../utils/formatters";

export const getReviewSpecs = (
  laptopLeft: Product | null, 
  laptopRight: Product | null
): ComparisonSection[] => {
  return [
    {
      title: "Rating",
      leftValue: laptopLeft?.rating ? `${laptopLeft.rating.toFixed(1)}/5` : 'N/A',
      rightValue: laptopRight?.rating ? `${laptopRight.rating.toFixed(1)}/5` : 'N/A',
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
    }
  ];
};
