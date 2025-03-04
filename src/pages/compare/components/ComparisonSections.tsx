
import type { Product } from "@/types/product";
import type { ComparisonSection } from "../types";
import { 
  getBasicSpecs,
  getPerformanceSpecs,
  getDisplaySpecs,
  getPhysicalSpecs,
  getReviewSpecs,
  getBenchmarkSpecs
} from "../sections";

interface ComparisonSectionsProps {
  laptopLeft: Product | null;
  laptopRight: Product | null;
}

// Changed from React.FC to a regular function
const ComparisonSections = ({ laptopLeft, laptopRight }: ComparisonSectionsProps): ComparisonSection[] => {
  // Combine all sections
  const allSections = [
    ...getBasicSpecs(laptopLeft, laptopRight),
    ...getPerformanceSpecs(laptopLeft, laptopRight),
    ...getDisplaySpecs(laptopLeft, laptopRight),
    ...getPhysicalSpecs(laptopLeft, laptopRight),
    ...getReviewSpecs(laptopLeft, laptopRight),
    ...getBenchmarkSpecs(laptopLeft, laptopRight)
  ];

  return allSections;
};

export default ComparisonSections;
