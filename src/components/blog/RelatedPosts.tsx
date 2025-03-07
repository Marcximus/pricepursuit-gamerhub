
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBlog } from '@/contexts/blog';
import { BlogPost } from '@/contexts/blog';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface RelatedPostsProps {
  currentPostId?: string;
  currentCategory: string;
}

export const RelatedPosts = ({ currentPostId, currentCategory }: RelatedPostsProps) => {
  const { posts } = useBlog();
  const [randomPosts, setRandomPosts] = useState<BlogPost[]>([]);
  const [latestPosts, setLatestPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
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

  if (randomPosts.length === 0 && latestPosts.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <Separator className="my-8" />
      
      <div className="space-y-8">
        {randomPosts.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold mb-4">You Might Also Like</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {randomPosts.map(post => (
                <RelatedPostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        )}
        
        {latestPosts.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold mb-4">Latest Posts</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {latestPosts.map(post => (
                <RelatedPostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const RelatedPostCard = ({ post }: { post: BlogPost }) => {
  return (
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <Link to={`/blog/${post.category}/${post.slug}`} className="space-y-3 block h-full">
          {post.image_url && (
            <div className="aspect-video overflow-hidden rounded">
              <img 
                src={post.image_url} 
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div>
            <h4 className="font-semibold line-clamp-2">{post.title}</h4>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{post.excerpt}</p>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
};
