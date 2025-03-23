
import React from "react";
import { Card } from "@/components/ui/card";
import SpecificationItem from "./SpecificationItem";
import type { Product } from "@/types/product";
import type { ComparisonResult } from "../types";
import { ClipboardList } from "lucide-react";
import { formatLaptopDisplayTitle } from "../utils/titleFormatter";
import { SpecificationTitle } from "./specification";
import SpecificationValue from "./specification/SpecificationValue";
import { calculateBenchmarkScore } from "../utils/benchmark";
import { getSpecInfo } from "../utils/specInfo";

interface SpecificationsSectionProps {
  laptopLeft: Product | null;
  laptopRight: Product | null;
  comparisonResult: ComparisonResult;
}

const SpecificationsSection: React.FC<SpecificationsSectionProps> = ({ 
  laptopLeft, 
  laptopRight,
  comparisonResult 
}) => {
  if (!laptopLeft || !laptopRight || !comparisonResult) return null;
  
  const leftSpecs = comparisonResult.specifications?.left;
  const rightSpecs = comparisonResult.specifications?.right;
  
  // Calculate benchmark scores if not available
  const calculateBenchmarkForLaptop = (laptop: Product): string => {
    if (!laptop) return 'Not available';
    return `${Math.round(calculateBenchmarkScore(laptop) || 0)}/100`;
  };

  // Format Wilson Score to display as a value out of 5
  const formatWilsonScore = (score: number | null | undefined): string => {
    if (score === null || score === undefined || isNaN(Number(score))) return 'Not available';
    return `${Number(score).toFixed(2)}/5`;
  };

  // Compare scores for determining better/worse/equal status
  const compareScores = (left: string, right: string): 'better' | 'worse' | 'equal' | 'unknown' => {
    if (left === 'Not available' || right === 'Not available') return 'unknown';
    
    const [leftValue, leftMax] = left.split('/').map(Number);
    const [rightValue, rightMax] = right.split('/').map(Number);
    
    if (isNaN(leftValue) || isNaN(rightValue)) return 'unknown';
    
    // Normalize to same scale if maximums are different
    const normalizedLeft = leftValue / leftMax;
    const normalizedRight = rightValue / rightMax;
    
    if (normalizedLeft > normalizedRight) return 'better';
    if (normalizedLeft < normalizedRight) return 'worse';
    return 'equal';
  };
  
  // Create specification rows from the AI-provided specifications
  const specRows = [
    { 
      title: 'Brand', 
      leftValue: leftSpecs?.brand || 'Not available', 
      rightValue: rightSpecs?.brand || 'Not available' 
    },
    { 
      title: 'Model', 
      leftValue: leftSpecs?.model || 'Not available', 
      rightValue: rightSpecs?.model || 'Not available' 
    },
    { 
      title: 'Price', 
      leftValue: leftSpecs?.price || 'Not available', 
      rightValue: rightSpecs?.price || 'Not available' 
    },
    { 
      title: 'Operating System', 
      leftValue: leftSpecs?.os || 'Not available', 
      rightValue: rightSpecs?.os || 'Not available' 
    },
    { 
      title: 'Release Year', 
      leftValue: leftSpecs?.releaseYear || 'Not available', 
      rightValue: rightSpecs?.releaseYear || 'Not available' 
    },
    { 
      title: 'Processor', 
      leftValue: leftSpecs?.processor || 'Not available', 
      rightValue: rightSpecs?.processor || 'Not available' 
    },
    { 
      title: 'RAM', 
      leftValue: leftSpecs?.ram || 'Not available', 
      rightValue: rightSpecs?.ram || 'Not available' 
    },
    { 
      title: 'Storage', 
      leftValue: leftSpecs?.storage || 'Not available', 
      rightValue: rightSpecs?.storage || 'Not available' 
    },
    { 
      title: 'Graphics', 
      leftValue: leftSpecs?.graphics || 'Not available', 
      rightValue: rightSpecs?.graphics || 'Not available' 
    },
    { 
      title: 'Screen Size', 
      leftValue: leftSpecs?.screenSize || 'Not available', 
      rightValue: rightSpecs?.screenSize || 'Not available' 
    },
    { 
      title: 'Screen Resolution', 
      leftValue: leftSpecs?.screenResolution || 'Not available', 
      rightValue: rightSpecs?.screenResolution || 'Not available' 
    },
    { 
      title: 'Refresh Rate', 
      leftValue: leftSpecs?.refreshRate || 'Not available', 
      rightValue: rightSpecs?.refreshRate || 'Not available' 
    },
    { 
      title: 'Weight', 
      leftValue: leftSpecs?.weight || 'Not available', 
      rightValue: rightSpecs?.weight || 'Not available' 
    },
    { 
      title: 'Battery Life', 
      leftValue: leftSpecs?.batteryLife || 'Not available', 
      rightValue: rightSpecs?.batteryLife || 'Not available' 
    },
    { 
      title: 'Ports', 
      leftValue: leftSpecs?.ports || 'Not available', 
      rightValue: rightSpecs?.ports || 'Not available' 
    },
    { 
      title: 'Rating', 
      leftValue: leftSpecs?.rating || 'Not available', 
      rightValue: rightSpecs?.rating || 'Not available' 
    },
    { 
      title: 'Rating Count', 
      leftValue: leftSpecs?.ratingCount || 'Not available', 
      rightValue: rightSpecs?.ratingCount || 'Not available' 
    },
    { 
      title: 'Total Reviews', 
      leftValue: leftSpecs?.totalReviews || 'Not available', 
      rightValue: rightSpecs?.totalReviews || 'Not available' 
    },
    { 
      title: 'Wilson Score', 
      leftValue: formatWilsonScore(laptopLeft.wilson_score), 
      rightValue: formatWilsonScore(laptopRight.wilson_score),
      compare: compareScores
    },
    { 
      title: 'Benchmark Score', 
      leftValue: leftSpecs?.benchmarkScore || calculateBenchmarkForLaptop(laptopLeft),
      rightValue: rightSpecs?.benchmarkScore || calculateBenchmarkForLaptop(laptopRight),
      compare: compareScores
    }
  ];
  
  return (
    <Card>
      <div className="bg-muted p-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <ClipboardList className="w-5 h-5" />
          Detailed Specifications
        </h2>
      </div>
      
      <div className="divide-y">
        <div className="grid grid-cols-7 p-4 bg-slate-50 font-medium">
          <div className="col-span-3 text-left">Specification</div>
          <div className="col-span-2 text-left text-sky-700">
            {formatLaptopDisplayTitle(laptopLeft)}
          </div>
          <div className="col-span-2 text-left text-amber-700">
            {formatLaptopDisplayTitle(laptopRight)}
          </div>
        </div>
        {specRows.map((specRow, index) => (
          <div key={index} className="grid grid-cols-7 p-4 hover:bg-gray-50 transition-colors">
            <SpecificationTitle title={specRow.title} />
            <SpecificationValue 
              value={specRow.leftValue} 
              comparison={specRow.compare ? specRow.compare(specRow.leftValue, specRow.rightValue) : undefined} 
            />
            <SpecificationValue 
              value={specRow.rightValue} 
              comparison={specRow.compare ? specRow.compare(specRow.rightValue, specRow.leftValue) : undefined} 
            />
          </div>
        ))}
      </div>
    </Card>
  );
};

export default SpecificationsSection;
