
import { Button } from '@/components/ui/button';
import { HelpCircle, Sparkles } from 'lucide-react';
import { BlogSEOPreview } from '@/components/blog/BlogSEOPreview';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BlogPost } from '@/contexts/BlogContext';
import { Eye, Save } from 'lucide-react';

interface PostActionsProps {
  isSaving: boolean;
  previewPost: Partial<BlogPost>;
  currentUrl: string;
  onSave: (e: React.FormEvent) => void;
  onOpenAIPrompt: () => void;
  onPreview: () => void;
  onCancel: () => void;
  isEdit: boolean;
  isValid: boolean;
}

export const PostActions = ({ 
  isSaving, 
  previewPost, 
  currentUrl, 
  onSave, 
  onOpenAIPrompt, 
  onPreview, 
  onCancel, 
  isEdit,
  isValid
}: PostActionsProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center">
          <h3 className="text-sm font-medium">Search Engine Optimization</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-5 w-5 ml-1">
                  <HelpCircle className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p>This preview shows how your post might appear in search results and social media shares.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <BlogSEOPreview post={previewPost} url={currentUrl} />
      </div>
      
      <Button 
        type="button" 
        onClick={onOpenAIPrompt}
        variant="outline" 
        className="w-full flex items-center justify-center gap-2 mb-4"
      >
        <Sparkles className="h-4 w-4" />
        {previewPost.content ? 'Regenerate with AI' : 'Generate with AI'}
      </Button>
      
      <div className="flex justify-between items-center">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
        >
          Cancel
        </Button>
        
        <div className="flex space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onPreview}
            disabled={!isValid}
            className="flex items-center"
          >
            <Eye className="mr-2 h-4 w-4" /> 
            Preview
          </Button>
          
          <Button 
            type="submit" 
            disabled={isSaving || !isValid}
            className="flex items-center"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : isEdit ? 'Update Post' : 'Save Post'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export const PostHeaderActions = ({ 
  onPreview, 
  isValid 
}: { 
  onPreview: () => void;
  isValid: boolean;
}) => {
  return (
    <Button 
      variant="outline" 
      onClick={onPreview}
      disabled={!isValid}
      className="flex items-center"
    >
      <Eye className="mr-2 h-4 w-4" /> 
      Preview
    </Button>
  );
};
