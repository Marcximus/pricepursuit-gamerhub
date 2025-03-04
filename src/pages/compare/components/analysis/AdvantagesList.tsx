
import React from "react";
import { Check, ThumbsUp, Zap, Award, Star, Sparkles } from "lucide-react";
import type { Product } from "@/types/product";

interface AdvantagesListProps {
  laptopName: string;
  advantages: string[];
  colorTheme?: "blue" | "yellow";
}

const AdvantagesList: React.FC<AdvantagesListProps> = ({
  laptopName,
  advantages,
  colorTheme = "blue"
}) => {
  // Define colors based on theme
  const themeColors = {
    blue: {
      bg: "bg-sky-50",
      border: "border-sky-200",
      heading: "text-sky-800",
      icon: "text-sky-600"
    },
    yellow: {
      bg: "bg-amber-50",
      border: "border-amber-200", 
      heading: "text-amber-800",
      icon: "text-amber-600"
    }
  };
  
  const colors = themeColors[colorTheme];
  
  // Array of emoji icons to randomly select from
  const emojiIcons = [
    <ThumbsUp className={`w-5 h-5 ${colors.icon} shrink-0 mt-0.5`} />,
    <Zap className={`w-5 h-5 ${colors.icon} shrink-0 mt-0.5`} />,
    <Award className={`w-5 h-5 ${colors.icon} shrink-0 mt-0.5`} />,
    <Star className={`w-5 h-5 ${colors.icon} shrink-0 mt-0.5`} />,
    <Sparkles className={`w-5 h-5 ${colors.icon} shrink-0 mt-0.5`} />,
    <Check className={`w-5 h-5 ${colors.icon} shrink-0 mt-0.5`} />
  ];
  
  // Get a random emoji icon
  const getRandomIcon = () => {
    const randomIndex = Math.floor(Math.random() * emojiIcons.length);
    return emojiIcons[randomIndex];
  };
  
  return (
    <div className={`${colors.bg} p-4 rounded-lg border ${colors.border}`}>
      <h3 className={`font-semibold mb-3 ${colors.heading} flex items-center gap-2`}>
        {colorTheme === "blue" ? "🔵" : "🟡"} {laptopName} Advantages
      </h3>
      <ul className="space-y-2">
        {advantages.map((advantage, index) => (
          <li key={index} className="flex items-start gap-2">
            {getRandomIcon()}
            <span>{advantage}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdvantagesList;
