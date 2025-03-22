
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
    // Re-verify admin status before opening delete dialog
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to delete posts.",
        variant: "destructive",
      });
      return;
    }

    // Check admin status before proceeding
    const adminStatus = await checkAdminRole();
    if (!adminStatus) {
      console.log('Admin check failed in usePostDeletion');
      toast({
        title: "Permission Denied",
        description: "Only administrators can delete blog posts.",
        variant: "destructive",
      });
      return;
    }

    setPostToDelete(postId);
    setDeleteDialogOpen(true);
    // Reset delete success state when opening a new delete dialog
    setDeleteSuccess(false);
  };

  const handleDeletePost = async () => {
    if (!postToDelete) return;
    
    // Final admin check before actual deletion
    if (!user || !(await checkAdminRole())) {
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
    
    try {
      console.log(`BlogAdmin: Deleting post with ID: ${postToDelete}`);
      const success = await deletePost(postToDelete);
      
      if (success) {
        console.log('BlogAdmin: Post deleted successfully');
        setDeleteSuccess(true);
        
        // Force multiple refetches to ensure UI is in sync with database
        // First immediate refetch
        await fetchPosts();
        
        // Second delayed refetch in case the first one was too quick
        setTimeout(() => {
          console.log('BlogAdmin: Forcing delayed refetch after deletion');
          fetchPosts();
        }, 2000);
        
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
