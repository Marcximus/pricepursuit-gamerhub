
import { useState } from 'react';
import { TitleInput } from './postContent/TitleInput';
import { ContentEditor } from './postContent/ContentEditor';
import { ExcerptInput } from './postContent/ExcerptInput';
import { getCategoryPlaceholder } from './postContent/categoryPlaceholder';

interface PostContentProps {
  title: string;
  content: string;
  excerpt: string;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onExcerptChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  category: 'Top10' | 'Review' | 'Comparison' | 'How-To';
}

export const PostContent = ({ 
  title, 
  content, 
  excerpt, 
  onTitleChange, 
  onContentChange, 
  onExcerptChange,
  category
}: PostContentProps) => {
  const [videoPlacement, setVideoPlacement] = useState(false);
  const categoryPlaceholder = getCategoryPlaceholder(category);

  return (
    <div className="space-y-6">
      <TitleInput title={title} onTitleChange={onTitleChange} />
      
      <ContentEditor 
        content={content}
        onContentChange={onContentChange}
        categoryPlaceholder={categoryPlaceholder}
        videoPlacement={videoPlacement}
        setVideoPlacement={setVideoPlacement}
      />
      
      <ExcerptInput excerpt={excerpt} onExcerptChange={onExcerptChange} />
    </div>
  );
};
