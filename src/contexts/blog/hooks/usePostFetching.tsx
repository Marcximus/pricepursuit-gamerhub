
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { BlogPost } from '../types';

export const usePostFetching = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching blog posts...');
      
      // Get the latest blog posts without using options() method
      const { data, error: fetchError } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (fetchError) {
        console.error('Supabase fetch error:', fetchError);
        throw new Error(fetchError.message);
      }
      
      console.log(`Fetched ${data?.length || 0} blog posts`);
      
      // Add more detailed logging for debugging
      if (data && data.length > 0) {
        console.log('Post IDs in fetched data:');
        data.forEach(post => console.log(`- ${post.id}: ${post.title}`));
      }
      
      setPosts(data as BlogPost[]);
    } catch (err) {
      console.error('Error fetching blog posts:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast({
        title: "Error fetching blog posts",
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    posts,
    setPosts,
    loading,
    error,
    fetchPosts
  };
};
