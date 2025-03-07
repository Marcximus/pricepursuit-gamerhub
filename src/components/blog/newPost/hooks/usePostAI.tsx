
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
  
  const handleGenerateContent = async (prompt: string, selectedCategory: string, asin?: string, asin2?: string) => {
    setIsGenerating(true);
    try {
      const { generateBlogPost } = await import('@/services/blogService');
      
      // Log the generation attempt with category and ASINs if available
      console.log(
        `Generating ${selectedCategory} blog post with prompt: ${prompt}` +
        `${asin ? `, ASIN1: ${asin}` : ''}` +
        `${asin2 ? `, ASIN2: ${asin2}` : ''}`
      );
      
      const generatedContent = await generateBlogPost(prompt, selectedCategory, asin, asin2);
      
      if (generatedContent) {
        setTitle(generatedContent.title);
        setContent(generatedContent.content);
        setExcerpt(generatedContent.excerpt);
        setCategory(generatedContent.category as any);
        
        if (generatedContent.tags) {
          setTags(generatedContent.tags);
          setTagsInput(generatedContent.tags.join(', '));
        }
        
        // For Review posts, store the product data in localStorage for use in the editor
        if (selectedCategory === 'Review' && generatedContent.productData) {
          localStorage.setItem('currentReviewProductData', JSON.stringify(generatedContent.productData));
          console.log('Stored product data for review:', generatedContent.productData);
        }
        
        // For Comparison posts, store both product data items in localStorage
        if (selectedCategory === 'Comparison' && generatedContent.comparisonData) {
          localStorage.setItem('currentComparisonData', JSON.stringify(generatedContent.comparisonData));
          console.log('Stored comparison data:', generatedContent.comparisonData);
        }
        
        toast({
          title: "Content generated",
          description: `AI-generated ${selectedCategory} content is ready for your review.`,
        });
      }
      
      setIsAIPromptOpen(false);
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Generation failed",
        description: "There was an error generating content. Please try again.",
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
