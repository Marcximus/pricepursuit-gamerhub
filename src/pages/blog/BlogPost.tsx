
import { useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useBlog } from '@/contexts/blog';
import Navigation from '@/components/Navigation';
import { BlogSEO } from '@/components/blog/BlogSEO';
import BlogNotFound from './BlogNotFound';
import { 
  BlogPostHeader, 
  BlogPostContent, 
  BlogPostFooter,
  fixTopTenHtmlIfNeeded,
  injectAdditionalImages,
  addImageFallbacks,
  improveContentSpacing
} from '@/components/blog/post';
import { processHowToContent } from '@/services/blog/howto';

const BlogPost = () => {
  const { category, slug } = useParams<{ category: string; slug: string }>();
  const { getPostBySlug } = useBlog();
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
    return <BlogNotFound />;
  }

  // Process content based on category
  let processedContent = post.content;
  
  // Apply category-specific processing
  if (category === 'Top10') {
    processedContent = fixTopTenHtmlIfNeeded(processedContent, category);
  } else if (category === 'How-To') {
    try {
      // Use the synchronous version of our How-To processor
      // We'll handle any errors inside the component for better UX
      const tmpProcessedContent = processHowToContent(processedContent, post.title);
      // Only update if successful
      if (tmpProcessedContent && typeof tmpProcessedContent === 'string') {
        processedContent = tmpProcessedContent;
      }
    } catch (error) {
      console.error('Error processing How-To content:', error);
      // We'll continue with the original content if processing fails
    }
  }
  
  // Common processing for all categories
  const contentWithImages = injectAdditionalImages(processedContent, post.additional_images, category);
  const contentWithFallbacks = addImageFallbacks(contentWithImages);
  const enhancedContent = improveContentSpacing(contentWithFallbacks);

  return (
    <div className="min-h-screen pb-16">
      <BlogSEO post={post} url={currentUrl} />
      
      <Navigation />
      
      <div className="pt-20 container mx-auto px-4 mt-10">
        <div className="max-w-3xl mx-auto">
          <article>
            <BlogPostHeader post={post} category={category} />
            
            <BlogPostContent post={post} content={enhancedContent} />
            
            <BlogPostFooter postId={post.id} category={category} />
          </article>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;
