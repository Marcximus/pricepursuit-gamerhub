
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export interface DuplicateAsinResult {
  asin: string;
  count: number;
}

/**
 * Checks for duplicate ASINs in the product database
 * @returns Promise with an array of objects containing ASINs and their count
 */
export const checkForDuplicateAsins = async (): Promise<DuplicateAsinResult[]> => {
  try {
    // We use the existing database function to get duplicate ASINs
    const { data, error } = await supabase.rpc('get_duplicate_asins');
    
    if (error) {
      console.error('Error checking for duplicate ASINs:', error);
      toast({
        title: "Error",
        description: `Failed to check for duplicate ASINs: ${error.message}`,
        variant: "destructive"
      });
      return [];
    }
    
    // Log the results
    if (data && data.length > 0) {
      console.log(`📊 Found ${data.length} ASINs with duplicates in the database`);
      console.table(data);
    } else {
      console.log('✅ No duplicate ASINs found in the database');
    }
    
    return data || [];
  } catch (error: any) {
    console.error('Unexpected error checking for duplicate ASINs:', error);
    toast({
      title: "Error",
      description: `Unexpected error checking for duplicate ASINs: ${error.message}`,
      variant: "destructive"
    });
    return [];
  }
};

/**
 * Get a formatted report of duplicate ASINs
 * @returns Promise with a report string
 */
export const getDuplicateAsinsReport = async (): Promise<string> => {
  const duplicates = await checkForDuplicateAsins();
  
  if (duplicates.length === 0) {
    return "✅ No duplicate ASINs found in the database.";
  }
  
  let report = `📋 Found ${duplicates.length} ASINs with duplicates:\n\n`;
  
  duplicates.forEach((item, index) => {
    report += `${index + 1}. ASIN: ${item.asin} - ${item.count} occurrences\n`;
  });
  
  report += `\nTotal duplicate entries: ${duplicates.reduce((sum, item) => sum + item.count - 1, 0)}`;
  
  return report;
};
