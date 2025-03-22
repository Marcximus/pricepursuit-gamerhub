
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
        
        if (insertError.message.includes('row-level security') || insertError.code === '42501') {
          throw new Error('Permission denied. Only administrators can create blog posts.');
        }
        
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
      
      if (errorMessage.includes('row-level security') || errorMessage.includes('permission denied')) {
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
      
      if (updateError) {
        if (updateError.message.includes('row-level security') || updateError.code === '42501') {
          throw new Error('Permission denied. Only administrators can update blog posts.');
        }
        
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
      
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'An unknown error occurred';
      
      if (errorMessage.includes('row-level security') || errorMessage.includes('permission denied')) {
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
        
        if (checkError.message.includes('row-level security') || checkError.code === '42501') {
          throw new Error('Permission denied. Only administrators can delete blog posts.');
        }
        
        throw new Error(checkError.message);
      }
      
      if (!existingPost) {
        console.error(`Post with ID ${id} not found`);
        throw new Error(`Post with ID ${id} not found`);
      }
      
      console.log(`Sending delete request to Supabase for post ID: ${id}`);
      
      // Execute the delete operation with more explicit logging
      const { data: deleteData, error: deleteError } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id)
        .select(); // Add select() to get back the deleted row
      
      if (deleteError) {
        console.error('Supabase error during deletion:', deleteError);
        
        if (deleteError.message.includes('row-level security') || deleteError.code === '42501') {
          throw new Error('Permission denied. Only administrators can delete blog posts.');
        }
        
        throw new Error(deleteError.message);
      }
      
      if (!deleteData || deleteData.length === 0) {
        console.warn(`No rows were deleted for post ID: ${id}`);
        // Check if this is a permission issue
        const { data: checkPermission } = await supabase.rpc('has_role', { _role: 'admin' });
        if (!checkPermission) {
          throw new Error('Permission denied. Only administrators can delete blog posts.');
        }
      } else {
        console.log(`Successfully deleted ${deleteData.length} rows for post ID: ${id}`);
      }
      
      // Immediately verify deletion was successful
      const { data: checkDeleted, error: verifyError } = await supabase
        .from('blog_posts')
        .select('id')
        .eq('id', id);
        
      if (verifyError) {
        console.error('Error verifying deletion:', verifyError);
      } else if (checkDeleted && checkDeleted.length > 0) {
        console.error(`Post still exists after deletion! Found ${checkDeleted.length} posts with ID ${id}`);
        console.log('This may indicate a permissions issue or RLS policy preventing deletion');
        
        // Check admin permission
        const { data: isAdmin } = await supabase.rpc('has_role', { _role: 'admin' });
        if (!isAdmin) {
          throw new Error('Permission denied. Only administrators can delete blog posts.');
        }
      } else {
        console.log(`Successfully verified post with ID: ${id} is removed from database`);
      }
      
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
      
      if (errorMessage.includes('row-level security') || errorMessage.includes('permission denied')) {
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
