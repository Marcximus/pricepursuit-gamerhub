
import type { Product } from "@/types/product";
import type { ComparisonSection } from "../types";
import { formatPrice, comparePrices } from "../utils/comparisonHelpers";
import { formatValue, formatOS, estimateReleaseYear } from "../utils/formatters";

export const getBasicSpecs = (
  laptopLeft: Product | null, 
  laptopRight: Product | null
): ComparisonSection[] => {
  return [
    {
      title: "Brand",
      leftValue: formatValue(laptopLeft?.brand),
      rightValue: formatValue(laptopRight?.brand)
    },
    {
      title: "Model",
      leftValue: formatValue(laptopLeft?.model),
      rightValue: formatValue(laptopRight?.model)
    },
    {
      title: "Price",
      leftValue: formatPrice(laptopLeft?.current_price),
      rightValue: formatPrice(laptopRight?.current_price),
      compare: comparePrices
    },
    {
      title: "OS",
      leftValue: formatOS(laptopLeft?.title),
      rightValue: formatOS(laptopRight?.title)
    },
    {
      title: "Release Year",
      leftValue: estimateReleaseYear(laptopLeft?.processor, laptopLeft?.title),
      rightValue: estimateReleaseYear(laptopRight?.processor, laptopRight?.title)
    }
  ];
};
