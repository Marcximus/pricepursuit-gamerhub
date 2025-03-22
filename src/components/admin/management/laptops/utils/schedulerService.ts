
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export interface SchedulerResponse {
  enabled: boolean;
  lastScheduled: string | null;
}

/**
 * Fetches the current status of the auto-update scheduler
 */
export const fetchSchedulerStatus = async (): Promise<SchedulerResponse | null> => {
  try {
    console.log('Checking scheduler status...');
    const { data, error } = await supabase.functions.invoke('toggle-scheduler', {
      method: 'GET'
    });
      
    if (error) {
      console.error('Error checking scheduler status:', error);
      return null;
    }
    
    return {
      enabled: data?.enabled === true,
      lastScheduled: data?.lastScheduled || null
    };
  } catch (err) {
    console.error('Error in fetchSchedulerStatus:', err);
    return null;
  }
};

/**
 * Toggles the auto-update scheduler state on the server
 */
export const toggleSchedulerState = async (newState: boolean): Promise<boolean> => {
  try {
    console.log(`Toggle auto-update called, setting to: ${newState}`);
    
    const { data, error } = await supabase.functions.invoke('toggle-scheduler', {
      body: { enabled: newState }
    });
    
    if (error) {
      console.error('Error toggling scheduler:', error);
      toast({
        title: "Error",
        description: `Failed to ${newState ? 'enable' : 'disable'} auto-update: ${error.message}`,
        variant: "destructive"
      });
      
      return false;
    }
    
    toast({
      title: newState ? "Auto-Update Enabled" : "Auto-Update Disabled",
      description: newState 
        ? "Laptop updates are now scheduled to run automatically every 5 minutes" 
        : "Automatic updates have been turned off",
    });
    
    return true;
  } catch (err) {
    console.error('Error in toggleSchedulerState:', err);
    toast({
      title: "Error",
      description: "Failed to toggle auto-update mode",
      variant: "destructive"
    });
    
    return false;
  }
};
