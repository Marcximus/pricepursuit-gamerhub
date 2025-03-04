
import React from "react";
import { Card } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import type { Product } from "@/types/product";

interface LaptopCardProps {
  laptop: Product | null;
  isWinner: boolean;
  formatPrice: (price?: number) => string;
}

const LaptopCard: React.FC<LaptopCardProps> = ({ laptop, isWinner, formatPrice }) => {
  if (!laptop) {
    return (
      <Card className="p-4 h-full flex flex-col">
        <div className="text-center p-8 text-muted-foreground">
          No laptop selected
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="p-4 h-full flex flex-col">
      {isWinner && (
        <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full self-start flex items-center gap-1 text-sm font-medium mb-3">
          <Trophy className="w-4 h-4" />
          Winner
        </div>
      )}
      
      <div className="text-center mb-4">
        <img 
          src={laptop.image_url || '/placeholder.svg'} 
          alt={laptop.title || 'Laptop'} 
          className="h-40 object-contain mx-auto"
        />
      </div>
      
      <h3 className="text-lg font-semibold mb-1">{laptop.brand} {laptop.model}</h3>
      <p className="text-sm text-muted-foreground mb-2">{laptop.title}</p>
      
      <div className="mt-auto pt-4">
        <p className="text-2xl font-bold">{formatPrice(laptop.current_price)}</p>
        {laptop.original_price && laptop.original_price > laptop.current_price && (
          <p className="text-sm text-muted-foreground line-through">{formatPrice(laptop.original_price)}</p>
        )}
      </div>
    </Card>
  );
};

export default LaptopCard;
