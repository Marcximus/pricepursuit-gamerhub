
import { Link } from 'react-router-dom';
import { BlogPost } from '@/contexts/blog';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useRelatedPosts } from './hooks';

interface RelatedPostsProps {
  currentPostId?: string;
  currentCategory: string;
}

export const RelatedPosts = ({ currentPostId, currentCategory }: RelatedPostsProps) => {
  const { randomPosts, latestPosts, hasRelatedPosts } = useRelatedPosts(currentPostId, currentCategory);

  if (!hasRelatedPosts) {
    return null;
  }

  return (
    <div className="mt-12">
      <Separator className="my-8" />
      
      <div className="space-y-12">
        {randomPosts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">You Might Also Like</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {randomPosts.map(post => (
                <RelatedPostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        )}
        
        {latestPosts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Latest Posts</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
    <Card className="group h-full overflow-hidden hover:shadow-lg transition-all duration-300 border-2 border-gray-100 hover:border-green-100">
      <Link 
        to={`/blog/${post.category}/post/${post.slug}`}
        className="block h-full"
        aria-label={`Read article: ${post.title}`}
      >
        <div className="aspect-video overflow-hidden bg-gray-100">
          {post.image_url && (
            <img 
              src={post.image_url} 
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
          )}
        </div>
        
        <CardContent className="p-5">
          <div className="space-y-3">
            <h4 className="font-semibold text-lg line-clamp-2 group-hover:text-green-600 transition-colors">
              {post.title}
            </h4>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <time dateTime={post.created_at}>
                {new Date(post.created_at).toLocaleDateString()}
              </time>
              <span>·</span>
              <span>
                {post.category === 'Top10' ? 'Top 10' : 
                 post.category === 'How-To' ? 'How-To Guide' : 
                 post.category}
              </span>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
              {post.excerpt}
            </p>
            <div className="pt-2">
              <span className="text-green-600 text-sm font-medium group-hover:text-green-700 transition-colors inline-flex items-center">
                Read Article
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};
