
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { extractSearchParamsFromPrompt } from '@/services/blog/amazonProductService';
import { generateBlogPost } from '@/services/blog/generate/generateBlogPost'; // Import directly from the file

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
  
  // Helper function to clean titles from any JSON or HTML formatting
  const cleanTitleText = (rawTitle: string): string => {
    if (!rawTitle) return '';
    
    let cleanTitle = rawTitle;
    
    // First, check if the entire string is a JSON object with a title property
    const jsonMatch = rawTitle.match(/^{[\s\S]*"title"[\s\S]*}$/);
    if (jsonMatch) {
      try {
        // Try to parse as JSON
        const parsed = JSON.parse(rawTitle);
        if (parsed && parsed.title) {
          cleanTitle = parsed.title;
        }
      } catch (e) {
        // If parsing fails, proceed with regex cleaning
      }
    }
    
    // Apply regex cleaning in any case as a fallback
    cleanTitle = cleanTitle
      // Handle JSON format: {"title": "Actual Title"} or variations
      .replace(/^{.*?"title"[\s]*:[\s]*"(.*?)".*}$/i, '$1')
      // Handle HTML line breaks
      .replace(/<br\/>/g, '')
      // Handle escaped newlines
      .replace(/\\n/g, ' ')
      // Handle escaped quotes
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'")
      // Remove any HTML tags
      .replace(/<[^>]*>/g, '')
      .trim();
      
    return cleanTitle;
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
    
    setIsGenerating(true);
    try {
      if (selectedCategory === 'Top10') {
        const { title: extractedTitle } = extractSearchParamsFromPrompt(prompt);
        setTitle(extractedTitle);
      }
      
      console.log(
        `Generating ${selectedCategory} blog post with prompt: ${prompt}` +
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
        // Clean the title using our enhanced function
        if (generatedContent.title) {
          const cleanedTitle = cleanTitleText(generatedContent.title);
          console.log('Original title:', generatedContent.title);
          console.log('Cleaned title:', cleanedTitle);
          
          if (selectedCategory !== 'Top10') {
            setTitle(cleanedTitle);
          }
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
