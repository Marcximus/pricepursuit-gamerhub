
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useBlog } from '@/contexts/BlogContext';
import { toast } from '@/components/ui/use-toast';

export const useNewBlogPost = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { posts, createPost, updatePost, getPostBySlug } = useBlog();
  const [isAIPromptOpen, setIsAIPromptOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const searchParams = new URLSearchParams(location.search);
  const editId = searchParams.get('edit');
  
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState<'Top10' | 'Review' | 'Comparison' | 'How-To'>('Review');
  const [imageUrl, setImageUrl] = useState('');
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [author, setAuthor] = useState('Laptop Hunter Team');
  const [published, setPublished] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagsInput, setTagsInput] = useState('');
  
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
  
  useEffect(() => {
    if (editId) {
      const postToEdit = posts.find(post => post.id === editId);
      if (postToEdit) {
        setTitle(postToEdit.title);
        setSlug(postToEdit.slug);
        setContent(postToEdit.content);
        setExcerpt(postToEdit.excerpt);
        setCategory(postToEdit.category);
        setImageUrl(postToEdit.image_url || '');
        setAdditionalImages(postToEdit.additional_images || []);
        setAuthor(postToEdit.author);
        setPublished(postToEdit.published);
        setTags(postToEdit.tags || []);
        setTagsInput(postToEdit.tags?.join(', ') || '');
        
        document.title = `Edit: ${postToEdit.title} | Laptop Hunter Blog`;
      }
    } else {
      document.title = "New Blog Post | Laptop Hunter Blog";
    }
  }, [editId, posts]);
  
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
  
  const handleOpenAIPrompt = () => {
    setIsAIPromptOpen(true);
  };
  
  const handlePreview = () => {
    window.open(`/blog/${category}/post/${slug}`, '_blank');
  };
  
  const handleCancel = () => {
    navigate('/blog/admin');
  };
  
  const handleGenerateContent = async (prompt: string, selectedCategory: string) => {
    setIsGenerating(true);
    try {
      const { generateBlogPost } = await import('@/services/blogService');
      const generatedContent = await generateBlogPost(prompt, selectedCategory);
      
      if (generatedContent) {
        setTitle(generatedContent.title);
        setContent(generatedContent.content);
        setExcerpt(generatedContent.excerpt);
        setCategory(generatedContent.category as any);
        if (generatedContent.tags) {
          setTags(generatedContent.tags);
          setTagsInput(generatedContent.tags.join(', '));
        }
        
        toast({
          title: "Content generated",
          description: "AI-generated content is ready for your review.",
        });
      }
      
      setIsAIPromptOpen(false);
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Generation failed",
        description: "There was an error generating content.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !slug || !content || !excerpt || !category) {
      toast({
        title: "Validation error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    const existingPost = getPostBySlug(slug, category);
    if (existingPost && existingPost.id !== editId) {
      toast({
        title: "Slug already exists",
        description: "A post with this slug already exists in this category. Please use a different slug.",
        variant: "destructive",
      });
      return;
    }

    // Check if the content has a video placement
    const hasVideoPlacement = content.includes("window.humixPlayers");
    if (!hasVideoPlacement) {
      const shouldContinue = window.confirm("Your post doesn't include a video placement. Are you sure you want to save without a video?");
      if (!shouldContinue) {
        return;
      }
    }
    
    try {
      setIsSaving(true);
      
      const postData = {
        title,
        slug,
        content,
        excerpt,
        category,
        image_url: imageUrl || undefined,
        additional_images: additionalImages.length > 0 ? additionalImages : undefined,
        author,
        published,
        tags: tags.length > 0 ? tags : undefined,
      };
      
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
        navigate(published ? `/blog/${category}/post/${slug}` : '/blog/admin');
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
    isAIPromptOpen,
    isGenerating,
    isSaving,
    editId,
    previewPost,
    currentUrl,
    isValid,
    
    // Setters
    setTitle,
    setContent,
    setExcerpt,
    setIsAIPromptOpen,
    
    // Handlers
    handleTagsInputChange,
    handleMetadataChange,
    handleOpenAIPrompt,
    handlePreview,
    handleCancel,
    handleGenerateContent,
    handleSave
  };
};
