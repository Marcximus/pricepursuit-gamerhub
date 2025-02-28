
import React from "react";
import { toast } from "@/components/ui/use-toast";
import { Search } from "lucide-react";
import ManagementCard from "./ManagementCard";
import { CollectionProgress } from "@/components/admin/stats/CollectionProgress";

interface CollectLaptopsSectionProps {
  collectLaptops: () => Promise<any>;
  refreshStats: () => Promise<void>;
  isCollecting: boolean;
  progress: any;
}

const CollectLaptopsSection: React.FC<CollectLaptopsSectionProps> = ({
  collectLaptops,
  refreshStats,
  isCollecting,
  progress
}) => {
  const handleCollectLaptops = async () => {
    try {
      console.log('Collect New button clicked');
      console.log('Starting laptop collection process...');
      
      // Log what's available in the useLaptops hook
      console.log('collectLaptops function from useLaptops:', typeof collectLaptops);
      
      const result = await collectLaptops();
      console.log('Collection process result:', result);
      
      if (result) {
        toast({
          title: "Collection Started",
          description: "Started collecting new laptops. This may take a few minutes.",
        });
        // Refresh stats immediately to show user progress has begun
        await refreshStats();
      } else {
        console.log('Collection process returned null (possibly already in progress)');
      }
    } catch (error) {
      console.error('Error collecting laptops:', error);
      console.error('Error stack:', error.stack);
      toast({
        title: "Error",
        description: "Failed to start laptop collection: " + (error.message || "Unknown error"),
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <ManagementCard
        title="Discover New Laptops"
        description="Search and add new laptops to the database"
        icon={Search}
        buttonText={isCollecting ? 'Collection in Progress...' : 'Collect New'}
        onClick={handleCollectLaptops}
        disabled={isCollecting}
        variant="default"
      />
      
      {/* Collection Progress Component */}
      <CollectionProgress isCollecting={isCollecting} progress={progress} />
    </>
  );
};

export default CollectLaptopsSection;
