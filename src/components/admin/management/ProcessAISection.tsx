
import React from "react";
import { toast } from "@/components/ui/use-toast";
import { BrainCircuit } from "lucide-react";
import ManagementCard from "./ManagementCard";

interface ProcessAISectionProps {
  processLaptopsAI: () => Promise<any>;
  refreshStats: () => Promise<void>;
}

const ProcessAISection: React.FC<ProcessAISectionProps> = ({
  processLaptopsAI,
  refreshStats
}) => {
  const handleAIProcess = async () => {
    try {
      const result = await processLaptopsAI();
      if (result.success) {
        toast({
          title: "AI Processing Started",
          description: `Processing initiated for ${result.processed} laptops`,
        });
        // Refresh stats immediately after AI processing request
        await refreshStats();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to start AI processing",
        });
      }
    } catch (error) {
      console.error('Error processing laptops with AI:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process laptops with AI",
      });
    }
  };

  return (
    <ManagementCard
      title="Process with AI"
      description="Use AI to standardize laptop specifications"
      icon={BrainCircuit}
      buttonText="Process with AI"
      onClick={handleAIProcess}
      variant="outline"
    />
  );
};

export default ProcessAISection;
