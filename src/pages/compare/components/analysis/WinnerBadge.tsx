
import React from "react";
import type { Product } from "@/types/product";

interface WinnerBadgeProps {
  winner: "left" | "right" | "tie";
  laptopLeft: Product;
  laptopRight: Product;
}

const WinnerBadge: React.FC<WinnerBadgeProps> = ({
  winner,
  laptopLeft,
  laptopRight
}) => {
  if (winner === "tie") {
    return (
      <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 bg-gradient-to-r from-sky-100 to-amber-100 text-slate-800 rounded-full border border-slate-200 shadow-sm">
        <span>It's a tie! Both laptops are excellent choices</span>
      </div>
    );
  }
  
  const winningLaptop = winner === "left" ? laptopLeft : laptopRight;
  const themeColors = {
    bg: "bg-green-100",
    text: "text-green-800",
    border: "border-green-200"
  };
  
  return (
    <div className={`inline-flex items-center justify-center gap-2 px-4 py-1.5 ${themeColors.bg} ${themeColors.text} rounded-full border ${themeColors.border} shadow-sm`}>
      <span>🏆</span>
      <span className="font-semibold">Winner: {winningLaptop.brand} {winningLaptop.model}</span>
      <span>🏆</span>
    </div>
  );
};

export default WinnerBadge;
