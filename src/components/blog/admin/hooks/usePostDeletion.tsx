
import { useState } from 'react';
import { useBlog } from '@/contexts/blog';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const usePostDeletion = () => {
  const { deletePost, fetchPosts } = useBlog();
  const { user, isAdmin } = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const confirmDelete = async (postId: string) => {
    console.log(`usePostDeletion: Confirming deletion for post ID: ${postId}`);
    
    // Check user authentication and admin status
    if (!user) {
      console.log('usePostDeletion: No user found, preventing deletion');
      toast({
        title: "Authentication Required",
        description: "You must be logged in to delete posts.",
        variant: "destructive",
      });
      return;
    }

    if (!isAdmin) {
      console.log('usePostDeletion: User is not an admin, preventing deletion');
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
  };

  const handleDeletePost = async () => {
    if (!postToDelete) {
      console.log('usePostDeletion: No post ID to delete');
      return;
    }
    
    try {
      // Final admin check before actual deletion
      if (!user || !isAdmin) {
        console.log('usePostDeletion: User is not authenticated or not an admin during final check');
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
