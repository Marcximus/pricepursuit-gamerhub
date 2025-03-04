
import React from "react";
import type { Product } from "@/types/product";

interface LaptopDisplayProps {
  laptop: Product;
  affiliateUrl: string;
  formatPrice: (price?: number) => string;
}

const LaptopDisplay: React.FC<LaptopDisplayProps> = ({ 
  laptop, 
  affiliateUrl,
  formatPrice 
}) => {
  return (
    <>
      <div className="text-center mb-4 mt-8 min-h-[10rem] flex items-center justify-center">
        <a 
          href={affiliateUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:opacity-90 transition-opacity"
        >
          <img 
            src={laptop.image_url || '/placeholder.svg'} 
            alt={laptop.title || 'Laptop'} 
            className="h-40 object-contain mx-auto"
          />
        </a>
      </div>
      
      <h3 className="text-lg font-semibold mb-1">{laptop.brand} {laptop.model}</h3>
      <p className="text-sm text-muted-foreground mb-2">{laptop.title}</p>
      
      <div className="mt-auto pt-4">
        <a 
          href={affiliateUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-blue-600 transition-colors"
        >
          <p className="text-2xl font-bold">{formatPrice(laptop.current_price)}</p>
          {laptop.original_price && laptop.original_price > laptop.current_price && (
            <p className="text-sm text-muted-foreground line-through">{formatPrice(laptop.original_price)}</p>
          )}
        </a>
      </div>
    </>
  );
};

export default LaptopDisplay;
