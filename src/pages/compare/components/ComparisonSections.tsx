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
  enhancedSpecsLeft?: Record<string, any> | null;
  enhancedSpecsRight?: Record<string, any> | null;
}

const ComparisonSections = ({ 
  laptopLeft, 
  laptopRight, 
  enhancedSpecsLeft, 
  enhancedSpecsRight 
}: ComparisonSectionsProps): ComparisonSection[] => {
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    return String(value);
  };

  const getCalculatedBenchmarkScore = (laptop: Product | null): string => {
    if (!laptop) return 'N/A';
    
    if (laptop.benchmark_score) {
      return formatValue(laptop.benchmark_score);
    }
    
    const calculatedScore = calculateBenchmarkScore(laptop);
    return formatValue(calculatedScore);
  };

  const getEnhancedSpec = (laptop: Product | null, enhancedSpecs: Record<string, any> | null, field: string, specType: string): string => {
    if (!laptop) return 'N/A';
    
    if (enhancedSpecs && enhancedSpecs[field]) {
      return enhancedSpecs[field];
    }
    
    if (enhancedSpecs && enhancedSpecs.details && enhancedSpecs.details[specType]) {
      return enhancedSpecs.details[specType];
    }
    
    return formatValue(laptop[field as keyof Product]);
  };

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

  const performanceSections: ComparisonSection[] = [
    {
      title: "Processor",
      leftValue: getEnhancedSpec(laptopLeft, enhancedSpecsLeft, 'processor', 'CPU Model'),
      rightValue: getEnhancedSpec(laptopRight, enhancedSpecsRight, 'processor', 'CPU Model'),
      compare: compareProcessors
    },
    {
      title: "RAM",
      leftValue: getEnhancedSpec(laptopLeft, enhancedSpecsLeft, 'ram', 'RAM'),
      rightValue: getEnhancedSpec(laptopRight, enhancedSpecsRight, 'ram', 'RAM'),
      compare: compareRAM
    },
    {
      title: "Storage",
      leftValue: getEnhancedSpec(laptopLeft, enhancedSpecsLeft, 'storage', 'Memory Storage Capacity'),
      rightValue: getEnhancedSpec(laptopRight, enhancedSpecsRight, 'storage', 'Memory Storage Capacity'),
      compare: compareStorage
    },
    {
      title: "Graphics",
      leftValue: getEnhancedSpec(laptopLeft, enhancedSpecsLeft, 'graphics', 'Graphics Coprocessor'),
      rightValue: getEnhancedSpec(laptopRight, enhancedSpecsRight, 'graphics', 'Graphics Coprocessor')
    }
  ];

  const displaySections: ComparisonSection[] = [
    {
      title: "Screen Size",
      leftValue: getEnhancedSpec(laptopLeft, enhancedSpecsLeft, 'screen_size', 'Screen Size'),
      rightValue: getEnhancedSpec(laptopRight, enhancedSpecsRight, 'screen_size', 'Screen Size'),
      compare: compareScreenSize
    },
    {
      title: "Screen Resolution",
      leftValue: getEnhancedSpec(laptopLeft, enhancedSpecsLeft, 'screen_resolution', 'Resolution'),
      rightValue: getEnhancedSpec(laptopRight, enhancedSpecsRight, 'screen_resolution', 'Resolution'),
      compare: compareResolution
    }
  ];

  const physicalSections: ComparisonSection[] = [
    {
      title: "Weight",
      leftValue: getEnhancedSpec(laptopLeft, enhancedSpecsLeft, 'weight', 'Item Weight'),
      rightValue: getEnhancedSpec(laptopRight, enhancedSpecsRight, 'weight', 'Item Weight'),
      compare: compareWeight
    },
    {
      title: "Battery Life",
      leftValue: getEnhancedSpec(laptopLeft, enhancedSpecsLeft, 'battery_life', 'Battery Power Rating'),
      rightValue: getEnhancedSpec(laptopRight, enhancedSpecsRight, 'battery_life', 'Battery Power Rating'),
      compare: compareBatteryLife
    }
  ];

  const osSections: ComparisonSection[] = [];
  if ((enhancedSpecsLeft && enhancedSpecsLeft.os) || (enhancedSpecsRight && enhancedSpecsRight.os)) {
    osSections.push({
      title: "Operating System",
      leftValue: enhancedSpecsLeft?.os || 'N/A',
      rightValue: enhancedSpecsRight?.os || 'N/A'
    });
  }

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

  const additionalSections: ComparisonSection[] = [];
  
  if (enhancedSpecsLeft?.additional_info || enhancedSpecsRight?.additional_info) {
    const allKeys = new Set<string>();
    
    if (enhancedSpecsLeft?.additional_info) {
      Object.keys(enhancedSpecsLeft.additional_info).forEach(key => allKeys.add(key));
    }
    
    if (enhancedSpecsRight?.additional_info) {
      Object.keys(enhancedSpecsRight.additional_info).forEach(key => allKeys.add(key));
    }
    
    const importantKeys = [
      'Wireless communication technologies',
      'Connectivity technologies',
      'Special features',
      'Audio',
      'Keyboard',
      'Backlit Keyboard',
      'Webcam',
      'USB',
      'HDMI',
      'Thunderbolt',
      'Battery Life'
    ];
    
    importantKeys.forEach(key => {
      if (allKeys.has(key)) {
        additionalSections.push({
          title: key,
          leftValue: enhancedSpecsLeft?.additional_info?.[key] || 'N/A',
          rightValue: enhancedSpecsRight?.additional_info?.[key] || 'N/A'
        });
      }
    });
  }

  const allSections = [
    ...basicSections,
    ...performanceSections,
    ...displaySections,
    ...physicalSections,
    ...osSections,
    ...additionalSections,
    ...reviewSections,
    ...benchmarkSections
  ];

  return allSections;
};

export default ComparisonSections;
