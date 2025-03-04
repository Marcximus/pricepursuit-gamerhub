
import React from "react";
import { Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Product } from "@/types/product";

interface LaptopCardProps {
  laptop: Product;
  isWinner: boolean;
  formatPrice: (price: number | null | undefined) => string;
}

const LaptopCard: React.FC<LaptopCardProps> = ({ 
  laptop, 
  isWinner,
  formatPrice 
}) => {
  return (
    <Card className="p-6 flex flex-col items-center relative">
      {isWinner && (
        <div className="absolute top-4 right-4">
          <Trophy className="w-6 h-6 text-yellow-500 fill-yellow-500" />
        </div>
      )}
      <div className="w-48 h-48 flex items-center justify-center mb-4">
        <img 
          src={laptop?.image_url || '/placeholder.svg'} 
          alt={laptop?.title || 'Laptop'} 
          className="max-w-full max-h-full object-contain"
        />
      </div>
      <h2 className="text-lg font-semibold text-center">
        {laptop?.title || 'Laptop'}
      </h2>
      <div className="mt-2 text-xl font-bold text-center">
        {formatPrice(laptop?.current_price)}
      </div>
    </Card>
  );
};

export default LaptopCard;
