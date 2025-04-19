
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
    
    // Add How-To specific styles
    if (post.category === 'How-To' && !document.getElementById('how-to-blog-styles')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'how-to-blog-styles';
      
      // Inline the styles to avoid requiring an additional file
      styleElement.textContent = `
        /* How-To Blog Post Styles */
        .qa-item {
          margin: 1.5rem 0;
          padding: 1rem;
          border-radius: 0.5rem;
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
        }
        
        .qa-item .question {
          font-weight: 600;
          color: #334155;
          margin-bottom: 0.5rem;
        }
        
        .qa-item .question h3,
        .qa-item .question p {
          margin: 0;
          font-weight: 600;
        }
        
        .qa-item .answer {
          padding-left: 1rem;
          border-left: 3px solid #60a5fa;
        }
        
        .faq-section {
          margin: 2rem 0;
          padding: 1.5rem;
          border-radius: 0.5rem;
          background-color: #f0f9ff;
          border: 1px solid #bae6fd;
        }
        
        .faq-section > h2 {
          color: #0369a1;
          margin-top: 0;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #0ea5e9;
        }
        
        .step-container {
          margin: 1.5rem 0;
          padding: 1.5rem;
          border-left: 4px solid #4f46e5;
          background-color: #f5f3ff;
          border-radius: 0 0.5rem 0.5rem 0;
        }
        
        .step-container h2,
        .step-container h3 {
          display: flex;
          align-items: center;
          margin-top: 0;
          color: #4338ca;
        }
        
        .step-number {
          background-color: #4f46e5;
          color: white;
          width: 2rem;
          height: 2rem;
          border-radius: 9999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-right: 0.75rem;
          flex-shrink: 0;
          font-weight: bold;
          font-size: 0.875rem;
        }
        
        .step-content {
          margin-top: 1rem;
        }
        
        .tip-box, .warning-box {
          margin: 1.5rem 0;
          padding: 1rem 1rem 1rem 3rem;
          border-radius: 0.5rem;
          position: relative;
        }
        
        .tip-box {
          background-color: #ecfdf5;
          border: 1px solid #6ee7b7;
        }
        
        .warning-box {
          background-color: #fff7ed;
          border: 1px solid #fdba74;
        }
        
        .tip-box:before, .warning-box:before {
          position: absolute;
          left: 1rem;
          top: 1rem;
          font-size: 1.25rem;
        }
        
        .tip-box:before {
          content: "💡";
        }
        
        .warning-box:before {
          content: "⚠️";
        }
        
        .prose table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
        }
        
        .prose th {
          background-color: #f8fafc;
          font-weight: 600;
          text-align: left;
        }
        
        .prose th, .prose td {
          padding: 0.75rem 1rem;
          border: 1px solid #e2e8f0;
        }
        
        .prose tbody tr:nth-child(odd) {
          background-color: #f8fafc;
        }
      `;
      
      document.head.appendChild(styleElement);
    }
    
    return () => {
      // Clean up styles when component unmounts
      const top10Styles = document.getElementById('top10-blog-styles');
      if (top10Styles) {
        top10Styles.remove();
      }
      
      const howToStyles = document.getElementById('how-to-blog-styles');
      if (howToStyles) {
        howToStyles.remove();
      }
    };
  }, [post.category]);

  // Effect to ensure all links in product cards are working correctly
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
