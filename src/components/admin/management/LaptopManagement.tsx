
import React from "react";
import { useLaptops } from "@/hooks/useLaptops";
import { useCollectionProgress } from "@/hooks/useCollectionProgress";
import { useStats } from "@/components/admin/stats/StatsContext";
import { UpdateLaptopsSection } from "./";
import { CollectLaptopsSection } from "./";
import { ProcessAISection } from "./";
import { CleanupSection } from "./";

const LaptopManagement: React.FC = () => {
  const { collectLaptops, updateLaptops, processLaptopsAI } = useLaptops();
  const { isCollecting, progress } = useCollectionProgress();
  const { fetchStats } = useStats();

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Laptop Management</h2>
      <div className="space-y-4">
        <UpdateLaptopsSection 
          updateLaptops={updateLaptops} 
          refreshStats={fetchStats} 
        />

        <CollectLaptopsSection 
          collectLaptops={collectLaptops} 
          refreshStats={fetchStats}
          isCollecting={isCollecting}
          progress={progress}
        />
        
        <ProcessAISection 
          processLaptopsAI={processLaptopsAI} 
          refreshStats={fetchStats} 
        />

        <CleanupSection 
          refreshStats={fetchStats} 
        />
      </div>
    </div>
  );
};

export default LaptopManagement;
