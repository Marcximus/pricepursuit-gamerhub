
import { supabase } from "@/integrations/supabase/client";

export const processLaptopsAI = async () => {
  try {
    console.log('Starting AI processing for laptops...');
    
    const { data, error: fetchError } = await supabase.functions.invoke('process-laptops-ai');
    
    if (fetchError) {
      console.error('Error starting AI processing:', fetchError);
      return { success: false, error: fetchError };
    }

    console.log('AI processing initiated:', data);
    return { success: true, processed: data?.processed ?? 0 };

  } catch (error) {
    console.error('Failed to start AI processing:', error);
    return { success: false, error };
  }
};
