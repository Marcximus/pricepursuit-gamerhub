
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBlog } from '@/contexts/blog';
import { toast } from '@/components/ui/use-toast';

export const usePostActions = () => {
  const navigate = useNavigate();
  const { createPost, updatePost, getPostBySlug } = useBlog();
  const [isSaving, setIsSaving] = useState(false);
  
  const handlePreview = (category: string, slug: string) => {
    window.open(`/blog/${category}/post/${slug}`, '_blank');
  };
  
  const handleCancel = () => {
    navigate('/blog/admin');
  };
  
  const handleSave = async (
    e: React.FormEvent,
    postData: {
      title: string;
      slug: string;
      content: string;
      excerpt: string;
      category: 'Top10' | 'Review' | 'Comparison' | 'How-To';
      image_url?: string;
      additional_images?: string[];
      author: string;
      published: boolean;
      tags?: string[];
    },
    editId: string | null
  ) => {
    e.preventDefault();
    
    if (!postData.title || !postData.slug || !postData.content || !postData.excerpt || !postData.category) {
      toast({
        title: "Validation error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    const existingPost = getPostBySlug(postData.slug, postData.category);
    if (existingPost && existingPost.id !== editId) {
      toast({
        title: "Slug already exists",
        description: "A post with this slug already exists in this category. Please use a different slug.",
        variant: "destructive",
      });
      return;
    }

    // Check if the content has a video placement
    const hasVideoPlacement = postData.content.includes("window.humixPlayers");
    if (!hasVideoPlacement) {
      const shouldContinue = window.confirm("Your post doesn't include a video placement. Are you sure you want to save without a video?");
      if (!shouldContinue) {
        return;
      }
    }
    
    try {
      setIsSaving(true);
      
      let success;
      if (editId) {
        success = await updatePost(editId, postData);
      } else {
        const newPost = await createPost(postData);
        success = !!newPost;
      }
      
      if (success) {
        toast({
          title: editId ? "Post updated" : "Post created",
          description: editId 
            ? "Your blog post has been updated successfully." 
            : "Your blog post has been created successfully.",
        });
        navigate(postData.published ? `/blog/${postData.category}/post/${postData.slug}` : '/blog/admin');
      }
    } catch (error) {
      console.error('Error saving post:', error);
      toast({
        title: "Save failed",
        description: "There was an error saving your post.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return {
    isSaving,
    handlePreview,
    handleCancel,
    handleSave
  };
};
