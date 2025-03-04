
import React from "react";
import { LightbulbIcon } from "lucide-react";

interface RecommendationProps {
  recommendation: string;
}

const Recommendation: React.FC<RecommendationProps> = ({
  recommendation
}) => {
  return (
    <div className="bg-green-50 p-5 rounded-md mt-6 border border-green-200 shadow-sm">
      <h3 className="font-semibold mb-3 text-green-800 flex items-center gap-2">
        <LightbulbIcon className="w-5 h-5 text-green-600" />
        <span>Our Recommendation</span>
      </h3>
      <p className="text-green-900">{recommendation}</p>
    </div>
  );
};

export default Recommendation;
