import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from './AuthContext';

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
  createPost: (post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>) => Promise<BlogPost | null>;
  updatePost: (id: string, post: Partial<BlogPost>) => Promise<boolean>;
  deletePost: (id: string) => Promise<boolean>;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

export const BlogProvider = ({ children }: { children: ReactNode }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAdmin } = useAuth();

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });
      
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

  const createPost = async (postData: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error: insertError } = await supabase
        .from('blog_posts')
        .insert([postData])
        .select()
        .single();
      
      if (insertError) {
        console.error('Supabase error:', insertError);
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
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'An unknown error occurred';
      
      if (errorMessage.includes('row-level security')) {
        toast({
          title: "Permission Error",
          description: "You don't have permission to create blog posts. Only admins can perform this action.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error creating blog post",
          description: errorMessage,
          variant: "destructive",
        });
      }
      return null;
    }
  };

  const updatePost = async (id: string, postData: Partial<BlogPost>) => {
    try {
      const { error: updateError } = await supabase
        .from('blog_posts')
        .update(postData)
        .eq('id', id);
      
      if (updateError) throw new Error(updateError.message);
      
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
      
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'An unknown error occurred';
      
      if (errorMessage.includes('row-level security')) {
        toast({
          title: "Permission Error",
          description: "You don't have permission to update blog posts. Only admins can perform this action.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error updating blog post",
          description: errorMessage,
          variant: "destructive",
        });
      }
      
      return false;
    }
  };

  const deletePost = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);
      
      if (deleteError) throw new Error(deleteError.message);
      
      setPosts(prevPosts => prevPosts.filter(post => post.id !== id));
      
      toast({
        title: "Post deleted successfully",
        description: "Your blog post has been deleted.",
      });
      
      return true;
    } catch (err) {
      console.error('Error deleting blog post:', err);
      
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'An unknown error occurred';
      
      if (errorMessage.includes('row-level security')) {
        toast({
          title: "Permission Error",
          description: "You don't have permission to delete blog posts. Only admins can perform this action.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error deleting blog post",
          description: errorMessage,
          variant: "destructive",
        });
      }
      
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
