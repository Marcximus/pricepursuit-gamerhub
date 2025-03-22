
import { ReactNode } from 'react';
import { usePostFetching, usePostManagement, usePostQueries } from './hooks';
import BlogContext from './BlogContext';
import { useEffect } from 'react';

export const BlogProvider = ({ children }: { children: ReactNode }) => {
  const { posts, setPosts, loading, error, fetchPosts } = usePostFetching();
  const { createPost, updatePost, deletePost } = usePostManagement(posts, setPosts);
  const { getPostBySlug, getPostsByCategory, getRecentPosts } = usePostQueries(posts);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

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
