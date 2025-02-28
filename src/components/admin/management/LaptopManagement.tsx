
import React, { useContext } from "react";
import { useLaptops } from "@/hooks/useLaptops";
import { StatsRefreshContext } from "@/components/admin/LaptopStats";
import { useCollectionProgress } from "@/hooks/useCollectionProgress";
import { UpdateLaptopsSection } from "./";
import { CollectLaptopsSection } from "./";
import { ProcessAISection } from "./";
import { CleanupSection } from "./";

const LaptopManagement: React.FC = () => {
  const { collectLaptops, updateLaptops, processLaptopsAI } = useLaptops();
  const { isCollecting, progress } = useCollectionProgress();
  const refreshStats = useContext(StatsRefreshContext);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Laptop Management</h2>
      <div className="space-y-4">
        <UpdateLaptopsSection 
          updateLaptops={updateLaptops} 
          refreshStats={refreshStats} 
        />

        <CollectLaptopsSection 
          collectLaptops={collectLaptops} 
          refreshStats={refreshStats}
          isCollecting={isCollecting}
          progress={progress}
        />
        
        <ProcessAISection 
          processLaptopsAI={processLaptopsAI} 
          refreshStats={refreshStats} 
        />

        <CleanupSection 
          refreshStats={refreshStats} 
        />
      </div>
    </div>
  );
};

export default LaptopManagement;
