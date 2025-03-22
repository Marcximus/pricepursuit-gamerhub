
import { useState } from 'react';
import { useBlog } from '@/contexts/blog';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const usePostDeletion = () => {
  const { deletePost, fetchPosts } = useBlog();
  const { user, isAdmin, checkAdminRole } = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const confirmDelete = async (postId: string) => {
    console.log(`usePostDeletion: Confirming deletion for post ID: ${postId}`);
    
    // Re-verify admin status before opening delete dialog
    if (!user) {
      console.log('usePostDeletion: No user found, preventing deletion');
      toast({
        title: "Authentication Required",
        description: "You must be logged in to delete posts.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check admin status before proceeding
      console.log('usePostDeletion: Verifying admin status before deletion');
      const adminStatus = await checkAdminRole(user.id);
      
      if (!adminStatus) {
        console.log('Admin check failed in usePostDeletion');
        toast({
          title: "Permission Denied",
          description: "Only administrators can delete blog posts.",
          variant: "destructive",
        });
        return;
      }
      
      console.log('usePostDeletion: Admin verified, proceeding with deletion confirmation');
      setPostToDelete(postId);
      setDeleteDialogOpen(true);
      // Reset delete success state when opening a new delete dialog
      setDeleteSuccess(false);
    } catch (error) {
      console.error('Error verifying admin status:', error);
      toast({
        title: "Error",
        description: "Failed to verify permissions. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePost = async () => {
    if (!postToDelete) {
      console.log('usePostDeletion: No post ID to delete');
      return;
    }
    
    try {
      // Final admin check before actual deletion
      if (!user) {
        console.log('usePostDeletion: No user found during final check');
        toast({
          title: "Authentication Required",
          description: "You must be logged in to delete posts.",
          variant: "destructive",
        });
        setDeleteDialogOpen(false);
        return;
      }
      
      console.log('usePostDeletion: Performing final admin verification');
      const isAdminUser = await checkAdminRole(user.id);
      
      if (!isAdminUser) {
        console.log('usePostDeletion: Admin check failed during final verification');
        toast({
          title: "Permission Denied",
          description: "Only administrators can delete blog posts.",
          variant: "destructive",
        });
        setDeleteDialogOpen(false);
        return;
      }
      
      setIsDeleting(true);
      setDeleteSuccess(false);
      
      console.log(`BlogAdmin: Deleting post with ID: ${postToDelete}`);
      const success = await deletePost(postToDelete);
      
      if (success) {
        console.log('BlogAdmin: Post deleted successfully');
        setDeleteSuccess(true);
        
        // Force refetch to ensure UI is in sync with database
        await fetchPosts();
        
        toast({
          title: "Success",
          description: "Post deleted successfully",
        });
      } else {
        console.error('BlogAdmin: Failed to delete post');
        setDeleteSuccess(false);
        toast({
          title: "Error",
          description: "Failed to delete post. Please try again or check your permissions.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('BlogAdmin: Error during deletion:', error);
      setDeleteSuccess(false);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please check your admin permissions.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    }
  };

  return {
    deleteDialogOpen,
    setDeleteDialogOpen,
    postToDelete,
    isDeleting,
    deleteSuccess,
    confirmDelete,
    handleDeletePost
  };
};
