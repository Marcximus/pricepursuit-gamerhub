import React from "react";
import { TrendingUp, Sparkles } from "lucide-react";
import ComparisonHistoryCard from "./ComparisonHistoryCard";
import { mockRecentComparisons } from "../mockComparisonData";

const RecentComparisons: React.FC = () => {
  return (
    <div className="mt-16 animate-in fade-in-50 duration-700">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 mb-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 backdrop-blur-sm">
            <TrendingUp className="h-6 w-6 text-primary animate-pulse" />
          </div>
          <Sparkles className="h-5 w-5 text-yellow-500" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3 bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text">
          Trending Comparisons
        </h2>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto">
          Discover how top laptops stack up against each other. Real comparisons from our community.
        </p>
      </div>
      
      <div className="grid gap-6">
        {mockRecentComparisons.map((comparison, index) => (
          <div 
            key={comparison.id} 
            className="animate-in fade-in-50 slide-in-from-bottom-4"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <ComparisonHistoryCard comparison={comparison} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentComparisons;
