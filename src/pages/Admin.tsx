
import { toast } from "@/components/ui/use-toast";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw, BrainCircuit, Filter } from "lucide-react";
import { useLaptops } from "@/hooks/useLaptops";
import { cleanupLaptopDatabase } from "@/utils/laptop/cleanupLaptops";

const Admin = () => {
  const { collectLaptops, updateLaptops, processLaptopsAI } = useLaptops();

  const handleCollectLaptops = async () => {
    try {
      console.log('Starting laptop collection process...');
      const result = await collectLaptops();
      console.log('Collection process result:', result);
      
      toast({
        title: "Collection Started",
        description: "Started collecting new laptops. This may take a few minutes.",
      });
    } catch (error) {
      console.error('Error collecting laptops:', error);
      toast({
        title: "Error",
        description: "Failed to start laptop collection",
        variant: "destructive"
      });
    }
  };

  const handleUpdateLaptops = async () => {
    try {
      await updateLaptops();
      toast({
        title: "Update Started",
        description: "Started updating laptop information. This may take a few minutes.",
      });
    } catch (error) {
      console.error('Error updating laptops:', error);
      toast({
        title: "Error",
        description: "Failed to start laptop updates",
        variant: "destructive"
      });
    }
  };

  const handleAIProcess = async () => {
    try {
      const result = await processLaptopsAI();
      if (result.success) {
        toast({
          title: "AI Processing Started",
          description: `Processing initiated for ${result.processed} laptops`,
        });
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

  const handleCleanup = async () => {
    try {
      const result = await cleanupLaptopDatabase();
      if (result.success) {
        toast({
          title: "Cleanup Complete",
          description: `Successfully cleaned up the laptop database. ${result.removedForbiddenKeywords} products with forbidden keywords were removed.`,
        });
      }
    } catch (error) {
      console.error('Error cleaning up laptop database:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to clean up laptop database",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Laptop Management</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium">Update Laptops</h3>
                  <p className="text-sm text-gray-500">Update prices and information for existing laptops</p>
                </div>
                <Button
                  onClick={handleUpdateLaptops}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Update Prices
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium">Discover New Laptops</h3>
                  <p className="text-sm text-gray-500">Search and add new laptops to the database</p>
                </div>
                <Button
                  onClick={handleCollectLaptops}
                  className="flex items-center gap-2"
                >
                  <Search className="h-4 w-4" />
                  Collect New
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium">Process with AI</h3>
                  <p className="text-sm text-gray-500">Use AI to standardize laptop specifications</p>
                </div>
                <Button
                  onClick={handleAIProcess}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <BrainCircuit className="h-4 w-4" />
                  Process with AI
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium">Clean Database</h3>
                  <p className="text-sm text-gray-500">Remove accessories, duplicates and non-laptop products</p>
                </div>
                <Button
                  onClick={handleCleanup}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Clean Database
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
