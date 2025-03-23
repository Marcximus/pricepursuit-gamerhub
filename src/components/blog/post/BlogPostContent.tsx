
import { useEffect } from 'react';
import { BlogPost } from '@/contexts/blog';

interface BlogPostContentProps {
  post: BlogPost;
  content: string;
}

export const BlogPostContent = ({ post, content }: BlogPostContentProps) => {
  useEffect(() => {
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
        .prose p { margin-bottom: 1.25rem; }
        .prose p + p { margin-top: 1.25rem; }
        .prose p:has(+ ul) { margin-bottom: 0.75rem; }
        .prose p:has(emoji-prefix) { margin-top: 1.5rem; margin-bottom: 1.5rem; }
        
        /* Improved paragraph spacing */
        .prose p { margin: 1.5rem 0; line-height: 1.7; }
        .prose p:first-of-type { margin-top: 0; }
        
        /* Special styling for emoji-prefixed paragraphs */
        .prose p:has(emoji-prefix), 
        .prose p[emoji-prefix],
        .prose p:first-child:not(:empty) { margin-top: 2rem; margin-bottom: 1.5rem; }
        
        /* Fix for paragraphs starting with emojis */
        .prose p:first-letter { margin-right: 0.1em; }
        
        /* Make product cards stand out better */
        .product-card { margin: 2.5rem 0; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .product-card .product-title { font-size: 1.25rem; line-height: 1.4; }
      `;
      document.head.appendChild(styleElement);
    }
    
    // Clean up
    return () => {
      const styleElement = document.getElementById('top10-blog-styles');
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, [post.category]);

  return (
    <div 
      className="prose prose-lg max-w-none" 
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};
