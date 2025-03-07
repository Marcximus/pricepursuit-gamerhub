
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { GeneratedBlogContent, SearchParam } from './types';
import { processTop10Content } from './processTop10Content';

export async function generateBlogPost(
  prompt: string,
  category: string,
  asin?: string,
  asin2?: string
): Promise<GeneratedBlogContent | null> {
  try {
    const { data, error } = await supabase.functions.invoke('generate-blog-post', {
      body: {
        prompt,
        category,
        asin,
        asin2
      },
    });

    if (error) {
      console.error('Error generating blog post:', error);
      throw new Error(error.message || 'Failed to generate blog post');
    }

    // For Top 10 posts, process product data placeholders
    if (category === 'Top10' && data && data.content) {
      data.content = await processTop10Content(data.content, prompt);
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
