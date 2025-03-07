
import { useState, useEffect, useCallback } from 'react';
import { useBlog } from '@/contexts/BlogContext';
import Navigation from '@/components/Navigation';
import { 
  BlogAdminHeader, 
  BlogPostTable, 
  DeletePostDialog, 
  EmptyState,
  usePostDeletion
} from '@/components/blog/admin';

const BlogAdmin = () => {
  const { posts, loading, error, fetchPosts } = useBlog();
  const { 
    deleteDialogOpen, 
    setDeleteDialogOpen, 
    isDeleting, 
    deleteSuccess, 
    confirmDelete, 
    handleDeletePost 
  } = usePostDeletion();
  
  // Use useCallback to prevent function recreation on each render
  const refreshPosts = useCallback(() => {
    console.log('BlogAdmin: Manually refreshing posts');
    fetchPosts();
  }, [fetchPosts]);
  
  useEffect(() => {
    document.title = "Blog Admin | Laptop Hunter";
    // Only fetch posts on initial load, not on every render
    fetchPosts();
    // Intentionally NOT including refreshPosts or fetchPosts in the dependency array
    // to prevent continuous refreshing
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-20 container mx-auto px-4 mt-10">
        <BlogAdminHeader onRefresh={refreshPosts} />
        
        {loading ? (
          <div className="text-center py-12">Loading posts...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-12">Error loading posts: {error}</div>
        ) : posts.length === 0 ? (
          <EmptyState />
        ) : (
          <BlogPostTable 
            posts={posts} 
            isDeleting={isDeleting} 
            onDeleteConfirm={confirmDelete} 
          />
        )}
      </div>
      
      <DeletePostDialog 
        open={deleteDialogOpen} 
        onOpenChange={setDeleteDialogOpen} 
        onConfirm={handleDeletePost} 
        isDeleting={isDeleting} 
      />
    </div>
  );
};

export default BlogAdmin;
