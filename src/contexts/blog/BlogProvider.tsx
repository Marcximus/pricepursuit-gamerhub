
import { ReactNode, useEffect, useState } from 'react';
import { usePostFetching, usePostManagement, usePostQueries } from './hooks';
import BlogContext from './BlogContext';
import { useAuth } from '@/contexts/AuthContext';

export const BlogProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAdmin, checkAdminRole } = useAuth();
  const { posts, setPosts, loading, error, fetchPosts } = usePostFetching();
  const { createPost, updatePost, deletePost } = usePostManagement(posts, setPosts);
  const { getPostBySlug, getPostsByCategory, getRecentPosts } = usePostQueries(posts);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    // Track initialization to avoid duplicate fetches
    if (!hasInitialized) {
      console.log('BlogProvider: Initial fetch of posts');
      fetchPosts().then(() => setHasInitialized(true));
    }
    
    // Refetch posts when user authentication state changes
    if (user) {
      console.log('User authenticated in BlogProvider, refreshing posts');
      fetchPosts();
    }
  }, [fetchPosts, user, hasInitialized]);

  // Add debugging info
  console.log('BlogProvider state:', { 
    hasUser: !!user, 
    isAdmin, 
    postsLoaded: posts.length > 0,
    loading,
    error
  });

  const value = {
    posts,
    loading,
    error,
    fetchPosts,
    getPostBySlug,
    getPostsByCategory,
    getRecentPosts,
    createPost,
    updatePost,
    deletePost,
    isAdmin
  };

  return <BlogContext.Provider value={value}>{children}</BlogContext.Provider>;
};
