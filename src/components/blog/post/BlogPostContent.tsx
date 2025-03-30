
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
    // Add Top10 blog styles
    if (post.category === 'Top10' && !document.getElementById('top10-blog-styles')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'top10-blog-styles';
      styleElement.textContent = getTop10BlogStyles();
      document.head.appendChild(styleElement);
    }

    // Fix product card links immediately after the content is rendered
    const fixProductLinks = () => {
      if (!contentRef.current) return;
      
      // Get all product links in the current content
      const productLinks = contentRef.current.querySelectorAll('.product-card a');
      
      // Make sure each link has proper attributes
      productLinks.forEach(link => {
        // Set proper target and rel attributes for external links
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'nofollow noopener');
        
        // Ensure pointer cursor is set
        (link as HTMLElement).style.cursor = 'pointer';
        
        // Prevent default on click and manually navigate to href
        link.addEventListener('click', (e) => {
          const href = link.getAttribute('href');
          if (href) {
            window.open(href, '_blank', 'noopener,noreferrer');
          }
        });
      });
      
      // Fix specifically identified links by their class
      ['product-title-link', 'product-image-link', 'product-rating-link', 'product-price-link'].forEach(className => {
        const specialLinks = contentRef.current!.querySelectorAll(`.${className}`);
        specialLinks.forEach(link => {
          (link as HTMLElement).style.cursor = 'pointer';
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'nofollow noopener');
        });
      });
    };

    // Fix links both on initial render and after a small delay to ensure DOM is fully rendered
    fixProductLinks();
    
    // Also fix links after a small delay to ensure all content is rendered
    const timeout = setTimeout(fixProductLinks, 500);
    
    // Add a MutationObserver to handle dynamic content changes
    const observer = new MutationObserver(fixProductLinks);
    if (contentRef.current) {
      observer.observe(contentRef.current, { childList: true, subtree: true });
    }
    
    return () => {
      // Clean up styles and scripts
      const styleElement = document.getElementById('top10-blog-styles');
      if (styleElement) {
        styleElement.remove();
      }
      
      // Clean up the timeout and observer
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, [post.category, cleanContent]);

  return (
    <div 
      ref={contentRef}
      className="prose prose-lg max-w-none" 
      dangerouslySetInnerHTML={{ __html: cleanContent }}
    />
  );
};
