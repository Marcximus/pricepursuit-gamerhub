
import React from "react";
import { Trophy } from "lucide-react";

interface WinnerBadgeProps {
  isVisible: boolean;
}

const WinnerBadge: React.FC<WinnerBadgeProps> = ({ isVisible }) => {
  if (!isVisible) return null;
  
  return (
    <div className="absolute top-3 left-3 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full flex items-center gap-1 text-sm font-medium shadow-sm animate-fade-in">
      <Trophy className="w-4 h-4" />
      Winner
    </div>
  );
};

export default WinnerBadge;
