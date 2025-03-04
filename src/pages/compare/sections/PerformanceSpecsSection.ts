
import type { Product } from "@/types/product";
import type { ComparisonSection } from "../types";
import { compareProcessors, compareRAM, compareStorage } from "../utils/comparisonHelpers";
import { formatProcessor, formatRAM, formatStorage, formatGraphics } from "../utils/formatters";

export const getPerformanceSpecs = (
  laptopLeft: Product | null, 
  laptopRight: Product | null
): ComparisonSection[] => {
  return [
    {
      title: "Processor",
      leftValue: formatProcessor(laptopLeft?.processor, laptopLeft?.title),
      rightValue: formatProcessor(laptopRight?.processor, laptopRight?.title),
      compare: compareProcessors
    },
    {
      title: "RAM",
      leftValue: formatRAM(laptopLeft?.ram, laptopLeft?.title),
      rightValue: formatRAM(laptopRight?.ram, laptopRight?.title),
      compare: compareRAM
    },
    {
      title: "Storage",
      leftValue: formatStorage(laptopLeft?.storage, laptopLeft?.title),
      rightValue: formatStorage(laptopRight?.storage, laptopRight?.title),
      compare: compareStorage
    },
    {
      title: "Graphics",
      leftValue: formatGraphics(laptopLeft?.graphics, laptopLeft?.title),
      rightValue: formatGraphics(laptopRight?.graphics, laptopRight?.title)
    }
  ];
};
