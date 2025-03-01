
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  updateSpecificLaptopRam, 
  updateB07SRSSWH9Ram, 
  updateAlienwareM18R2Ram,
  refreshLaptopCache,
  updateB07SXVRQ6NRam,
  updateB07TB8WP87Ram,
  updateB09DDCDKZZRam
} from '@/utils/laptop/manualProductUpdates';
import { toast } from 'sonner';

export function UpdateSpecificLaptops() {
  const [isUpdating, setIsUpdating] = React.useState(false);

  const handleUpdateB07STVDB3N = async () => {
    setIsUpdating(true);
    toast.info('Starting update for ASIN B07STVDB3N RAM...');
    
    try {
      const result = await updateSpecificLaptopRam();
      
      if (result.success) {
        toast.success('Successfully updated laptop RAM to 32 GB DDR5!');
      } else {
        toast.error('Failed to update laptop RAM. See console for details.');
        console.error('Update error:', result.error);
      }
    } catch (error) {
      toast.error('Error during update process. See console for details.');
      console.error('Update process error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateB07SRSSWH9 = async () => {
    setIsUpdating(true);
    toast.info('Starting update for ASIN B07SRSSWH9 RAM...');
    
    try {
      const result = await updateB07SRSSWH9Ram();
      
      if (result.success) {
        toast.success('Successfully updated laptop RAM to 64 GB DDR5!');
      } else {
        toast.error('Failed to update laptop RAM. See console for details.');
        console.error('Update error:', result.error);
      }
    } catch (error) {
      toast.error('Error during update process. See console for details.');
      console.error('Update process error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateAlienwareRam = async () => {
    setIsUpdating(true);
    toast.info('Starting update for Alienware M18 R2 RAM...');
    
    try {
      const result = await updateAlienwareM18R2Ram();
      
      if (result.success) {
        toast.success('Successfully updated Alienware M18 R2 laptop RAM to 32 GB DDR5!');
        // Only log the message if it exists
        if (result && 'message' in result && result.message) {
          console.log(result.message);
        }
      } else {
        toast.error('Failed to update Alienware laptop RAM. See console for details.');
        console.error('Update error:', result.error);
      }
    } catch (error) {
      toast.error('Error during update process. See console for details.');
      console.error('Update process error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateB07SXVRQ6N = async () => {
    setIsUpdating(true);
    toast.info('Starting update for ASIN B07SXVRQ6N RAM...');
    
    try {
      const result = await updateB07SXVRQ6NRam();
      
      if (result.success) {
        toast.success('Successfully updated laptop RAM to 32 GB DDR5!');
      } else {
        toast.error('Failed to update laptop RAM. See console for details.');
        console.error('Update error:', result.error);
      }
    } catch (error) {
      toast.error('Error during update process. See console for details.');
      console.error('Update process error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateB07TB8WP87 = async () => {
    setIsUpdating(true);
    toast.info('Starting update for ASIN B07TB8WP87 RAM...');
    
    try {
      const result = await updateB07TB8WP87Ram();
      
      if (result.success) {
        toast.success('Successfully updated laptop RAM to 32 GB DDR5!');
      } else {
        toast.error('Failed to update laptop RAM. See console for details.');
        console.error('Update error:', result.error);
      }
    } catch (error) {
      toast.error('Error during update process. See console for details.');
      console.error('Update process error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateB09DDCDKZZ = async () => {
    setIsUpdating(true);
    toast.info('Starting update for ASIN B09DDCDKZZ RAM...');
    
    try {
      const result = await updateB09DDCDKZZRam();
      
      if (result.success) {
        toast.success('Successfully updated laptop RAM to 12 GB DDR4!');
      } else {
        toast.error('Failed to update laptop RAM. See console for details.');
        console.error('Update error:', result.error);
      }
    } catch (error) {
      toast.error('Error during update process. See console for details.');
      console.error('Update process error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRefreshCache = async () => {
    setIsUpdating(true);
    toast.info('Refreshing laptop data cache...');
    
    try {
      const result = await refreshLaptopCache();
      
      if (result.success) {
        toast.success('Successfully refreshed laptop data cache!');
      } else {
        toast.error('Failed to refresh cache. See console for details.');
        console.error('Refresh error:', result.error);
      }
    } catch (error) {
      toast.error('Error during cache refresh. See console for details.');
      console.error('Cache refresh error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Manual Product Updates</h3>
      <div className="flex flex-col gap-2">
        <Button 
          onClick={handleUpdateB07STVDB3N}
          disabled={isUpdating}
          variant="outline"
          size="sm"
        >
          {isUpdating ? 'Updating...' : 'Update B07STVDB3N RAM to 32 GB DDR5'}
        </Button>
        <Button 
          onClick={handleUpdateB07SRSSWH9}
          disabled={isUpdating}
          variant="outline"
          size="sm"
        >
          {isUpdating ? 'Updating...' : 'Update B07SRSSWH9 RAM to 64 GB DDR5'}
        </Button>
        <Button 
          onClick={handleUpdateAlienwareRam}
          disabled={isUpdating}
          variant="outline"
          size="sm"
        >
          {isUpdating ? 'Updating...' : 'Update Alienware M18 R2 RAM to 32 GB DDR5'}
        </Button>
        <Button 
          onClick={handleUpdateB07SXVRQ6N}
          disabled={isUpdating}
          variant="outline"
          size="sm"
        >
          {isUpdating ? 'Updating...' : 'Update B07SXVRQ6N RAM to 32 GB DDR5'}
        </Button>
        <Button 
          onClick={handleUpdateB07TB8WP87}
          disabled={isUpdating}
          variant="outline"
          size="sm"
        >
          {isUpdating ? 'Updating...' : 'Update B07TB8WP87 RAM to 32 GB DDR5'}
        </Button>
        <Button 
          onClick={handleUpdateB09DDCDKZZ}
          disabled={isUpdating}
          variant="outline"
          size="sm"
        >
          {isUpdating ? 'Updating...' : 'Update B09DDCDKZZ RAM to 12 GB DDR4'}
        </Button>
        <Button 
          onClick={handleRefreshCache}
          disabled={isUpdating}
          variant="outline"
          size="sm"
        >
          {isUpdating ? 'Refreshing...' : 'Refresh Laptop Data Cache'}
        </Button>
      </div>
    </div>
  );
}
