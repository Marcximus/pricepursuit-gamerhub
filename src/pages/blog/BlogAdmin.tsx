
import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBlog } from '@/contexts/BlogContext';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Trash2, Plus } from 'lucide-react';
import { format } from 'date-fns';

const BlogAdmin = () => {
  const { posts, loading, error, deletePost, fetchPosts } = useBlog();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const navigate = useNavigate();
  
  // Use useCallback to prevent function recreation on each render
  const refreshPosts = useCallback(() => {
    console.log('BlogAdmin: Manually refreshing posts');
    fetchPosts();
  }, [fetchPosts]);
  
  useEffect(() => {
    document.title = "Blog Admin | Laptop Hunter";
    refreshPosts();
  }, [refreshPosts]);

  // Reset success state when posts change
  useEffect(() => {
    if (deleteSuccess) {
      setDeleteSuccess(false);
    }
  }, [posts]);

  const handleDeletePost = async () => {
    if (!postToDelete) return;
    
    setIsDeleting(true);
    
    try {
      console.log(`BlogAdmin: Deleting post with ID: ${postToDelete}`);
      const success = await deletePost(postToDelete);
      
      if (success) {
        console.log('BlogAdmin: Post deleted successfully');
        setDeleteSuccess(true);
        // Manually refresh posts to ensure the UI is up to date
        refreshPosts();
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

  const confirmDelete = (postId: string) => {
    setPostToDelete(postId);
    setDeleteDialogOpen(true);
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'Top10': return 'bg-blue-100 text-blue-800';
      case 'Review': return 'bg-green-100 text-green-800';
      case 'Comparison': return 'bg-purple-100 text-purple-800';
      case 'How-To': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-20 container mx-auto px-4 mt-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Blog Admin</h1>
          <div className="flex space-x-4">
            <Button onClick={refreshPosts} variant="outline">
              Refresh Posts
            </Button>
            <Link to="/blog/new">
              <Button className="flex items-center">
                <Plus className="mr-2 h-4 w-4" /> New Post
              </Button>
            </Link>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-12">Loading posts...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-12">Error loading posts: {error}</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No blog posts found.</p>
            <Link to="/blog/new">
              <Button>Create Your First Post</Button>
            </Link>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium max-w-[300px] truncate">
                      {post.title}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryBadgeColor(post.category)}`}>
                        {post.category}
                      </span>
                    </TableCell>
                    <TableCell>{format(new Date(post.created_at), 'MMM d, yyyy')}</TableCell>
                    <TableCell>
                      {post.published ? (
                        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">Published</Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500">Draft</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => navigate(`/blog/${post.category}/post/${post.slug}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => navigate(`/blog/new?edit=${post.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => confirmDelete(post.id)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the blog post and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeletePost} 
              className="bg-red-500 hover:bg-red-600"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BlogAdmin;
