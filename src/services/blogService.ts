
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface GeneratedBlogContent {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags?: string[];
}

export async function generateBlogPost(
  prompt: string,
  category: string
): Promise<GeneratedBlogContent | null> {
  try {
    const { data, error } = await supabase.functions.invoke('generate-blog-post', {
      body: {
        prompt,
        category
      },
    });

    if (error) {
      console.error('Error generating blog post:', error);
      throw new Error(error.message || 'Failed to generate blog post');
    }

    return data;
  } catch (error) {
    console.error('Error in generateBlogPost:', error);
    toast({
      title: 'Error',
      description: error instanceof Error ? error.message : 'Failed to generate blog post',
      variant: 'destructive',
    });
    return null;
  }
}

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
