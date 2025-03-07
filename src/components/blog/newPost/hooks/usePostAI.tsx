
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';

export const usePostAI = (
  setTitle: (value: string) => void,
  setContent: (value: string) => void,
  setExcerpt: (value: string) => void,
  setCategory: (value: any) => void,
  setTags: (value: string[]) => void,
  setTagsInput: (value: string) => void
) => {
  const [isAIPromptOpen, setIsAIPromptOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleOpenAIPrompt = () => {
    setIsAIPromptOpen(true);
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
  
  return {
    isAIPromptOpen,
    isGenerating,
    setIsAIPromptOpen,
    handleOpenAIPrompt,
    handleGenerateContent
  };
};
