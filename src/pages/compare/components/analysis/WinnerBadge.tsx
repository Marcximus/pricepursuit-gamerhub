
import React from "react";
import { Trophy } from "lucide-react";
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
        <span>🤝 It's a tie! Both laptops are excellent choices</span>
      </div>
    );
  }
  
  const winningLaptop = winner === "left" ? laptopLeft : laptopRight;
  const colorTheme = winner === "left" ? "blue" : "yellow";
  
  const themeColors = {
    blue: {
      bg: "bg-sky-100",
      text: "text-sky-800",
      icon: "text-sky-600",
      border: "border-sky-200"
    },
    yellow: {
      bg: "bg-amber-100",
      text: "text-amber-800",
      icon: "text-amber-600",
      border: "border-amber-200"
    }
  };
  
  const colors = themeColors[colorTheme];
  
  return (
    <div className={`inline-flex items-center justify-center gap-2 px-4 py-1.5 ${colors.bg} ${colors.text} rounded-full border ${colors.border} shadow-sm`}>
      <Trophy className={`w-4 h-4 ${colors.icon}`} />
      <span className="font-semibold">🏆 Winner: {winningLaptop.brand} {winningLaptop.model} 🏆</span>
    </div>
  );
};

export default WinnerBadge;
