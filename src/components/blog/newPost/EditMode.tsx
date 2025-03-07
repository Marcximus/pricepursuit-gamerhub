
import { BlogPost } from '@/contexts/BlogContext';
import { PostContent } from '@/components/blog/newPost/PostContent';
import { PostMetadata } from '@/components/blog/newPost/PostMetadata';
import { PostActions } from '@/components/blog/newPost/PostActions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EditModeProps {
  title: string;
  content: string;
  excerpt: string;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onExcerptChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  category: 'Top10' | 'Review' | 'Comparison' | 'How-To';
  previewPost: Partial<BlogPost>;
  tagsInput: string;
  handleTagsInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleMetadataChange: (field: string, value: any) => void;
  onRegenerateWithAI: () => void;
  onSave: (e: React.FormEvent) => void;
  onPreview: () => void;
  onCancel: () => void;
  isSaving: boolean;
  currentUrl: string;
  editId: string | null;
  isValid: boolean;
}

export const EditMode = ({
  title,
  content,
  excerpt,
  onTitleChange,
  onContentChange,
  onExcerptChange,
  category,
  previewPost,
  tagsInput,
  handleTagsInputChange,
  handleMetadataChange,
  onRegenerateWithAI,
  onSave,
  onPreview,
  onCancel,
  isSaving,
  currentUrl,
  editId,
  isValid
}: EditModeProps) => {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold border-b pb-2 mb-4">Content</h2>
        <PostContent 
          title={title}
          content={content}
          excerpt={excerpt}
          onTitleChange={onTitleChange}
          onContentChange={onContentChange}
          onExcerptChange={onExcerptChange}
          category={category}
        />
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold border-b pb-2 mb-4">Settings & SEO</h2>
        <div className="grid grid-cols-1 gap-8">
          <PostMetadata 
            post={previewPost}
            onChange={handleMetadataChange}
            tagsInput={tagsInput}
            onTagsInputChange={handleTagsInputChange}
          />
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <PostActions 
                isSaving={isSaving}
                previewPost={previewPost}
                currentUrl={currentUrl}
                onSave={onSave}
                onOpenAIPrompt={onRegenerateWithAI}
                onPreview={onPreview}
                onCancel={onCancel}
                isEdit={!!editId}
                isValid={isValid}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
