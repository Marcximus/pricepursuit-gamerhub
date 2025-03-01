
import React from 'react';
import { Button } from '@/components/ui/button';
import { updateSpecificLaptopRam, updateB07SRSSWH9Ram } from '@/utils/laptop/manualProductUpdates';
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
      </div>
    </div>
  );
}
