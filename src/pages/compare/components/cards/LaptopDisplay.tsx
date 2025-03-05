
import React from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import LaptopImage from "@/components/LaptopImage";
import type { Product } from "@/types/product";

interface LaptopDisplayProps {
  laptop: Product & { displayTitle?: string };
  affiliateUrl: string;
  formatPrice: (price?: number) => string;
}

const LaptopDisplay: React.FC<LaptopDisplayProps> = ({ 
  laptop, 
  affiliateUrl,
  formatPrice 
}) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-none mb-4">
        <AspectRatio ratio={16 / 9} className="bg-slate-100 rounded-md overflow-hidden">
          <LaptopImage 
            src={laptop.image_url || ''} 
            alt={laptop.title || 'Laptop image'} 
            className="object-contain w-full h-full" 
          />
        </AspectRatio>
      </div>
      
      <div className="flex-1">
        <h3 className="text-lg font-bold mb-2 line-clamp-2">
          {laptop.displayTitle || `${laptop.brand || ''} ${laptop.model || ''}`}
        </h3>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {laptop.processor && (
            <span className="inline-block px-2 py-1 bg-slate-100 rounded-full text-xs">
              {laptop.processor}
            </span>
          )}
          {laptop.ram && (
            <span className="inline-block px-2 py-1 bg-slate-100 rounded-full text-xs">
              {laptop.ram}
            </span>
          )}
          {laptop.storage && (
            <span className="inline-block px-2 py-1 bg-slate-100 rounded-full text-xs">
              {laptop.storage}
            </span>
          )}
        </div>
      </div>
      
      <div className="flex-none mt-auto">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-2xl font-bold">
              {formatPrice(laptop.current_price)}
            </span>
            {laptop.original_price && laptop.original_price > laptop.current_price && (
              <span className="text-sm line-through text-muted-foreground">
                {formatPrice(laptop.original_price)}
              </span>
            )}
          </div>
          
          <Button asChild size="sm">
            <a href={affiliateUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center">
              View <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LaptopDisplay;
