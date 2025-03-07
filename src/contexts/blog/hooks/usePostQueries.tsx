
import { useMemo } from 'react';
import { BlogPost } from '../types';

export const usePostQueries = (posts: BlogPost[]) => {
  // Get post by slug and category
  const getPostBySlug = (slug: string, category: string) => {
    return posts.find(post => post.slug === slug && post.category === category);
  };

  // Get posts by category
  const getPostsByCategory = (category: string) => {
    return posts.filter(post => post.category === category && post.published);
  };

  // Get recent posts
  const getRecentPosts = (limit = 5) => {
    return [...posts]
      .filter(post => post.published)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  };

  return {
    getPostBySlug,
    getPostsByCategory,
    getRecentPosts
  };
};
