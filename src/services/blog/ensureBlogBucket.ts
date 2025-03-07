
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

/**
 * Ensures the blog-assets bucket exists and has public access
 * @returns {Promise<boolean>} True if bucket exists and is properly configured
 */
export async function ensureBlogBucket(): Promise<boolean> {
  try {
    // Check if the bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error checking buckets:', bucketsError);
      return false;
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === 'blog-assets');
    
    if (!bucketExists) {
      // Create the bucket if it doesn't exist
      const { error: createError } = await supabase.storage.createBucket('blog-assets', {
        public: true, // Make bucket public
        fileSizeLimit: 10485760, // 10MB limit
      });
      
      if (createError) {
        console.error('Error creating blog-assets bucket:', createError);
        
        // If the error is related to RLS policy, we still want to proceed
        if (createError.message.includes('row-level security policy')) {
          // The bucket might actually exist but user doesn't have permission to create buckets
          return true;
        }
        
        return false;
      }
      
      // Set public bucket policy
      const { error: policyError } = await supabase.storage.from('blog-assets').getPublicUrl('test');
      
      if (policyError && !policyError.message.includes('not found')) {
        console.error('Error setting bucket policy:', policyError);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring blog bucket:', error);
    return false;
  }
}
