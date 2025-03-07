
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface PreviewModeProps {
  title: string;
  content: string;
  excerpt: string;
  imageUrl?: string;
  onExitPreview: () => void;
}

export const PreviewMode = ({ 
  title, 
  content, 
  excerpt, 
  imageUrl, 
  onExitPreview 
}: PreviewModeProps) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Preview: {title}</h2>
        <Button onClick={onExitPreview} variant="outline" className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Editor
        </Button>
      </div>
      
      {imageUrl && (
        <div className="mb-6">
          <img src={imageUrl} alt={title} className="w-full h-auto rounded-lg" />
        </div>
      )}
      
      <div className="prose max-w-none">
        <h1>{title}</h1>
        <p className="text-gray-600 italic mb-6">{excerpt}</p>
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>
  );
};
