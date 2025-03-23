
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BlogPost } from '@/contexts/blog';

interface BlogPostHeaderProps {
  post: BlogPost;
  category: string;
}

export const BlogPostHeader = ({ post, category }: BlogPostHeaderProps) => {
  return (
    <>
      <div className="mb-6">
        <Link to={`/blog/${category}`}>
          <Button variant="ghost" size="sm" className="flex items-center text-gray-600">
            <ChevronLeft className="mr-1 h-4 w-4" /> 
            Back to {category === 'Top10' ? 'Top 10' : category === 'How-To' ? 'How-To Guides' : `${category}s`}
          </Button>
        </Link>
      </div>
      
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
        <div className="flex items-center text-gray-500 text-sm">
          <span>By {post.author}</span>
          <span className="mx-2">•</span>
          <time dateTime={post.created_at}>
            {format(new Date(post.created_at), 'MMMM d, yyyy')}
          </time>
          {post.tags && post.tags.length > 0 && (
            <>
              <span className="mx-2">•</span>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </header>
      
      {post.image_url && (
        <div className="mb-8">
          <img 
            src={post.image_url} 
            alt={post.title} 
            className="w-full h-auto rounded-lg shadow-md"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=1200&h=630';
            }}
          />
        </div>
      )}
    </>
  );
};
