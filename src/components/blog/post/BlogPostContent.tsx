
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
    if (post.category === 'Top10' && !document.getElementById('top10-blog-styles')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'top10-blog-styles';
      styleElement.textContent = getTop10BlogStyles();
      document.head.appendChild(styleElement);
    }
    
    return () => {
      const styleElement = document.getElementById('top10-blog-styles');
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, [post.category]);

  // Effect to ensure all links in product cards are working correctly
  useEffect(() => {
    if (!contentRef.current) return;

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

    // Run immediately after render
    fixProductCardLinks();

    // Use MutationObserver to handle dynamically loaded content
    const observer = new MutationObserver(fixProductCardLinks);
    observer.observe(contentRef.current, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, [content]);

  return (
    <div 
      ref={contentRef}
      className="prose prose-lg max-w-none" 
      dangerouslySetInnerHTML={{ __html: cleanContent }}
    />
  );
};
