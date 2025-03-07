
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PostContentProps {
  title: string;
  content: string;
  excerpt: string;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onExcerptChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const PostContent = ({ 
  title, 
  content, 
  excerpt, 
  onTitleChange, 
  onContentChange, 
  onExcerptChange 
}: PostContentProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title*</Label>
        <Input 
          id="title" 
          value={title} 
          onChange={onTitleChange} 
          placeholder="Enter post title" 
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="content">Content*</Label>
        <Tabs defaultValue="write">
          <TabsList className="mb-2">
            <TabsTrigger value="write">Write</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          <TabsContent value="write">
            <Textarea 
              id="content" 
              value={content} 
              onChange={onContentChange} 
              placeholder="Write your blog post content here (HTML formatting supported)" 
              className="min-h-[400px]" 
              required
            />
          </TabsContent>
          <TabsContent value="preview">
            <div className="border rounded-md p-4 min-h-[400px] prose max-w-none">
              {content ? (
                <div dangerouslySetInnerHTML={{ __html: content }} />
              ) : (
                <p className="text-gray-400">No content to preview</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="excerpt">Excerpt*</Label>
        <Textarea 
          id="excerpt" 
          value={excerpt} 
          onChange={onExcerptChange} 
          placeholder="Brief summary of the post (2-3 sentences)" 
          rows={3} 
          required
        />
      </div>
    </div>
  );
};
