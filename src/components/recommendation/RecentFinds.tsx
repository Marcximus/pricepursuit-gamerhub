import React from "react";
import { Laptop, Sparkles } from "lucide-react";
import RecentFindsCard from "./RecentFindsCard";
import { mockRecentFinds } from "./mockRecommendationData";

const RecentFinds: React.FC = () => {
  return (
    <div className="mt-16 animate-in fade-in-50 duration-700">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 mb-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 backdrop-blur-sm">
            <Laptop className="h-6 w-6 text-primary animate-pulse" />
          </div>
          <Sparkles className="h-5 w-5 text-yellow-500" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3 bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text">
          Recent Personal Finds
        </h2>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto">
          See what laptops others discovered with our recommendation wizard
        </p>
      </div>
      
      <div className="grid gap-6">
        {mockRecentFinds.map((find, index) => (
          <div 
            key={find.id} 
            className="animate-in fade-in-50 slide-in-from-bottom-4"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <RecentFindsCard find={find} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentFinds;
