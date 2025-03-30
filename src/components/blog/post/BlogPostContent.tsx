
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
      dangerouslySetInnerHTML={{ __html: cleanContent }}
    />
  );
};
