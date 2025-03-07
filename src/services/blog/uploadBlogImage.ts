
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export async function uploadBlogImage(
  file: File
): Promise<string | null> {
  try {
    // Get the current session
    const { data: { session } } = await supabase.auth.getSession();
    
    // Check if user is authenticated
    if (!session) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to upload images",
        variant: "destructive",
      });
      return null;
    }

    // Generate a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `blog-images/${fileName}`;

    // Check if the bucket exists first
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === 'blog-assets');
    
    if (!bucketExists) {
      toast({
        title: "Storage not available",
        description: "The image storage system is not properly configured. Please contact the administrator.",
        variant: "destructive",
      });
      return null;
    }

    // Upload the file
    const { error: uploadError, data } = await supabase.storage
      .from('blog-assets')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error details:', uploadError);
      
      // Check for specific errors
      if (uploadError.message.includes('row-level security policy')) {
        throw new Error('Permission denied: Please make sure you are logged in with appropriate rights');
      }
      
      throw new Error(uploadError.message);
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('blog-assets')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to upload image';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    });
    return null;
  }
}
