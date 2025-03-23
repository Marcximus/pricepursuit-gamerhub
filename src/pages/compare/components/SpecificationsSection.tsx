
import React from "react";
import { Card } from "@/components/ui/card";
import SpecificationItem from "./SpecificationItem";
import type { Product } from "@/types/product";
import type { ComparisonResult } from "../types";
import { ClipboardList } from "lucide-react";
import { formatLaptopDisplayTitle } from "../utils/titleFormatter";

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
      leftValue: leftSpecs?.wilsonScore || 'Not available', 
      rightValue: rightSpecs?.wilsonScore || 'Not available' 
    },
    { 
      title: 'Benchmark Score', 
      leftValue: leftSpecs?.benchmarkScore || 'Not available', 
      rightValue: rightSpecs?.benchmarkScore || 'Not available' 
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
          <SpecificationItem 
            key={index} 
            section={specRow} 
            laptopLeftId={laptopLeft?.asin} 
            laptopRightId={laptopRight?.asin}
          />
        ))}
      </div>
    </Card>
  );
};

export default SpecificationsSection;
