import { Product } from "@/types/product";

export const getSpecInfo = (title: string): { emoji: string; tooltip: string } => {
  const specInfoMap: Record<string, { emoji: string; tooltip: string }> = {
    "Rating": {
      emoji: "⭐",
      tooltip: "Average user rating on a scale of 1-5 stars"
    },
    "Rating Count": {
      emoji: "🔢",
      tooltip: "Number of ratings submitted by users"
    },
    "Total Reviews": {
      emoji: "📝",
      tooltip: "Total number of written reviews by users"
    },
    "Wilson Score": {
      emoji: "📊",
      tooltip: "Statistical confidence score that considers both rating value and number of reviews. Higher percentages indicate more reliable ratings."
    },
  };

  return specInfoMap[title] || { emoji: "", tooltip: "" };
};
