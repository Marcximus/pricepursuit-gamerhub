
import React from "react";
import type { Product } from "@/types/product";
import { Badge } from "@/components/ui/badge";

interface LaptopDisplayProps {
  laptop: Product;
  affiliateUrl: string;
  formatPrice: (price?: number) => string;
  isWinner?: boolean;
}

const LaptopDisplay: React.FC<LaptopDisplayProps> = ({ 
  laptop, 
  affiliateUrl, 
  formatPrice,
  isWinner = false
}) => {
  return (
    <div className="flex flex-col items-center">
      {/* Image */}
      <div className="relative mb-4">
        <a 
          href={affiliateUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block"
        >
          <img 
            src={laptop.image_url} 
            alt={laptop.title}
            className="object-contain w-48 h-48"
          />
        </a>
        
        {isWinner && (
          <Badge className="absolute top-0 right-0 bg-yellow-400 text-yellow-900">
            Winner
          </Badge>
        )}
      </div>
      
      {/* Title */}
      <h3 className="text-lg font-semibold text-center mb-2">
        <a 
          href={affiliateUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-primary transition-colors"
        >
          {laptop.brand} {laptop.model}
        </a>
      </h3>
      
      {/* Price */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl font-bold text-primary">
          {formatPrice(laptop.current_price)}
        </span>
        
        {laptop.original_price > laptop.current_price && (
          <span className="text-sm text-muted-foreground line-through">
            {formatPrice(laptop.original_price)}
          </span>
        )}
      </div>
      
      {/* Rating */}
      {laptop.rating > 0 && (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <span className="text-yellow-500">★</span>
          <span>{laptop.rating.toFixed(1)}</span>
          <span>({laptop.rating_count})</span>
        </div>
      )}
    </div>
  );
};

export default LaptopDisplay;
