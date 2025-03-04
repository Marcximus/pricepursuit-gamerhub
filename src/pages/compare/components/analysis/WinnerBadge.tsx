
import React from "react";
import { Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
    <Badge variant="default" className="text-lg px-4 py-2 inline-flex items-center gap-2">
      <Award className="w-5 h-5" />
      Winner: {winnerLabel}
    </Badge>
  );
};

export default WinnerBadge;
