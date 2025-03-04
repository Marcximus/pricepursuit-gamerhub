
import React from "react";
import { Check } from "lucide-react";
import type { Product } from "@/types/product";

interface AdvantagesListProps {
  laptopName: string;
  advantages: string[];
}

const AdvantagesList: React.FC<AdvantagesListProps> = ({
  laptopName,
  advantages
}) => {
  return (
    <div>
      <h3 className="font-semibold mb-3">{laptopName} Advantages</h3>
      <ul className="space-y-2">
        {advantages.map((advantage, index) => (
          <li key={index} className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <span>{advantage}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdvantagesList;
