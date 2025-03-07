
import { useState } from 'react';
import { useBlog } from '@/contexts/blog';

export const usePostDeletion = () => {
  const { deletePost } = useBlog();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const confirmDelete = (postId: string) => {
    setPostToDelete(postId);
    setDeleteDialogOpen(true);
  };

  const handleDeletePost = async () => {
    if (!postToDelete) return;
    
    setIsDeleting(true);
    
    try {
      console.log(`BlogAdmin: Deleting post with ID: ${postToDelete}`);
      const success = await deletePost(postToDelete);
      
      if (success) {
        console.log('BlogAdmin: Post deleted successfully');
        setDeleteSuccess(true);
      } else {
        console.error('BlogAdmin: Failed to delete post');
      }
    } catch (error) {
      console.error('BlogAdmin: Error during deletion:', error);
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
