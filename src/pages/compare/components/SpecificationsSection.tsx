
import React from "react";
import { Card } from "@/components/ui/card";
import SpecificationItem from "./SpecificationItem";
import ComparisonSections from "./ComparisonSections";
import type { Product } from "@/types/product";
import type { ComparisonSection } from "../types";
import { ClipboardList } from "lucide-react";

interface SpecificationsSectionProps {
  laptopLeft: Product | null;
  laptopRight: Product | null;
  enhancedSpecsLeft: Record<string, any> | null;
  enhancedSpecsRight: Record<string, any> | null;
}

const SpecificationsSection: React.FC<SpecificationsSectionProps> = ({ 
  laptopLeft, 
  laptopRight,
  enhancedSpecsLeft,
  enhancedSpecsRight
}) => {
  // Merge enhanced data with existing data to get the best of both
  const mergedLeftData = mergeProductData(laptopLeft, enhancedSpecsLeft);
  const mergedRightData = mergeProductData(laptopRight, enhancedSpecsRight);
  
  // Get comparison sections with the merged data
  const comparisonSections = ComparisonSections({ 
    laptopLeft: mergedLeftData, 
    laptopRight: mergedRightData,
    enhancedSpecsLeft,
    enhancedSpecsRight
  });
  
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
            {laptopLeft?.brand} {laptopLeft?.model?.substring(0, 20)}{laptopLeft?.model && laptopLeft.model.length > 20 ? "..." : ""}
          </div>
          <div className="col-span-2 text-left text-amber-700">
            {laptopRight?.brand} {laptopRight?.model?.substring(0, 20)}{laptopRight?.model && laptopRight.model.length > 20 ? "..." : ""}
          </div>
        </div>
        {comparisonSections.map((section, index) => (
          <SpecificationItem 
            key={index} 
            section={section} 
            laptopLeftId={laptopLeft?.asin} 
            laptopRightId={laptopRight?.asin}
          />
        ))}
      </div>
    </Card>
  );
};

// Merge data from the database with enhanced data from the API
function mergeProductData(product: Product | null, enhancedSpecs: Record<string, any> | null): Product | null {
  if (!product) return null;
  if (!enhancedSpecs) return product;
  
  const mergedProduct = { ...product };
  
  // Enhanced processor information
  if (enhancedSpecs.processor && (!product.processor || product.processor === 'Intel' || product.processor === 'AMD')) {
    mergedProduct.processor = enhancedSpecs.processor;
  }
  
  // Enhanced RAM information
  if (enhancedSpecs.ram && (!product.ram || product.ram === 'DDR4' || product.ram === 'DDR5')) {
    mergedProduct.ram = enhancedSpecs.ram;
  }
  
  // Enhanced storage information
  if (enhancedSpecs.storage && (!product.storage || product.storage.includes('Unknown'))) {
    mergedProduct.storage = enhancedSpecs.storage;
  }
  
  // Enhanced graphics information
  if (enhancedSpecs.graphics && (!product.graphics || product.graphics === 'Integrated' || product.graphics === 'Dedicated')) {
    mergedProduct.graphics = enhancedSpecs.graphics;
  }
  
  // Enhanced screen information
  if (enhancedSpecs.screen_size && !product.screen_size) {
    mergedProduct.screen_size = enhancedSpecs.screen_size;
  }
  
  if (enhancedSpecs.screen_resolution && !product.screen_resolution) {
    mergedProduct.screen_resolution = enhancedSpecs.screen_resolution;
  }
  
  // Enhanced weight information
  if (enhancedSpecs.weight && !product.weight) {
    mergedProduct.weight = enhancedSpecs.weight;
  }
  
  // Enhanced battery information
  if (enhancedSpecs.battery && !product.battery_life) {
    mergedProduct.battery_life = enhancedSpecs.battery;
  }
  
  return mergedProduct;
}

export default SpecificationsSection;
