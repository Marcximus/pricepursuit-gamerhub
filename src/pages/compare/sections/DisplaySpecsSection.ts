
import type { Product } from "@/types/product";
import type { ComparisonSection } from "../types";
import { compareScreenSize, compareResolution } from "../utils/comparisonHelpers";
import { formatValue, extractRefreshRate } from "../utils/formatters";

export const getDisplaySpecs = (
  laptopLeft: Product | null, 
  laptopRight: Product | null
): ComparisonSection[] => {
  return [
    {
      title: "Screen Size",
      leftValue: formatValue(laptopLeft?.screen_size),
      rightValue: formatValue(laptopRight?.screen_size),
      compare: compareScreenSize
    },
    {
      title: "Screen Resolution",
      leftValue: formatValue(laptopLeft?.screen_resolution),
      rightValue: formatValue(laptopRight?.screen_resolution),
      compare: compareResolution
    },
    {
      title: "Refresh Rate",
      leftValue: extractRefreshRate(laptopLeft?.screen_resolution, laptopLeft?.title),
      rightValue: extractRefreshRate(laptopRight?.screen_resolution, laptopRight?.title),
      compare: (a: string, b: string) => {
        const rateA = parseInt(a, 10);
        const rateB = parseInt(b, 10);
        if (isNaN(rateA) || isNaN(rateB)) return 'equal';
        if (rateA > rateB) return 'better';
        if (rateA < rateB) return 'worse';
        return 'equal';
      }
    }
  ];
};
