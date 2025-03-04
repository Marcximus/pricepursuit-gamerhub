
import React from "react";
import { DollarSign } from "lucide-react";

interface ValueForMoneyProps {
  laptopName: string;
  valueAssessment: string;
  colorTheme?: "blue" | "red";
}

const ValueForMoney: React.FC<ValueForMoneyProps> = ({
  laptopName,
  valueAssessment,
  colorTheme = "blue"
}) => {
  // Define colors based on theme
  const themeColors = {
    blue: {
      bg: "bg-sky-50",
      border: "border-sky-200",
      heading: "text-sky-800",
      text: "text-sky-900"
    },
    red: {
      bg: "bg-red-50",
      border: "border-red-200", 
      heading: "text-red-800",
      text: "text-red-900"
    }
  };
  
  const colors = themeColors[colorTheme];
  
  return (
    <div className={`${colors.bg} p-4 rounded-lg border ${colors.border}`}>
      <h3 className={`font-semibold mb-2 ${colors.heading} flex items-center gap-2`}>
        <DollarSign className="w-4 h-4" /> Value for Money {colorTheme === "blue" ? "💙" : "❤️"}
      </h3>
      <p className={colors.text}>{valueAssessment}</p>
    </div>
  );
};

export default ValueForMoney;
