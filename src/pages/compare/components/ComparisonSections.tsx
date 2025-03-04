import type { Product } from "@/types/product";
import { 
  formatPrice, 
  compareProcessors, 
  compareRAM, 
  compareStorage, 
  comparePrices, 
  compareRatings,
  compareScreenSize,
  compareResolution,
  compareWeight,
  compareBatteryLife
} from "../utils/comparisonHelpers";
import type { ComparisonSection } from "../types";
import { calculateBenchmarkScore } from "../utils/benchmarkCalculator";

interface ComparisonSectionsProps {
  laptopLeft: Product | null;
  laptopRight: Product | null;
}

// Changed from React.FC to a regular function
const ComparisonSections = ({ laptopLeft, laptopRight }: ComparisonSectionsProps): ComparisonSection[] => {
  // Helper to safely format values
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    return String(value);
  };

  // Calculate benchmark scores for laptops that don't have them
  const getCalculatedBenchmarkScore = (laptop: Product | null): string => {
    if (!laptop) return 'N/A';
    
    // If laptop already has a benchmark score, use it
    if (laptop.benchmark_score) {
      return formatValue(laptop.benchmark_score);
    }
    
    // Otherwise calculate it
    const calculatedScore = calculateBenchmarkScore(laptop);
    return formatValue(calculatedScore);
  };

  // Basic specs comparison
  const basicSections: ComparisonSection[] = [
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
    }
  ];

  // Performance specs comparison
  const performanceSections: ComparisonSection[] = [
    {
      title: "Processor",
      leftValue: formatValue(laptopLeft?.processor),
      rightValue: formatValue(laptopRight?.processor),
      compare: compareProcessors
    },
    {
      title: "RAM",
      leftValue: formatValue(laptopLeft?.ram),
      rightValue: formatValue(laptopRight?.ram),
      compare: compareRAM
    },
    {
      title: "Storage",
      leftValue: formatValue(laptopLeft?.storage),
      rightValue: formatValue(laptopRight?.storage),
      compare: compareStorage
    },
    {
      title: "Graphics",
      leftValue: formatValue(laptopLeft?.graphics),
      rightValue: formatValue(laptopRight?.graphics)
    }
  ];

  // Display specs comparison
  const displaySections: ComparisonSection[] = [
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
    }
  ];

  // Physical specs comparison
  const physicalSections: ComparisonSection[] = [
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
    }
  ];

  // Reviews and rating comparison
  const reviewSections: ComparisonSection[] = [
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

  // Benchmark scores comparison
  const benchmarkSections: ComparisonSection[] = [
    {
      title: "Benchmark Score",
      leftValue: getCalculatedBenchmarkScore(laptopLeft),
      rightValue: getCalculatedBenchmarkScore(laptopRight),
      compare: (a: string, b: string) => {
        const scoreA = parseInt(a, 10);
        const scoreB = parseInt(b, 10);
        if (isNaN(scoreA) || isNaN(scoreB)) return 'equal';
        if (scoreA > scoreB) return 'better';
        if (scoreA < scoreB) return 'worse';
        return 'equal';
      }
    },
    {
      title: "Processor Score",
      leftValue: formatValue(laptopLeft?.processor_score),
      rightValue: formatValue(laptopRight?.processor_score),
      compare: (a: string, b: string) => {
        const scoreA = parseInt(a, 10);
        const scoreB = parseInt(b, 10);
        if (isNaN(scoreA) || isNaN(scoreB)) return 'equal';
        if (scoreA > scoreB) return 'better';
        if (scoreA < scoreB) return 'worse';
        return 'equal';
      }
    },
    {
      title: "Wilson Score",
      leftValue: formatValue(laptopLeft?.wilson_score),
      rightValue: formatValue(laptopRight?.wilson_score),
      compare: (a: string, b: string) => {
        const scoreA = parseFloat(a);
        const scoreB = parseFloat(b);
        if (isNaN(scoreA) || isNaN(scoreB)) return 'equal';
        if (scoreA > scoreB) return 'better';
        if (scoreA < scoreB) return 'worse';
        return 'equal';
      }
    }
  ];

  // Combine all sections
  const allSections = [
    ...basicSections,
    ...performanceSections,
    ...displaySections,
    ...physicalSections,
    ...reviewSections,
    ...benchmarkSections
  ];

  return allSections;
};

export default ComparisonSections;
