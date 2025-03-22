
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
  const { user, isAdmin, isLoading: authLoading, checkAdminRole } = useAuth();
  const { posts, loading, error, fetchPosts } = useBlog();
  const [isVerifyingAdmin, setIsVerifyingAdmin] = useState(false);
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
  
  // Separate effect for admin verification to avoid circular dependencies
  useEffect(() => {
    const verifyAdmin = async () => {
      if (user && !authLoading) {
        try {
          setIsVerifyingAdmin(true);
          console.log('BlogAdmin: Explicitly verifying admin status');
          const isAdminUser = await checkAdminRole(user.id);
          console.log('Admin verification result:', isAdminUser);
          setAdminVerified(isAdminUser);
        } catch (error) {
          console.error('Admin verification error:', error);
          setAdminVerified(false);
        } finally {
          setIsVerifyingAdmin(false);
        }
      } else {
        setAdminVerified(false);
      }
    };
    
    verifyAdmin();
  }, [user, authLoading, checkAdminRole]);
  
  // Separate effect for initialization tasks
  useEffect(() => {
    document.title = "Blog Admin | Laptop Hunter";
    console.log('BlogAdmin: Initial component mount');
    
    // Only fetch posts if we've verified admin status
    if (adminVerified) {
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

  // Add effect to refresh posts after successful deletion
  useEffect(() => {
    if (deleteSuccess) {
      console.log('BlogAdmin: Post deleted successfully, refreshing posts list');
      fetchPosts();
    }
  }, [deleteSuccess, fetchPosts]);

  // Detailed console logs for debugging
  console.log('BlogAdmin render state:', { 
    authLoading, 
    isVerifyingAdmin,
    user: !!user, 
    isAdmin, 
    adminVerified,
    postsLoading: loading,
    postsError: !!error,
    postsCount: posts?.length || 0
  });

  // Show loading while checking authentication
  if (authLoading || isVerifyingAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Verifying permissions...</p>
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

  // Redirect if not an admin (based on verified admin status)
  if (!adminVerified) {
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
