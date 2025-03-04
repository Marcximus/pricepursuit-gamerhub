
import React from "react";
import type { Product } from "@/types/product";
import { ArrowUpRight, Zap } from "lucide-react";

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
          <div className="bg-slate-900 p-4 rounded-lg shadow-md border border-slate-800 transition-transform hover:scale-[1.02]">
            <p className="text-2xl font-bold text-white flex items-center justify-between">
              {formatPrice(laptop.current_price)}
              <Zap className="w-5 h-5 text-blue-400" />
            </p>
            {laptop.original_price && laptop.original_price > laptop.current_price && (
              <p className="text-sm text-slate-400 line-through">{formatPrice(laptop.original_price)}</p>
            )}
          </div>
        </a>
        
        <a 
          href={affiliateUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="mt-3 flex items-center justify-center gap-1 text-sm text-slate-200 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-md border border-slate-700"
        >
          <span>Tech Specs</span>
          <ArrowUpRight className="h-3 w-3" />
        </a>
      </div>
    </>
  );
};

export default LaptopDisplay;
