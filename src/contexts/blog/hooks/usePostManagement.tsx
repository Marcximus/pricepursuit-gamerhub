
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
      console.log(`Attempting to delete blog post with ID: ${id}`);
      
      // First, check if the post exists
      const { data: existingPost, error: checkError } = await supabase
        .from('blog_posts')
        .select('id')
        .eq('id', id)
        .single();
      
      if (checkError) {
        console.error('Error checking if post exists:', checkError);
        throw new Error(checkError.message);
      }
      
      if (!existingPost) {
        console.error(`Post with ID ${id} not found`);
        throw new Error(`Post with ID ${id} not found`);
      }
      
      const { error: deleteError } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);
      
      if (deleteError) {
        console.error('Supabase error during deletion:', deleteError);
        throw new Error(deleteError.message);
      }
      
      console.log(`Successfully deleted blog post with ID: ${id} from database`);
      
      // Update local state after successful deletion
      setPosts(prevPosts => {
        const filteredPosts = prevPosts.filter(post => post.id !== id);
        console.log(`Local state updated, removed post. New count: ${filteredPosts.length}`);
        return filteredPosts;
      });
      
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

  return {
    createPost,
    updatePost,
    deletePost,
  };
};
