
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
import { normalizeProcessor } from "@/utils/laptop/normalizers/processorNormalizer";
import { normalizeRam } from "@/utils/laptop/normalizers/ramNormalizer";

interface ComparisonSectionsProps {
  laptopLeft: Product | null;
  laptopRight: Product | null;
}

// Enhanced specification formatting functions
const formatProcessor = (processor?: string, title?: string): string => {
  if (!processor || processor === 'Not Specified' || processor === 'N/A') {
    // Try to extract from title if processor is missing
    if (title) {
      const intelMatch = title.match(/Intel\s+Core\s+i[3579](?:\-\d{4,5})?|Intel\s+Core\s+Ultra\s+\d(?:\-\d{3})?/i);
      if (intelMatch) return normalizeProcessor(intelMatch[0]);
      
      const amdMatch = title.match(/AMD\s+Ryzen\s+[3579](?:\-\d{4})?/i);
      if (amdMatch) return normalizeProcessor(amdMatch[0]);
      
      const appleMatch = title.match(/Apple\s+M[123](?:\s+(?:Pro|Max|Ultra))?/i);
      if (appleMatch) return normalizeProcessor(appleMatch[0]);
    }
    return 'Not Specified';
  }
  
  // Handle generic processor entries
  if (processor === 'Intel' || processor === 'AMD' || processor === 'Apple') {
    if (title) {
      if (processor === 'Intel' && title.match(/i[3579]/i)) {
        const match = title.match(/Intel\s+Core\s+i[3579](?:\-\d{4,5})?|i[3579](?:\-\d{4,5})?/i);
        if (match) return normalizeProcessor(match[0]);
      } else if (processor === 'AMD' && title.match(/Ryzen/i)) {
        const match = title.match(/AMD\s+Ryzen\s+[3579](?:\-\d{4})?|Ryzen\s+[3579](?:\-\d{4})?/i);
        if (match) return normalizeProcessor(match[0]);
      } else if (processor === 'Apple' && title.match(/M[123]/i)) {
        const match = title.match(/Apple\s+M[123](?:\s+(?:Pro|Max|Ultra))?/i);
        if (match) return normalizeProcessor(match[0]);
      }
    }
  }
  
  // Use normalizeProcessor for consistent display
  return normalizeProcessor(processor);
};

const formatRAM = (ram?: string, title?: string): string => {
  if (!ram || ram === 'Not Specified' || ram === 'N/A') {
    // Try to extract from title if RAM is missing
    if (title) {
      const ramMatch = title.match(/(\d+)\s*GB\s+(?:DDR\d+\s+)?RAM/i);
      if (ramMatch) return `${ramMatch[1]}GB`;
    }
    return 'Not Specified';
  }
  
  // Handle incomplete RAM entries
  if (ram === 'DDR4' || ram === 'DDR5' || ram === 'LPDDR5') {
    if (title) {
      const ramSizeMatch = title.match(/(\d+)\s*GB/i);
      if (ramSizeMatch) return `${ramSizeMatch[1]}GB ${ram}`;
    }
    return ram;
  }
  
  // Try to parse RAM size from string
  const ramSizeMatch = ram.match(/(\d+)\s*GB/i);
  if (ramSizeMatch) {
    // If there's already a size but no type, try to extract type from title
    if (!ram.match(/DDR\d+|LPDDR\d+/i) && title && title.match(/DDR\d+|LPDDR\d+/i)) {
      const ramTypeMatch = title.match(/(DDR\d+|LPDDR\d+)/i);
      if (ramTypeMatch) return `${ramSizeMatch[1]}GB ${ramTypeMatch[1]}`;
    }
  }
  
  return ram;
};

const formatStorage = (storage?: string, title?: string): string => {
  if (!storage || storage === 'Not Specified' || storage === 'N/A') {
    // Try to extract from title if storage is missing
    if (title) {
      const ssdMatch = title.match(/(\d+)\s*(?:TB|GB)\s+(?:SSD|NVMe|PCIe)/i);
      if (ssdMatch) return ssdMatch[0];
    }
    return 'Not Specified';
  }
  
  // Handle incomplete storage entries
  if (storage === 'SSD' || storage === 'HDD' || storage === 'eMMC') {
    if (title) {
      const storageMatch = title.match(/(\d+)\s*(?:TB|GB)/i);
      if (storageMatch) return `${storageMatch[0]} ${storage}`;
    }
    return storage;
  }
  
  return storage;
};

const formatGraphics = (graphics?: string, title?: string): string => {
  if (!graphics || graphics === 'Not Specified' || graphics === 'N/A') {
    // Try to extract from title if graphics is missing
    if (title) {
      const nvidiaMatch = title.match(/NVIDIA\s+(?:GeForce\s+)?(?:RTX|GTX)\s+\d{4}/i);
      if (nvidiaMatch) return nvidiaMatch[0];
      
      const intelMatch = title.match(/Intel\s+(?:Iris\s+Xe|UHD|HD)\s+Graphics/i);
      if (intelMatch) return intelMatch[0];
      
      const amdMatch = title.match(/AMD\s+Radeon(?:\s+RX\s+\d{3,4})?/i);
      if (amdMatch) return amdMatch[0];
    }
    return 'Not Specified';
  }
  
  return graphics;
};

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

  // Performance specs comparison with enhanced formatting
  const performanceSections: ComparisonSection[] = [
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
