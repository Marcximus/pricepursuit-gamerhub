
import { supabase } from '@/integrations/supabase/client';

export async function ensureBlogAssetsBucket() {
  try {
    // Check if the bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === 'blog-assets');
    
    // If bucket doesn't exist, create it
    if (!bucketExists) {
      const { error } = await supabase.storage.createBucket('blog-assets', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
      });
      
      if (error) {
        console.error('Error creating blog-assets bucket:', error);
        return false;
      }
      
      console.log('blog-assets bucket created successfully');
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring blog-assets bucket exists:', error);
    return false;
  }
}
