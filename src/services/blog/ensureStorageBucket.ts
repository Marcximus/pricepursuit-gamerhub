
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export async function ensureBlogAssetsBucket() {
  try {
    // Check if the bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === 'blog-assets');
    
    // If bucket doesn't exist, create it only if we have the required permissions
    if (!bucketExists) {
      // First, check if the user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('User not authenticated - skipping bucket creation');
        return false;
      }

      try {
        const { error } = await supabase.storage.createBucket('blog-assets', {
          public: true,
          fileSizeLimit: 10485760, // 10MB
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
        });
        
        if (error) {
          if (error.message.includes('row-level security policy')) {
            console.log('User does not have permission to create buckets - will attempt to use existing bucket');
            // We'll continue as if the bucket exists and let future operations determine if we have access
            return true;
          }
          console.error('Error creating blog-assets bucket:', error);
          return false;
        }
        
        console.log('blog-assets bucket created successfully');
      } catch (bucketError) {
        console.error('Exception creating bucket:', bucketError);
        // Assume bucket might exist and proceed
        return true;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring blog-assets bucket exists:', error);
    return false;
  }
}
