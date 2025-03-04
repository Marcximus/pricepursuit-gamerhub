
import React, { useEffect, useState } from "react";
import { Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ConfettiEffect from "./ConfettiEffect";
import type { Product } from "@/types/product";

interface WinnerBadgeProps {
  winner: 'left' | 'right' | 'tie';
  laptopLeft: Product;
  laptopRight: Product;
}

const WinnerBadge: React.FC<WinnerBadgeProps> = ({
  winner,
  laptopLeft,
  laptopRight
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  
  useEffect(() => {
    // Only show confetti when there's a clear winner (not a tie)
    if (winner !== 'tie') {
      setShowConfetti(true);
      
      // Reset after animation
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [winner]);
  
  if (winner === 'tie') {
    return (
      <Badge variant="outline" className="text-lg px-4 py-2 inline-flex items-center gap-2">
        <Award className="w-5 h-5 opacity-70" />
        It's a tie! Both laptops have their strengths.
      </Badge>
    );
  }

  const winnerLabel = winner === 'left'
    ? laptopLeft?.brand + ' ' + (laptopLeft?.model || '')
    : laptopRight?.brand + ' ' + (laptopRight?.model || '');

  return (
    <div className="relative">
      {/* Position confetti effect based on which side won */}
      <div className={`absolute -top-10 ${winner === 'left' ? 'left-0' : 'right-0'}`}>
        <ConfettiEffect isActive={showConfetti} />
      </div>
      <Badge variant="default" className="text-lg px-4 py-2 inline-flex items-center gap-2">
        <Award className="w-5 h-5" />
        Winner: {winnerLabel}
      </Badge>
    </div>
  );
};

export default WinnerBadge;
