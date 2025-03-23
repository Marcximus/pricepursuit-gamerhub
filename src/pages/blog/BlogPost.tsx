
import { useEffect } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { useBlog } from '@/contexts/blog';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { ChevronLeft } from 'lucide-react';
import { BlogSEO } from '@/components/blog/BlogSEO';
import { RelatedPosts } from '@/components/blog/RelatedPosts';

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
      
      // Add styling for Top10 list items if not already present
      if (post.category === 'Top10' && !document.getElementById('top10-blog-styles')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'top10-blog-styles';
        styleElement.textContent = `
          .prose h1 { font-size: 2.5rem; line-height: 1.2; margin-bottom: 1.5rem; text-align: center; }
          .prose h3 { font-size: 1.75rem; line-height: 1.3; margin-top: 2rem; margin-bottom: 1rem; color: #2563eb; }
          .prose hr { margin: 2rem 0; }
          .prose ul.my-4 { margin: 1rem 0; padding-left: 1.5rem; }
          .prose ul.my-4 li { margin-bottom: 0.5rem; list-style-type: none; position: relative; padding-left: 1.5rem; }
          .prose ul.my-4 li:before { content: "✅"; position: absolute; left: 0; }
        `;
        document.head.appendChild(styleElement);
      }
    } else if (slug) {
      document.title = "Post Not Found | Laptop Hunter Blog";
    }
    
    if (post && post.content.includes('humixPlayers')) {
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
    
    // Clean up
    return () => {
      const styleElement = document.getElementById('top10-blog-styles');
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, [post, slug]);

  const injectAdditionalImages = (content: string, additionalImages: string[]) => {
    if (!additionalImages || additionalImages.length === 0) return content;
    
    if (post?.category === 'Top10') {
      let modifiedContent = content;
      const headers = content.match(/<h[2-3][^>]*>.*?<\/h[2-3]>/gi) || [];
      
      headers.forEach((header, index) => {
        if (index < additionalImages.length) {
          const imgSrc = additionalImages[index];
          const imageHtml = `<div class="my-4">
            <img 
              src="${imgSrc}" 
              alt="List item ${index + 1}" 
              class="rounded-lg w-full" 
              onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=300&h=200';"
            />
          </div>`;
          
          modifiedContent = modifiedContent.replace(
            header,
            `${header}${imageHtml}`
          );
        }
      });
      
      return modifiedContent;
    }
    
    if (['Review', 'How-To', 'Comparison'].includes(post?.category || '')) {
      let modifiedContent = content;
      const paragraphs = content.match(/<p>.*?<\/p>/gi) || [];
      
      additionalImages.forEach((img, index) => {
        const targetParagraphIndex = Math.min(
          Math.floor(paragraphs.length * (index + 1) / (additionalImages.length + 1)),
          paragraphs.length - 1
        );
        
        if (targetParagraphIndex >= 0 && paragraphs[targetParagraphIndex]) {
          const imageHtml = `<div class="my-4">
            <img 
              src="${img}" 
              alt="Image ${index + 1}" 
              class="rounded-lg w-full" 
              onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=300&h=200';"
            />
          </div>`;
          
          modifiedContent = modifiedContent.replace(
            paragraphs[targetParagraphIndex],
            `${paragraphs[targetParagraphIndex]}${imageHtml}`
          );
        }
      });
      
      return modifiedContent;
    }
    
    return content;
  };

  const fixTopTenHtmlIfNeeded = (content: string, category: string) => {
    if (category !== 'Top10') return content;
    
    // Check if there are unclosed tags in the content
    let processedContent = content;
    
    // Ensure h1 tags are properly formatted
    processedContent = processedContent.replace(/<h1([^>]*)>([^<]*?)(?=<(?!\/h1>))/g, '<h1$1>$2</h1>');
    
    // Ensure h3 tags are properly formatted
    processedContent = processedContent.replace(/<h3>([^<]*?)(?=<(?!\/h3>))/g, '<h3>$1</h3>');
    
    // Fix paragraph tags
    processedContent = processedContent.replace(/<p>([^<]*?)(?=<(?!\/p>))/g, '<p>$1</p>');
    
    // Fix list items
    processedContent = processedContent.replace(/<li>([^<]*?)(?=<(?!\/li>))/g, '<li>$1</li>');
    
    // Ensure proper list tag closure
    processedContent = processedContent.replace(/<ul class="my-4">([^]*?)(?=<(?!\/ul>))/g, '<ul class="my-4">$1</ul>');
    
    return processedContent;
  };

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

  const fixedContent = fixTopTenHtmlIfNeeded(post.content, post.category);
  const processedContent = injectAdditionalImages(fixedContent, post.additional_images || []);
  
  // Replace img tags to add onerror fallback handler
  const contentWithFallbacks = processedContent.replace(
    /<img([^>]*)>/g, 
    '<img$1 onerror="this.onerror=null; this.src=\'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=300&h=200\';">'
  );

  return (
    <div className="min-h-screen pb-16">
      <BlogSEO post={post} url={currentUrl} />
      
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
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=1200&h=630';
                  }}
                />
              </div>
            )}
            
            <div 
              className="prose prose-lg max-w-none" 
              dangerouslySetInnerHTML={{ __html: contentWithFallbacks }}
            />
            
            <RelatedPosts currentPostId={post.id} currentCategory={category} />
            
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
