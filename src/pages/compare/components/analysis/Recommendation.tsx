
import React from "react";
import { LightbulbIcon } from "lucide-react";

interface RecommendationProps {
  recommendation: string;
}

const Recommendation: React.FC<RecommendationProps> = ({
  recommendation
}) => {
  return (
    <div className="bg-gradient-to-r from-sky-50 to-red-50 p-5 rounded-md mt-6 border border-slate-200 shadow-sm">
      <h3 className="font-semibold mb-3 text-slate-800 flex items-center gap-2">
        <LightbulbIcon className="w-5 h-5 text-amber-500" />
        <span>💡 Our Recommendation 💡</span>
      </h3>
      <p className="text-slate-700">{recommendation}</p>
    </div>
  );
};

export default Recommendation;
