
import { supabase } from "@/integrations/supabase/client";
import { StatsCountResult } from "./types";

/**
 * Get count of laptops with pending AI processing status
 */
export async function getPendingAIProcessingCount(): Promise<StatsCountResult> {
  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_laptop', true)
    .eq('ai_processing_status', 'pending');
  
  if (error) {
    console.error('Error fetching pending count:', error);
  }
  
  return { count: count || 0, error };
}

/**
 * Get count of laptops with in-progress AI processing status
 */
export async function getProcessingAICount(): Promise<StatsCountResult> {
  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_laptop', true)
    .eq('ai_processing_status', 'processing');
  
  if (error) {
    console.error('Error fetching processing count:', error);
  }
  
  return { count: count || 0, error };
}

/**
 * Get count of laptops with error AI processing status
 */
export async function getErrorAIProcessingCount(): Promise<StatsCountResult> {
  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_laptop', true)
    .eq('ai_processing_status', 'error');
  
  if (error) {
    console.error('Error fetching error status count:', error);
  }
  
  return { count: count || 0, error };
}

/**
 * Get count of laptops with complete AI processing status
 */
export async function getCompleteAIProcessingCount(): Promise<StatsCountResult> {
  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_laptop', true)
    .eq('ai_processing_status', 'complete');
  
  if (error) {
    console.error('Error fetching complete count:', error);
  }
  
  return { count: count || 0, error };
}
