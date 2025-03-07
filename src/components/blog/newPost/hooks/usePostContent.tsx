
import { useState } from 'react';
import { BlogPost } from '@/contexts/BlogContext';

export const usePostContent = (existingPost?: Partial<BlogPost>) => {
  const [title, setTitle] = useState(existingPost?.title || '');
  const [content, setContent] = useState(existingPost?.content || '');
  const [excerpt, setExcerpt] = useState(existingPost?.excerpt || '');
  
  return {
    title,
    content,
    excerpt,
    setTitle,
    setContent,
    setExcerpt
  };
};
