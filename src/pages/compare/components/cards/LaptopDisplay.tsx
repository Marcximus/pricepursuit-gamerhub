
import React from "react";
import type { Product } from "@/types/product";
import { ArrowUpRight } from "lucide-react";

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
      <div className="text-center mb-6 mt-8 min-h-[10rem] flex items-center justify-center group">
        <a 
          href={affiliateUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="relative overflow-hidden transition-all duration-300 hover:scale-105"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50/0 via-indigo-50/0 to-indigo-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <img 
            src={laptop.image_url || '/placeholder.svg'} 
            alt={laptop.title || 'Laptop'} 
            className="h-40 object-contain mx-auto drop-shadow-md"
          />
        </a>
      </div>
      
      <div className="space-y-3">
        <a 
          href={affiliateUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-blue-600 transition-colors"
        >
          <h3 className="text-lg font-semibold mb-1 tracking-tight">{laptop.brand} {laptop.model}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{laptop.title}</p>
        </a>
      </div>
      
      <div className="mt-auto">
        <a 
          href={affiliateUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block"
        >
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-md shadow-sm border border-blue-100">
            <p className="text-2xl font-bold text-blue-700">{formatPrice(laptop.current_price)}</p>
            {laptop.original_price && laptop.original_price > laptop.current_price && (
              <p className="text-sm text-muted-foreground line-through">{formatPrice(laptop.original_price)}</p>
            )}
          </div>
        </a>
        
        <a 
          href={affiliateUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="mt-3 flex items-center justify-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-md border border-blue-100"
        >
          <span>View Details</span>
          <ArrowUpRight className="h-3 w-3" />
        </a>
      </div>
    </>
  );
};

export default LaptopDisplay;
