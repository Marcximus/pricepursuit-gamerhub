
import { updateSpecificLaptopRam } from "../utils/laptop/manualProductUpdates";

// Self-executing async function
(async () => {
  console.log('Starting update for specific laptop RAM...');
  
  try {
    const result = await updateSpecificLaptopRam();
    
    if (result.success) {
      console.log('Successfully updated laptop RAM specification!');
    } else {
      console.error('Failed to update laptop RAM:', result.error);
    }
  } catch (error) {
    console.error('Error in update process:', error);
  }
})();
