
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { extractSearchParamsFromPrompt } from '@/services/blog/amazonProductService';

export const usePostAI = (
  setTitle: (value: string) => void,
  setContent: (value: string) => void,
  setExcerpt: (value: string) => void,
  setCategory: (value: any) => void,
  setTags: (value: string[]) => void,
  setTagsInput: (value: string) => void
) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Review');
  const [asin, setAsin] = useState('');
  const [asin2, setAsin2] = useState('');

  const resetPromptFields = () => {
    setPrompt('');
    setAsin('');
    setAsin2('');
  };
  
  const handleGenerateContent = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please enter a prompt to generate content.",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedCategory) {
      toast({
        title: "Category required",
        description: "Please select a content category.",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    try {
      if (selectedCategory === 'Top10') {
        const { title: extractedTitle } = extractSearchParamsFromPrompt(prompt);
        setTitle(extractedTitle);
      }
      
      // Log the parameters before generating content
      console.log('Generating blog post with parameters:', {
        prompt: prompt.substring(0, 100) + (prompt.length > 100 ? '...' : ''),
        category: selectedCategory,
        asin: asin || undefined,
        asin2: asin2 || undefined
      });
      
      const { generateBlogPost } = await import('@/services/blog');
      
      console.log(
        `Generating ${selectedCategory} blog post with prompt: ${prompt.substring(0, 50)}...` +
        `${asin ? `, ASIN1: ${asin}` : ''}` +
        `${asin2 ? `, ASIN2: ${asin2}` : ''}`
      );
      
      const generatedContent = await generateBlogPost(
        prompt, 
        selectedCategory, 
        asin || undefined, 
        asin2 || undefined
      );
      
      if (generatedContent) {
        if (selectedCategory !== 'Top10') {
          setTitle(generatedContent.title);
        }
        setContent(generatedContent.content);
        setExcerpt(generatedContent.excerpt);
        setCategory(generatedContent.category as any);
        
        if (generatedContent.tags) {
          setTags(generatedContent.tags);
          setTagsInput(generatedContent.tags.join(', '));
        }
        
        if (selectedCategory === 'Review' && generatedContent.productData) {
          localStorage.setItem('currentReviewProductData', JSON.stringify(generatedContent.productData));
          console.log('Stored product data for review:', generatedContent.productData);
        }
        
        if (selectedCategory === 'Comparison' && generatedContent.comparisonData) {
          localStorage.setItem('currentComparisonData', JSON.stringify(generatedContent.comparisonData));
          console.log('Stored comparison data:', generatedContent.comparisonData);
        }
        
        toast({
          title: "Content generated",
          description: `AI-generated ${selectedCategory} content is ready for your review.`,
        });
        
        resetPromptFields();
      }
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
  };
};
