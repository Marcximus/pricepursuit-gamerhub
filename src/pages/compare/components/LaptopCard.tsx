
import React, { useRef } from "react";
import { Card } from "@/components/ui/card";
import type { Product } from "@/types/product";
import ConfettiEffect from "./cards/ConfettiEffect";
import WinnerBadge from "./cards/WinnerBadge";
import LaptopDisplay from "./cards/LaptopDisplay";
import { getAffiliateUrl } from "../utils/affiliateUtils";

interface LaptopCardProps {
  laptop: Product | null;
  isWinner: boolean;
  formatPrice: (price?: number) => string;
}

const LaptopCard: React.FC<LaptopCardProps> = ({ laptop, isWinner, formatPrice }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  if (!laptop) {
    return (
      <Card className="p-4 h-full flex flex-col">
        <div className="text-center p-8 text-muted-foreground">
          No laptop selected
        </div>
      </Card>
    );
  }
  
  const affiliateUrl = getAffiliateUrl(laptop);
  
  return (
    <Card ref={cardRef} className="p-4 h-full flex flex-col relative">
      {/* Confetti effect for winner */}
      <ConfettiEffect isActive={isWinner} containerRef={cardRef} />
      
      {/* Winner badge */}
      <WinnerBadge isVisible={isWinner} />
      
      {/* Laptop display with image, details and price */}
      <LaptopDisplay 
        laptop={laptop} 
        affiliateUrl={affiliateUrl} 
        formatPrice={formatPrice} 
      />
    </Card>
  );
};

export default LaptopCard;
