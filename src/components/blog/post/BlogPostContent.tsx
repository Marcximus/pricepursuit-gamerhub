
import { useEffect, useRef } from 'react';
import { BlogPost } from '@/contexts/blog';
import { removeJsonFormatting } from '@/services/blog/top10/contentProcessor';
import { getTop10BlogStyles } from './styles/top10BlogStyles';

interface BlogPostContentProps {
  post: BlogPost;
  content: string;
}

export const BlogPostContent = ({ post, content }: BlogPostContentProps) => {
  const cleanContent = removeJsonFormatting(content);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Add category-specific styles
    if (post.category === 'Top10' && !document.getElementById('top10-blog-styles')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'top10-blog-styles';
      styleElement.textContent = getTop10BlogStyles();
      document.head.appendChild(styleElement);
    }
    
    // For How-To posts, we'll use the external CSS file that's already included
    // This ensures the styles are properly applied without dynamic injection issues
    
    return () => {
      // Clean up styles when component unmounts
      const top10Styles = document.getElementById('top10-blog-styles');
      if (top10Styles) {
        top10Styles.remove();
      }
    };
  }, [post.category]);

  // Effect to ensure all links in product cards and image handling are working correctly
  useEffect(() => {
    if (!contentRef.current) return;

    // Fix product card links
    const fixProductCardLinks = () => {
      const productCards = contentRef.current?.querySelectorAll('.product-card');
      
      productCards?.forEach(card => {
        // Find all the clickable elements in each card
        const links = card.querySelectorAll('a');
        
        // Make sure they have the correct attributes
        links.forEach(link => {
          if (!link.getAttribute('target')) {
            link.setAttribute('target', '_blank');
          }
          if (!link.getAttribute('rel')) {
            link.setAttribute('rel', 'nofollow noopener');
          }
          // Ensure z-index is set for proper stacking context
          link.style.position = 'relative';
          link.style.zIndex = '5';
          // Make sure cursor is pointer
          link.style.cursor = 'pointer';
        });
      });
    };
    
    // Enhance uploaded images with proper styling
    const enhanceImages = () => {
      const blogImages = contentRef.current?.querySelectorAll('img:not(.product-image)');
      
      blogImages?.forEach(img => {
        if (!img.classList.contains('blog-image')) {
          img.classList.add('blog-image');
        }
      });
    };

    // Run immediately after render
    fixProductCardLinks();
    enhanceImages();

    // Use MutationObserver to handle dynamically loaded content
    const observer = new MutationObserver(() => {
      fixProductCardLinks();
      enhanceImages();
    });
    observer.observe(contentRef.current, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, [content]);

  // Remove the extra processing for How-To blogs that might be stripping HTML
  const getProcessedContent = () => {
    // For How-To blogs, simply return the cleaned content without additional processing
    if (post.category === 'How-To') {
      return cleanContent;
    }
    
    return cleanContent;
  };

  return (
    <div 
      ref={contentRef}
      className={`prose prose-lg max-w-none ${post.category === 'How-To' ? 'how-to-content' : ''}`} 
      dangerouslySetInnerHTML={{ __html: getProcessedContent() }}
    />
  );
};
