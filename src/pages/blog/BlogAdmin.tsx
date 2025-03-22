
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
  const [verifyingAdmin, setVerifyingAdmin] = useState(false);
  const [adminVerified, setAdminVerified] = useState(false);
  
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
  
  // Handle admin verification
  useEffect(() => {
    console.log('BlogAdmin: Auth state changed - checking admin status', { 
      authLoading, 
      user: !!user, 
      isAdmin 
    });
    
    if (!authLoading && user) {
      if (isAdmin) {
        console.log('BlogAdmin: User is confirmed admin');
        setAdminVerified(true);
        setVerifyingAdmin(false);
      } else {
        console.log('BlogAdmin: User is not an admin');
        setAdminVerified(false);
        setVerifyingAdmin(false);
      }
    } else if (!authLoading && !user) {
      console.log('BlogAdmin: No authenticated user');
      setAdminVerified(false);
      setVerifyingAdmin(false);
    }
  }, [user, isAdmin, authLoading]);
  
  // Fetch posts once admin is verified
  useEffect(() => {
    if (adminVerified) {
      document.title = "Blog Admin | Laptop Hunter";
      console.log('BlogAdmin: Admin verified, fetching posts');
      fetchPosts();
      
      // Set up periodic refresh
      const intervalId = setInterval(() => {
        console.log('BlogAdmin: Performing periodic refresh');
        fetchPosts();
      }, 30000); // Every 30 seconds
      
      return () => clearInterval(intervalId);
    }
  }, [adminVerified, fetchPosts]);

  // Refresh posts after successful deletion
  useEffect(() => {
    if (deleteSuccess) {
      console.log('BlogAdmin: Post deleted successfully, refreshing posts list');
      fetchPosts();
    }
  }, [deleteSuccess, fetchPosts]);

  // Detailed console logs for debugging
  console.log('BlogAdmin render state:', { 
    authLoading, 
    verifyingAdmin,
    user: !!user, 
    isAdmin, 
    adminVerified,
    postsLoading: loading,
    postsError: !!error,
    postsCount: posts?.length || 0
  });

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    console.log('User is not authenticated, redirecting from BlogAdmin');
    toast({
      title: "Authentication Required",
      description: "You must be logged in to access the admin panel.",
      variant: "destructive",
    });
    return <Navigate to="/login" replace />;
  }

  // Redirect if not an admin
  if (!authLoading && !isAdmin) {
    console.log('User is not admin, redirecting from BlogAdmin');
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
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p>Loading posts...</p>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-12">
            <p>Error loading posts: {error}</p>
            <button 
              onClick={refreshPosts}
              className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
            >
              Try Again
            </button>
          </div>
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
