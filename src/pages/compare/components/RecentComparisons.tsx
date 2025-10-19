import React from "react";
import { TrendingUp } from "lucide-react";
import ComparisonHistoryCard from "./ComparisonHistoryCard";
import { mockRecentComparisons } from "../mockComparisonData";

const RecentComparisons: React.FC = () => {
  return (
    <div className="mt-12 animate-in fade-in-50 duration-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <TrendingUp className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Recent Comparisons</h2>
          <p className="text-sm text-muted-foreground">See what others are comparing</p>
        </div>
      </div>
      
      <div className="grid gap-6">
        {mockRecentComparisons.map((comparison) => (
          <ComparisonHistoryCard key={comparison.id} comparison={comparison} />
        ))}
      </div>
    </div>
  );
};

export default RecentComparisons;
