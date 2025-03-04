
import React from "react";
import { formatPrice, compareProcessors, compareRAM, compareStorage, comparePrices, compareRatings } from "../utils/comparisonHelpers";
import type { Product } from "@/types/product";
import type { ComparisonSection } from "../types";

interface ComparisonSectionsProps {
  laptopLeft: Product;
  laptopRight: Product;
}

const ComparisonSections: React.FC<ComparisonSectionsProps> = ({ 
  laptopLeft, 
  laptopRight 
}) => {
  // Define comparison sections
  const comparisonSections: ComparisonSection[] = [
    {
      title: 'Brand & Model',
      leftValue: `${laptopLeft?.brand || 'N/A'} ${laptopLeft?.model || ''}`,
      rightValue: `${laptopRight?.brand || 'N/A'} ${laptopRight?.model || ''}`,
    },
    {
      title: 'Processor',
      leftValue: laptopLeft?.processor || 'Not Specified',
      rightValue: laptopRight?.processor || 'Not Specified',
      compare: compareProcessors
    },
    {
      title: 'RAM',
      leftValue: laptopLeft?.ram || 'Not Specified',
      rightValue: laptopRight?.ram || 'Not Specified',
      compare: compareRAM
    },
    {
      title: 'Storage',
      leftValue: laptopLeft?.storage || 'Not Specified',
      rightValue: laptopRight?.storage || 'Not Specified',
      compare: compareStorage
    },
    {
      title: 'Graphics',
      leftValue: laptopLeft?.graphics || 'Not Specified',
      rightValue: laptopRight?.graphics || 'Not Specified',
    },
    {
      title: 'Display',
      leftValue: `${laptopLeft?.screen_size || 'N/A'} ${laptopLeft?.screen_resolution ? `(${laptopLeft.screen_resolution})` : ''}`,
      rightValue: `${laptopRight?.screen_size || 'N/A'} ${laptopRight?.screen_resolution ? `(${laptopRight.screen_resolution})` : ''}`,
    },
    {
      title: 'Price',
      leftValue: formatPrice(laptopLeft?.current_price),
      rightValue: formatPrice(laptopRight?.current_price),
      compare: comparePrices
    },
    {
      title: 'Rating',
      leftValue: laptopLeft?.rating ? `${laptopLeft.rating}/5 (${laptopLeft.rating_count} reviews)` : 'No ratings',
      rightValue: laptopRight?.rating ? `${laptopRight.rating}/5 (${laptopRight.rating_count} reviews)` : 'No ratings',
      compare: compareRatings
    },
  ];
  
  return (
    <>
      {comparisonSections}
    </>
  );
};

export default ComparisonSections;
