
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: 'Top10' | 'Review' | 'Comparison' | 'How-To';
  image_url?: string;
  additional_images?: string[];
  author: string;
  created_at: string;
  updated_at?: string;
  published: boolean;
  tags?: string[];
};

interface BlogContextType {
  posts: BlogPost[];
  loading: boolean;
  error: string | null;
  fetchPosts: () => Promise<void>;
  getPostBySlug: (slug: string, category: string) => BlogPost | undefined;
  getPostsByCategory: (category: string) => BlogPost[];
  getRecentPosts: (limit?: number) => BlogPost[];
  createPost: (post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'author'>) => Promise<BlogPost | null>;
  updatePost: (id: string, post: Partial<BlogPost>) => Promise<boolean>;
  deletePost: (id: string) => Promise<boolean>;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

export const BlogProvider = ({ children }: { children: ReactNode }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the current session to determine what posts to fetch
      const { data: { session } } = await supabase.auth.getSession();
      
      let query = supabase.from('blog_posts').select('*');
      
      // If user is not authenticated, only fetch published posts
      if (!session) {
        query = query.eq('published', true);
      }
      
      const { data, error: fetchError } = await query.order('created_at', { ascending: false });
      
      if (fetchError) throw new Error(fetchError.message);
      
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
  };

  useEffect(() => {
    fetchPosts();
    
    // Set up subscription for real-time updates
    const subscription = supabase
      .channel('blog_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'blog_posts' 
      }, () => {
        fetchPosts();
      })
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getPostBySlug = (slug: string, category: string) => {
    return posts.find(post => post.slug === slug && post.category === category);
  };

  const getPostsByCategory = (category: string) => {
    return posts.filter(post => post.category === category && post.published);
  };

  const getRecentPosts = (limit = 5) => {
    return [...posts]
      .filter(post => post.published)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  };

  const createPost = async (postData: Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'author'>) => {
    try {
      // Get the current user to set as the author
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to create a blog post",
          variant: "destructive",
        });
        return null;
      }
      
      // Set the author to the user ID
      const authorId = session.user.id;
      
      const { data, error: insertError } = await supabase
        .from('blog_posts')
        .insert([{ ...postData, author: authorId }])
        .select()
        .single();
      
      if (insertError) {
        console.error('Insert error details:', insertError);
        throw new Error(insertError.message);
      }
      
      setPosts(prevPosts => [data as BlogPost, ...prevPosts]);
      toast({
        title: "Post created successfully",
        description: "Your blog post has been created.",
      });
      
      return data as BlogPost;
    } catch (err) {
      console.error('Error creating blog post:', err);
      toast({
        title: "Error creating blog post",
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: "destructive",
      });
      return null;
    }
  };

  const updatePost = async (id: string, postData: Partial<BlogPost>) => {
    try {
      // Verify the current user is the author
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to update a blog post",
          variant: "destructive",
        });
        return false;
      }
      
      const { error: updateError } = await supabase
        .from('blog_posts')
        .update(postData)
        .eq('id', id);
      
      if (updateError) {
        console.error('Update error details:', updateError);
        throw new Error(updateError.message);
      }
      
      setPosts(prevPosts => 
        prevPosts.map(post => post.id === id ? { ...post, ...postData } : post)
      );
      
      toast({
        title: "Post updated successfully",
        description: "Your blog post has been updated.",
      });
      
      return true;
    } catch (err) {
      console.error('Error updating blog post:', err);
      toast({
        title: "Error updating blog post",
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: "destructive",
      });
      return false;
    }
  };

  const deletePost = async (id: string) => {
    try {
      // Verify the current user is the author
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to delete a blog post",
          variant: "destructive",
        });
        return false;
      }
      
      const { error: deleteError } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);
      
      if (deleteError) {
        console.error('Delete error details:', deleteError);
        throw new Error(deleteError.message);
      }
      
      setPosts(prevPosts => prevPosts.filter(post => post.id !== id));
      
      toast({
        title: "Post deleted successfully",
        description: "Your blog post has been deleted.",
      });
      
      return true;
    } catch (err) {
      console.error('Error deleting blog post:', err);
      toast({
        title: "Error deleting blog post",
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: "destructive",
      });
      return false;
    }
  };

  const value = {
    posts,
    loading,
    error,
    fetchPosts,
    getPostBySlug,
    getPostsByCategory,
    getRecentPosts,
    createPost,
    updatePost,
    deletePost,
  };

  return <BlogContext.Provider value={value}>{children}</BlogContext.Provider>;
};

export const useBlog = () => {
  const context = useContext(BlogContext);
  if (context === undefined) {
    throw new Error('useBlog must be used within a BlogProvider');
  }
  return context;
};
