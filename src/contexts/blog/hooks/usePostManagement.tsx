
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { BlogPost } from '../types';

export const usePostManagement = (
  posts: BlogPost[],
  setPosts: React.Dispatch<React.SetStateAction<BlogPost[]>>
) => {
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
      
      toast({
        title: "Error creating blog post",
        description: errorMessage,
        variant: "destructive",
      });
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
      
      toast({
        title: "Error updating blog post",
        description: errorMessage,
        variant: "destructive",
      });
      
      return false;
    }
  };

  const deletePost = async (id: string) => {
    try {
      console.log(`Attempting to delete blog post with ID: ${id}`);
      
      // Let's try the simplest approach - direct delete without RPC or complex queries
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting blog post:', error);
        throw new Error(error.message);
      }
      
      console.log('Direct deletion succeeded');
      
      // Update local state to reflect deletion
      setPosts(prevPosts => {
        const filteredPosts = prevPosts.filter(post => post.id !== id);
        console.log(`Local state updated: removed post with ID: ${id}. New count: ${filteredPosts.length}`);
        return filteredPosts;
      });
      
      toast({
        title: "Post deleted",
        description: "Your blog post has been deleted.",
      });
      
      return true;
    } catch (err) {
      console.error('Error deleting blog post:', err);
      
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'An unknown error occurred';
      
      toast({
        title: "Error deleting blog post",
        description: errorMessage,
        variant: "destructive",
      });
      
      return false;
    }
  };

  return {
    createPost,
    updatePost,
    deletePost,
  };
};
