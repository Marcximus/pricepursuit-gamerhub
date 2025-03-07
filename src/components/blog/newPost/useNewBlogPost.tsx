
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useBlog } from '@/contexts/BlogContext';
import { usePostMetadata, usePostContent, usePostActions } from './hooks';
import { usePostAI } from './hooks/usePostAI';

export const useNewBlogPost = () => {
  const location = useLocation();
  const { posts, getPostBySlug } = useBlog();
  
  const searchParams = new URLSearchParams(location.search);
  const editId = searchParams.get('edit');
  
  // Find post if in edit mode
  const existingPost = editId ? posts.find(post => post.id === editId) : undefined;
  
  // Initialize content state
  const {
    title,
    content,
    excerpt,
    setTitle,
    setContent,
    setExcerpt
  } = usePostContent(existingPost);
  
  // Initialize metadata state
  const {
    slug,
    category,
    imageUrl,
    additionalImages,
    author,
    published,
    tags,
    tagsInput,
    setTags,
    setTagsInput,
    handleTagsInputChange,
    handleMetadataChange
  } = usePostMetadata(title, editId, existingPost);
  
  // Initialize actions
  const {
    isSaving,
    handlePreview: baseHandlePreview,
    handleCancel,
    handleSave: baseHandleSave
  } = usePostActions();
  
  // Initialize AI features
  const {
    isGenerating,
    prompt,
    setPrompt,
    selectedCategory,
    setSelectedCategory,
    asin,
    setAsin,
    asin2,
    setAsin2,
    handleGenerateContent
  } = usePostAI(
    setTitle, 
    setContent, 
    setExcerpt, 
    (value) => handleMetadataChange('category', value), 
    setTags, 
    setTagsInput
  );
  
  // Prepare blog post preview data
  const previewPost = {
    title,
    slug,
    content,
    excerpt,
    category,
    image_url: imageUrl,
    additional_images: additionalImages,
    author,
    published,
    tags,
    created_at: new Date().toISOString(),
  };
  
  const currentUrl = window.location.origin + `/blog/${category}/post/${slug}`;
  const isValid = !!title && !!slug && !!content && !!excerpt;
  
  // Update document title based on edit mode
  useEffect(() => {
    if (editId && existingPost) {
      document.title = `Edit: ${existingPost.title} | Laptop Hunter Blog`;
    } else {
      document.title = "New Blog Post | Laptop Hunter Blog";
    }
  }, [editId, existingPost]);
  
  // Handle preview with current state
  const handlePreview = () => baseHandlePreview(category, slug);
  
  // Handle save with current state
  const handleSave = (e: React.FormEvent) => {
    baseHandleSave(e, {
      title,
      slug,
      content,
      excerpt,
      category,
      image_url: imageUrl || undefined,
      additional_images: additionalImages.length > 0 ? additionalImages : undefined,
      published,
      tags: tags.length > 0 ? tags : undefined,
      // Removed the author property from this object as it's not expected in the type
    }, editId);
  };

  return {
    // State
    title,
    slug,
    content,
    excerpt,
    category,
    imageUrl,
    additionalImages,
    author,
    published,
    tags,
    tagsInput,
    isGenerating,
    isSaving,
    editId,
    previewPost,
    currentUrl,
    isValid,
    
    // AI generation state
    prompt,
    setPrompt,
    selectedCategory,
    setSelectedCategory,
    asin,
    setAsin,
    asin2,
    setAsin2,
    
    // Setters
    setTitle,
    setContent,
    setExcerpt,
    
    // Handlers
    handleTagsInputChange,
    handleMetadataChange,
    handlePreview,
    handleCancel,
    handleGenerateContent,
    handleSave
  };
};
