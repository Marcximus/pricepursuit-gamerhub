
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
