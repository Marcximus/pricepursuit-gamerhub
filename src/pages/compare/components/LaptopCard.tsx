
import React, { useRef } from "react";
import { Card } from "@/components/ui/card";
import type { Product } from "@/types/product";
import ConfettiEffect from "./cards/ConfettiEffect";
import WinnerBadge from "./cards/WinnerBadge";
import LaptopDisplay from "./cards/LaptopDisplay";
import { getAffiliateUrl } from "../utils/affiliateUtils";

interface LaptopCardProps {
  laptop: Product | null;
  side: "left" | "right";
  winner: "left" | "right" | "tie" | null;
}

const LaptopCard: React.FC<LaptopCardProps> = ({ laptop, side, winner }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const isWinner = winner === side;
  
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

  // Format price with currency symbol
  const formatPrice = (price?: number): string => {
    if (!price) return "N/A";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
  };
  
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
        isWinner={isWinner}
      />
    </Card>
  );
};

export default LaptopCard;
