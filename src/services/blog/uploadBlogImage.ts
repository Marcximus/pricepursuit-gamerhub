
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export async function uploadBlogImage(
  file: File
): Promise<string | null> {
  try {
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
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

    // Upload the file
    const { error: uploadError, data } = await supabase.storage
      .from('blog-assets')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error details:', uploadError);
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
      if (error.message.includes('row-level security policy')) {
        errorMessage = 'Permission denied: Please make sure you are logged in with appropriate rights';
      } else {
        errorMessage = error.message;
      }
    }
    
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    });
    return null;
  }
}
