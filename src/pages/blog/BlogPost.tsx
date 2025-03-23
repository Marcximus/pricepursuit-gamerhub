
import { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useBlog } from '@/contexts/blog';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { BlogSEO } from '@/components/blog/BlogSEO';
import { 
  BlogPostHeader, 
  BlogPostContent, 
  BlogPostFooter,
  fixTopTenHtmlIfNeeded,
  injectAdditionalImages,
  addImageFallbacks
} from '@/components/blog/post';

const BlogPost = () => {
  const { category, slug } = useParams<{ category: string; slug: string }>();
  const { getPostBySlug } = useBlog();
  const navigate = useNavigate();
  const location = useLocation();
  
  const post = category && slug ? getPostBySlug(slug, category) : undefined;
  const currentUrl = new URL(location.pathname, window.location.origin).toString();
  
  useEffect(() => {
    if (post) {
      document.title = `${post.title} | Laptop Hunter Blog`;
      
      if (post.content.includes('humixPlayers')) {
        const existingScript = document.querySelector('script[src="https://www.humix.com/video.js"]');
        if (!existingScript) {
          const script = document.createElement('script');
          script.src = 'https://www.humix.com/video.js';
          script.async = true;
          script.setAttribute('data-ezscrex', 'false');
          script.setAttribute('data-cfasync', 'false');
          document.body.appendChild(script);
        }
      }
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

  // Process content
  const fixedContent = fixTopTenHtmlIfNeeded(post.content, post.category);
  const processedContent = injectAdditionalImages(fixedContent, post.additional_images, post.category);
  const contentWithFallbacks = addImageFallbacks(processedContent);

  return (
    <div className="min-h-screen pb-16">
      <BlogSEO post={post} url={currentUrl} />
      
      <Navigation />
      
      <div className="pt-20 container mx-auto px-4 mt-10">
        <div className="max-w-3xl mx-auto">
          <article>
            <BlogPostHeader post={post} category={category} />
            
            <BlogPostContent post={post} content={contentWithFallbacks} />
            
            <BlogPostFooter postId={post.id} category={category} />
          </article>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;
