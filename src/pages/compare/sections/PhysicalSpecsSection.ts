
import type { Product } from "@/types/product";
import type { ComparisonSection } from "../types";
import { compareWeight, compareBatteryLife } from "../utils/comparisonHelpers";
import { formatValue, extractPorts } from "../utils/formatters";

export const getPhysicalSpecs = (
  laptopLeft: Product | null, 
  laptopRight: Product | null
): ComparisonSection[] => {
  return [
    {
      title: "Weight",
      leftValue: formatValue(laptopLeft?.weight),
      rightValue: formatValue(laptopRight?.weight),
      compare: compareWeight
    },
    {
      title: "Battery Life",
      leftValue: formatValue(laptopLeft?.battery_life),
      rightValue: formatValue(laptopRight?.battery_life),
      compare: compareBatteryLife
    },
    {
      title: "Ports",
      leftValue: extractPorts(laptopLeft?.title),
      rightValue: extractPorts(laptopRight?.title)
    }
  ];
};
