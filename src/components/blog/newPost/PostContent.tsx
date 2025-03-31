
import { useState } from 'react';
import { TitleInput } from './postContent/TitleInput';
import { ContentEditor } from './postContent/ContentEditor';
import { ExcerptInput } from './postContent/ExcerptInput';
import { getCategoryPlaceholder } from './postContent/categoryPlaceholder';
import { AIGenerationPanel } from './AIGenerationPanel';

interface PostContentProps {
  title: string;
  content: string;
  excerpt: string;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onExcerptChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  category: 'Top10' | 'Review' | 'Comparison' | 'How-To';
  aiGeneration: {
    isGenerating: boolean;
    prompt: string;
    setPrompt: (value: string) => void;
    selectedCategory: string;
    setSelectedCategory: (value: string) => void;
    asin: string;
    setAsin: (value: string) => void;
    asin2: string;
    setAsin2: (value: string) => void;
    handleGenerateContent: () => void;
  };
}

export const PostContent = ({ 
  title, 
  content, 
  excerpt, 
  onTitleChange, 
  onContentChange, 
  onExcerptChange,
  category,
  aiGeneration
}: PostContentProps) => {
  const [videoPlacement, setVideoPlacement] = useState(false);
  const categoryPlaceholder = getCategoryPlaceholder(category);

  return (
    <div className="space-y-6">
      <AIGenerationPanel 
        isGenerating={aiGeneration.isGenerating}
        prompt={aiGeneration.prompt}
        setPrompt={aiGeneration.setPrompt}
        selectedCategory={aiGeneration.selectedCategory}
        setSelectedCategory={aiGeneration.setSelectedCategory}
        asin={aiGeneration.asin}
        setAsin={aiGeneration.setAsin}
        asin2={aiGeneration.asin2}
        setAsin2={aiGeneration.setAsin2}
        handleGenerateContent={aiGeneration.handleGenerateContent}
      />
      
      <TitleInput title={title} onTitleChange={onTitleChange} />
      
      <ContentEditor 
        content={content}
        onContentChange={onContentChange}
        categoryPlaceholder={categoryPlaceholder}
        videoPlacement={videoPlacement}
        setVideoPlacement={setVideoPlacement}
        category={category}
        postTitle={title}
      />
      
      <ExcerptInput excerpt={excerpt} onExcerptChange={onExcerptChange} />
    </div>
  );
};
