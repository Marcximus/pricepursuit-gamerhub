
import { ReactNode, useEffect } from 'react';
import { usePostFetching, usePostManagement, usePostQueries } from './hooks';
import BlogContext from './BlogContext';
import { useAuth } from '@/contexts/AuthContext';

export const BlogProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { posts, setPosts, loading, error, fetchPosts } = usePostFetching();
  const { createPost, updatePost, deletePost } = usePostManagement(posts, setPosts);
  const { getPostBySlug, getPostsByCategory, getRecentPosts } = usePostQueries(posts);

  useEffect(() => {
    // Initial fetch of posts
    fetchPosts();
    
    // Refetch posts when user authentication state changes
    if (user) {
      console.log('User authenticated, refreshing posts');
      fetchPosts();
    }
  }, [fetchPosts, user]);

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
  };

  return <BlogContext.Provider value={value}>{children}</BlogContext.Provider>;
};
