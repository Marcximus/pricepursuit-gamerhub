
import { toast } from "@/components/ui/use-toast";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { MagnifyingGlassIcon, UpdateIcon } from "@radix-ui/react-icons";
import { collectLaptops, updateLaptops, refreshBrandModels } from "@/utils/laptop";

const Admin = () => {
  const handleCollectLaptops = async () => {
    try {
      await collectLaptops();
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
    } catch (error) {
      console.error('Error updating laptops:', error);
      toast({
        title: "Error",
        description: "Failed to start laptop updates",
        variant: "destructive"
      });
    }
  };

  const handleRefreshBrandModels = async () => {
    try {
      await refreshBrandModels();
      toast({
        title: "Success",
        description: "Started refreshing brand models",
      });
    } catch (error) {
      console.error('Error refreshing brand models:', error);
      toast({
        title: "Error",
        description: "Failed to refresh brand models",
        variant: "destructive"
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
                  <UpdateIcon className="h-4 w-4" />
                  Update Laptops
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
                  <MagnifyingGlassIcon className="h-4 w-4" />
                  Discover Laptops
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium">Refresh Brand Models</h3>
                  <p className="text-sm text-gray-500">Update brand and model information for laptops</p>
                </div>
                <Button
                  onClick={handleRefreshBrandModels}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <UpdateIcon className="h-4 w-4" />
                  Refresh Models
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
