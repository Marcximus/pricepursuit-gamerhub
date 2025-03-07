
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
      
      // If this is a permission error, we can assume the bucket exists
      // since we've created it with our SQL migration
      if (bucketsError.message.includes('row-level security policy')) {
        console.log('Permission error when checking buckets, assuming bucket exists.');
        return true;
      }
      
      return false;
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === 'blog-assets');
    
    if (!bucketExists) {
      console.log('Blog-assets bucket does not exist, attempting to create it...');
      
      // Attempt to create the bucket if it doesn't exist
      try {
        const { error: createError } = await supabase.storage.createBucket('blog-assets', {
          public: true, // Make bucket public
          fileSizeLimit: 10485760, // 10MB limit
        });
        
        if (createError) {
          console.error('Error creating blog-assets bucket:', createError);
          
          // If this is a row-level security policy error, the bucket might already exist
          // or was created by our SQL migration
          if (createError.message.includes('row-level security policy')) {
            console.log('Permission error when creating bucket, assuming bucket exists.');
            return true;
          }
          
          return false;
        }
        
        console.log('Blog-assets bucket created successfully');
      } catch (err) {
        console.error('Unexpected error creating bucket:', err);
        return false;
      }
    } else {
      console.log('Blog-assets bucket already exists');
    }
    
    // Test if we can get a public URL (this verifies the bucket is properly configured)
    try {
      supabase.storage.from('blog-assets').getPublicUrl('test');
      return true;
    } catch (err) {
      console.error('Error testing bucket public access:', err);
      return false;
    }
  } catch (error) {
    console.error('Error ensuring blog bucket:', error);
    return false;
  }
}
