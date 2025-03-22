
import { useState, useEffect, useCallback } from 'react';
import { useBlog } from '@/contexts/blog';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { toast } from '@/components/ui/use-toast';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { 
  BlogAdminHeader, 
  BlogPostTable, 
  DeletePostDialog, 
  EmptyState,
  usePostDeletion
} from '@/components/blog/admin';

const BlogAdmin = () => {
  const { posts, loading, error, fetchPosts } = useBlog();
  const { isAdmin, isLoading, user } = useAuth();
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
    fetchPosts();
    
    // Set up periodic refresh to ensure data is fresh
    const intervalId = setInterval(() => {
      console.log('BlogAdmin: Performing periodic refresh');
      fetchPosts();
    }, 30000); // Every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [fetchPosts]);

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

  // Log auth state for debugging
  useEffect(() => {
    console.log('BlogAdmin: Auth state -', {
      isLoading,
      isAdmin,
      userLoggedIn: !!user,
      userId: user?.id
    });
  }, [isLoading, isAdmin, user]);

  // Handle authentication loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <p>Loading admin panel...</p>
      </div>
    );
  }

  // Check if user is logged in
  if (!user) {
    console.log('BlogAdmin: User not logged in, redirecting to login page');
    toast({
      title: "Authentication Required",
      description: "Please log in to access the admin panel",
      variant: "destructive",
    });
    return <Navigate to="/login" replace />;
  }

  // Check admin privileges
  if (!isAdmin) {
    console.log('BlogAdmin: User lacks admin privileges, redirecting to home');
    toast({
      title: "Access Denied",
      description: "Only administrators can access the admin panel",
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
