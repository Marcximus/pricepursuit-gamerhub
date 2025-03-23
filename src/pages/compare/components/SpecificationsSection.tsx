
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
  comparisonResult: ComparisonResult | null;
}

const SpecificationsSection: React.FC<SpecificationsSectionProps> = ({ 
  laptopLeft, 
  laptopRight,
  comparisonResult 
}) => {
  if (!comparisonResult || !comparisonResult.specifications) {
    return null;
  }

  const leftSpecs = comparisonResult.specifications.left;
  const rightSpecs = comparisonResult.specifications.right;
  
  // Define all the specifications we want to display in order
  const specsList = [
    { title: "Brand", leftValue: leftSpecs.brand, rightValue: rightSpecs.brand },
    { title: "Model", leftValue: leftSpecs.model, rightValue: rightSpecs.model },
    { title: "Price", leftValue: leftSpecs.price, rightValue: rightSpecs.price },
    { title: "OS", leftValue: leftSpecs.os, rightValue: rightSpecs.os },
    { title: "Release Year", leftValue: leftSpecs.releaseYear, rightValue: rightSpecs.releaseYear },
    { title: "Processor", leftValue: leftSpecs.processor, rightValue: rightSpecs.processor },
    { title: "RAM", leftValue: leftSpecs.ram, rightValue: rightSpecs.ram },
    { title: "Storage", leftValue: leftSpecs.storage, rightValue: rightSpecs.storage },
    { title: "Graphics", leftValue: leftSpecs.graphics, rightValue: rightSpecs.graphics },
    { title: "Screen Size", leftValue: leftSpecs.screenSize, rightValue: rightSpecs.screenSize },
    { title: "Screen Resolution", leftValue: leftSpecs.screenResolution, rightValue: rightSpecs.screenResolution },
    { title: "Refresh Rate", leftValue: leftSpecs.refreshRate, rightValue: rightSpecs.refreshRate },
    { title: "Weight", leftValue: leftSpecs.weight, rightValue: rightSpecs.weight },
    { title: "Battery Life", leftValue: leftSpecs.batteryLife, rightValue: rightSpecs.batteryLife },
    { title: "Ports", leftValue: leftSpecs.ports, rightValue: rightSpecs.ports },
    { title: "Rating", leftValue: leftSpecs.rating, rightValue: rightSpecs.rating },
    { title: "Rating Count", leftValue: leftSpecs.ratingCount, rightValue: rightSpecs.ratingCount },
    { title: "Total Reviews", leftValue: leftSpecs.totalReviews, rightValue: rightSpecs.totalReviews },
    { title: "Wilson Score", leftValue: leftSpecs.wilsonScore, rightValue: rightSpecs.wilsonScore },
    { title: "Benchmark Score", leftValue: leftSpecs.benchmarkScore, rightValue: rightSpecs.benchmarkScore }
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
        {specsList.map((spec, index) => (
          <SpecificationItem 
            key={index} 
            section={{
              title: spec.title,
              leftValue: spec.leftValue,
              rightValue: spec.rightValue
            }}
            laptopLeftId={laptopLeft?.asin} 
            laptopRightId={laptopRight?.asin}
          />
        ))}
      </div>
    </Card>
  );
};

export default SpecificationsSection;
