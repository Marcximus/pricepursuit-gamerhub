
import React from "react";

interface RecommendationProps {
  recommendation: string;
}

const Recommendation: React.FC<RecommendationProps> = ({
  recommendation
}) => {
  return (
    <div className="bg-green-50 p-5 rounded-md mt-6 border border-green-200 shadow-sm">
      <h3 className="font-semibold mb-3 text-green-800 flex items-center gap-2">
        <span>✅</span>
        <span>Our Recommendation</span>
        <span>💡</span>
      </h3>
      <p className="text-green-900">{recommendation}</p>
    </div>
  );
};

export default Recommendation;
