
import React from "react";
import { formatLaptopDisplayTitle } from "../utils/titleFormatter";
import type { Product } from "@/types/product";

interface LaptopComparisonHeaderProps {
  laptopLeft: Product | null;
  laptopRight: Product | null;
}

const LaptopComparisonHeader: React.FC<LaptopComparisonHeaderProps> = ({
  laptopLeft,
  laptopRight
}) => {
  if (!laptopLeft || !laptopRight) return null;
  
  const leftTitle = formatLaptopDisplayTitle(laptopLeft);
  const rightTitle = formatLaptopDisplayTitle(laptopRight);
  
  return (
    <div className="text-center mb-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-2">
        <span className="text-sky-700">{leftTitle}</span>
        <span className="mx-3 text-gray-400">vs</span>
        <span className="text-amber-700">{rightTitle}</span>
      </h1>
      <p className="text-muted-foreground">
        Detailed laptop comparison with AI-powered analysis
      </p>
    </div>
  );
};

export default LaptopComparisonHeader;
