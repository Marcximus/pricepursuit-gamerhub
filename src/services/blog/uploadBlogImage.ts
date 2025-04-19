
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { ensureBlogBucket } from './ensureBlogBucket';

export async function uploadBlogImage(
  file: File,
  altText: string = 'Blog image'
): Promise<{ url: string; alt: string } | null> {
  try {
    // Ensure blog-assets bucket exists
    const bucketReady = await ensureBlogBucket();
    if (!bucketReady) {
      console.log('Attempting to proceed despite bucket issues');
    }

    // Generate a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `blog-images/${fileName}`;

    // Upload the file without checking auth
    const { error: uploadError, data } = await supabase.storage
      .from('blog-assets')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        // Store alt text in metadata
        contentType: file.type,
        duplex: 'half'
      });

    if (uploadError) {
      console.error('Upload error details:', uploadError);
      
      if (uploadError.message.includes('row-level security policy')) {
        throw new Error('Permission error when uploading. We created public access policies, please try again.');
      }
      
      throw new Error(uploadError.message);
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('blog-assets')
      .getPublicUrl(filePath);

    return { url: urlData.publicUrl, alt: altText };
  } catch (error) {
    console.error('Error uploading image:', error);
    
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
