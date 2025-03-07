
import { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useBlog } from '@/contexts/BlogContext';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { ChevronLeft } from 'lucide-react';

const BlogPost = () => {
  const { category, slug } = useParams<{ category: string; slug: string }>();
  const { getPostBySlug } = useBlog();
  const navigate = useNavigate();
  
  const post = category && slug ? getPostBySlug(slug, category) : undefined;
  
  useEffect(() => {
    if (post) {
      document.title = `${post.title} | Laptop Hunter Blog`;
    } else if (slug) {
      document.title = "Post Not Found | Laptop Hunter Blog";
    }
  }, [post, slug]);

  if (!category || !slug) {
    return <div>Invalid URL parameters</div>;
  }

  if (!post) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="pt-20 container mx-auto px-4 mt-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <p className="text-gray-600 mb-8">The blog post you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/blog')}>Back to Blog</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      <Navigation />
      
      <div className="pt-20 container mx-auto px-4 mt-10">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Link to={`/blog/${category}`}>
              <Button variant="ghost" size="sm" className="flex items-center text-gray-600">
                <ChevronLeft className="mr-1 h-4 w-4" /> Back to {category === 'Top10' ? 'Top 10' : category === 'How-To' ? 'How-To Guides' : `${category}s`}
              </Button>
            </Link>
          </div>
          
          <article>
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
                />
              </div>
            )}
            
            <div 
              className="prose prose-lg max-w-none" 
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
            
            <Separator className="my-8" />
            
            <div className="flex justify-between items-center py-4">
              <Link to={`/blog/${category}`}>
                <Button variant="outline">
                  ← More {category === 'Top10' ? 'Top 10 Lists' : category === 'How-To' ? 'How-To Guides' : `${category} Articles`}
                </Button>
              </Link>
              <Link to="/blog">
                <Button variant="outline">All Blog Posts</Button>
              </Link>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;
