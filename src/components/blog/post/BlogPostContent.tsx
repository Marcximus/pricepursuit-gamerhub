
import { useEffect } from 'react';
import { BlogPost } from '@/contexts/blog';
import { removeJsonFormatting } from '@/services/blog/top10/contentProcessor';
import { getTop10BlogStyles } from './styles/top10BlogStyles';

interface BlogPostContentProps {
  post: BlogPost;
  content: string;
}

export const BlogPostContent = ({ post, content }: BlogPostContentProps) => {
  const cleanContent = removeJsonFormatting(content);

  useEffect(() => {
    if (post.category === 'Top10' && !document.getElementById('top10-blog-styles')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'top10-blog-styles';
      styleElement.textContent = getTop10BlogStyles();
      document.head.appendChild(styleElement);
    }

    // Ensure links are clickable by adding a small script
    if (post.category === 'Top10' && !document.getElementById('product-links-fix')) {
      const script = document.createElement('script');
      script.id = 'product-links-fix';
      script.textContent = `
        document.addEventListener('DOMContentLoaded', () => {
          // Fix any product card links if needed
          const productLinks = document.querySelectorAll('.product-card a');
          productLinks.forEach(link => {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'nofollow noopener');
          });
        });
      `;
      document.head.appendChild(script);
    }
    
    return () => {
      const styleElement = document.getElementById('top10-blog-styles');
      if (styleElement) {
        styleElement.remove();
      }
      const script = document.getElementById('product-links-fix');
      if (script) {
        script.remove();
      }
    };
  }, [post.category]);

  return (
    <div 
      className="prose prose-lg max-w-none" 
      dangerouslySetInnerHTML={{ __html: cleanContent }}
    />
  );
};
