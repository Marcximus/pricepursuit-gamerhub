
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export async function uploadBlogImage(
  file: File
): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `blog-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('blog-assets')
      .upload(filePath, file);

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data } = supabase.storage
      .from('blog-assets')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    toast({
      title: 'Error',
      description: error instanceof Error ? error.message : 'Failed to upload image',
      variant: 'destructive',
    });
    return null;
  }
}
