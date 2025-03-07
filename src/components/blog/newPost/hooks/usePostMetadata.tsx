
import { useState, useEffect } from 'react';
import { BlogPost } from '@/contexts/BlogContext';

export const usePostMetadata = (
  title: string, 
  editId: string | null,
  existingPost?: Partial<BlogPost>
) => {
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState<'Top10' | 'Review' | 'Comparison' | 'How-To'>('Review');
  const [imageUrl, setImageUrl] = useState('');
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [author, setAuthor] = useState('Laptop Hunter Team');
  const [published, setPublished] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagsInput, setTagsInput] = useState('');
  
  // Initialize from existing post if editing
  useEffect(() => {
    if (existingPost) {
      setSlug(existingPost.slug || '');
      setCategory(existingPost.category || 'Review');
      setImageUrl(existingPost.image_url || '');
      setAdditionalImages(existingPost.additional_images || []);
      setAuthor(existingPost.author || 'Laptop Hunter Team');
      setPublished(existingPost.published || false);
      setTags(existingPost.tags || []);
      setTagsInput(existingPost.tags?.join(', ') || '');
    }
  }, [existingPost]);
  
  // Generate slug from title when creating new post
  useEffect(() => {
    if (title && !editId) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
      setSlug(generatedSlug);
    }
  }, [title, editId]);
  
  const handleTagsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagsInput(e.target.value);
    setTags(e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag));
  };

  const handleMetadataChange = (field: string, value: any) => {
    switch (field) {
      case 'published':
        setPublished(value);
        break;
      case 'category':
        setCategory(value);
        break;
      case 'slug':
        setSlug(value);
        break;
      case 'author':
        setAuthor(value);
        break;
      case 'image_url':
        setImageUrl(value);
        break;
      case 'additional_images':
        setAdditionalImages(value);
        break;
      default:
        break;
    }
  };
  
  return {
    slug,
    category,
    imageUrl,
    additionalImages,
    author,
    published,
    tags,
    tagsInput,
    handleTagsInputChange,
    handleMetadataChange
  };
};
