
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

// Format a better display title for laptops
const formatLaptopTitle = (laptop: Product): string => {
  const brand = laptop.brand || '';
  const model = laptop.model || '';
  const title = laptop.title || '';
  
  // If we have both brand and model, use them
  if (brand && model && model !== 'Laptop' && model !== brand) {
    return `${brand} ${model}`;
  }
  
  // If model is missing or generic, try to extract key information from title
  if (title) {
    // For LG Gram laptops
    if (brand === 'LG' && title.toLowerCase().includes('gram')) {
      const sizeMatch = title.match(/gram\s+(\d+(?:\.\d+)?)/i);
      if (sizeMatch) {
        return `LG Gram ${sizeMatch[1]}"`;
      }
    }
    
    // For Microsoft Surface
    if (brand === 'Microsoft' && title.toLowerCase().includes('surface')) {
      const surfaceMatch = title.match(/\b(Surface\s+(?:Pro|Go|Laptop|Book|Studio))\s*(\d+)?/i);
      if (surfaceMatch) {
        return surfaceMatch[2] 
          ? `Microsoft ${surfaceMatch[1]} ${surfaceMatch[2]}` 
          : `Microsoft ${surfaceMatch[1]}`;
      }
    }
    
    // Extract the first significant part of the title (up to 40 chars)
    const cleanTitle = title
      .replace(brand, '') // Remove brand name
      .replace(/laptop|notebook/i, '') // Remove generic terms
      .trim()
      .replace(/^[,\s:-]+/, '') // Remove leading separators
      .trim();
      
    if (cleanTitle) {
      // Get first 40 chars or first sentence, whichever is shorter
      const shortTitle = cleanTitle.split(/[,;.]/).shift()?.trim() || cleanTitle;
      return brand ? `${brand} ${shortTitle.substring(0, 40)}` : shortTitle.substring(0, 40);
    }
  }
  
  // Fallback to brand + generic description
  return brand ? `${brand} Laptop` : 'Laptop';
};

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
  const displayTitle = formatLaptopTitle(laptop);
  
  return (
    <Card ref={cardRef} className="p-4 h-full flex flex-col relative">
      {/* Confetti effect for winner */}
      <ConfettiEffect isActive={isWinner} containerRef={cardRef} />
      
      {/* Winner badge */}
      <WinnerBadge isVisible={isWinner} />
      
      {/* Laptop display with image, details and price */}
      <LaptopDisplay 
        laptop={{...laptop, displayTitle}} 
        affiliateUrl={affiliateUrl} 
        formatPrice={formatPrice} 
      />
    </Card>
  );
};

export default LaptopCard;
