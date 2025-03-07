
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { ensureBlogBucket } from './ensureBlogBucket';

export async function uploadBlogImage(
  file: File
): Promise<string | null> {
  try {
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    // If not authenticated, attempt to check if there's a stored session
    if (!session) {
      // Try to refresh the session
      const { data: refreshData } = await supabase.auth.refreshSession();
      
      // If still no session after refresh attempt, show error
      if (!refreshData.session) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to upload images",
          variant: "destructive",
        });
        return null;
      }
    }

    // Ensure blog-assets bucket exists
    const bucketReady = await ensureBlogBucket();
    if (!bucketReady) {
      toast({
        title: "Storage error",
        description: "Unable to access image storage. Please try again later.",
        variant: "destructive",
      });
      return null;
    }

    // Generate a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `blog-images/${fileName}`;

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
