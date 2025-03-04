
import React from "react";

interface RecommendationProps {
  recommendation: string;
}

const Recommendation: React.FC<RecommendationProps> = ({
  recommendation
}) => {
  return (
    <div className="bg-slate-50 p-4 rounded-md mt-6">
      <h3 className="font-semibold mb-2">Recommendation</h3>
      <p>{recommendation}</p>
    </div>
  );
};

export default Recommendation;
