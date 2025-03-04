
import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import type { Product } from "@/types/product";
import ConfettiEffect from "./analysis/ConfettiEffect";

interface LaptopCardProps {
  laptop: Product | null;
  isWinner: boolean;
  formatPrice: (price?: number) => string;
}

const LaptopCard: React.FC<LaptopCardProps> = ({ laptop, isWinner, formatPrice }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  
  useEffect(() => {
    if (isWinner) {
      setShowConfetti(true);
      
      // Reset after animation (4 seconds)
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [isWinner]);
  
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
    <Card className="p-4 h-full flex flex-col relative">
      {/* Confetti effect positioned over the winning laptop */}
      {isWinner && <ConfettiEffect isActive={showConfetti} />}
      
      {/* Winner badge positioned absolutely to not affect layout */}
      {isWinner && (
        <div className="absolute top-3 left-3 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full flex items-center gap-1 text-sm font-medium shadow-sm">
          <Trophy className="w-4 h-4" />
          Winner
        </div>
      )}
      
      {/* Add min-height to ensure consistent image area regardless of winner badge */}
      <div className="text-center mb-4 mt-8 min-h-[10rem] flex items-center justify-center">
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
