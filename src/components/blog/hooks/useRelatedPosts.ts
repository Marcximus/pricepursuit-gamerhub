
import { useState, useEffect } from 'react';
import { useBlog } from '@/contexts/blog';
import { BlogPost } from '@/contexts/blog';

export function useRelatedPosts(currentPostId?: string, currentCategory?: string) {
  const { posts } = useBlog();
  const [randomPosts, setRandomPosts] = useState<BlogPost[]>([]);
  const [latestPosts, setLatestPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    if (!posts.length) return;
    
    // Filter out the current post
    const filteredPosts = posts.filter(post => post.id !== currentPostId && post.published);
    
    // Get 3 random posts
    const getRandomPosts = () => {
      const shuffled = [...filteredPosts].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 3);
    };
    
    // Get 3 latest posts
    const getLatestPosts = () => {
      return [...filteredPosts]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 3);
    };
    
    setRandomPosts(getRandomPosts());
    setLatestPosts(getLatestPosts());
  }, [posts, currentPostId]);

  return {
    randomPosts,
    latestPosts,
    hasRelatedPosts: randomPosts.length > 0 || latestPosts.length > 0
  };
}
