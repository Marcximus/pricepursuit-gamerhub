
import { useState, useEffect, useCallback } from 'react';
import { useBlog } from '@/contexts/blog';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { toast } from '@/components/ui/use-toast';
import { 
  BlogAdminHeader, 
  BlogPostTable, 
  DeletePostDialog, 
  EmptyState,
  usePostDeletion
} from '@/components/blog/admin';

const BlogAdmin = () => {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
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
    console.log('BlogAdmin: Initial posts fetch');
    
    // Only fetch posts if user is authenticated
    if (user) {
      fetchPosts();
      
      // Set up periodic refresh to ensure data is fresh
      const intervalId = setInterval(() => {
        console.log('BlogAdmin: Performing periodic refresh');
        fetchPosts();
      }, 30000); // Every 30 seconds
      
      return () => clearInterval(intervalId);
    }
  }, [fetchPosts, user]);

  // Add effect to refresh posts after successful deletion
  useEffect(() => {
    if (deleteSuccess) {
      console.log('BlogAdmin: Post deleted successfully, refreshing posts list');
      // Add a larger delay to ensure the database has time to process the deletion
      const refreshTimer = setTimeout(() => {
        console.log('BlogAdmin: Executing final delayed refresh');
        fetchPosts();
      }, 2000); // Increased timeout to ensure database has time to process
      
      return () => clearTimeout(refreshTimer);
    }
  }, [deleteSuccess, fetchPosts]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Redirect if not authenticated or not an admin
  if (!user) {
    toast({
      title: "Authentication Required",
      description: "You must be logged in to access the admin panel.",
      variant: "destructive",
    });
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    toast({
      title: "Permission Denied",
      description: "Only administrators can access the admin panel.",
      variant: "destructive",
    });
    return <Navigate to="/" replace />;
  }

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
