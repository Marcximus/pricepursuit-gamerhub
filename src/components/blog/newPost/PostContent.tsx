
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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

  const handleAddVideoPlacement = () => {
    const videoScript = `\n\n<script data-ezscrex="false" data-cfasync="false">(window.humixPlayers = window.humixPlayers || []).push({target: document.currentScript});</script><script async data-ezscrex="false" data-cfasync="false" src="https://www.humix.com/video.js"></script>\n\n`;
    
    onContentChange({
      target: { value: content + videoScript }
    } as React.ChangeEvent<HTMLTextAreaElement>);
    
    setVideoPlacement(true);
  };

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
        <div className="flex items-center justify-between">
          <Label htmlFor="content">Content*</Label>
          <button 
            type="button"
            onClick={handleAddVideoPlacement}
            disabled={videoPlacement}
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            + Add Video Placement
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3 w-3 ml-1" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Adds a video player placeholder at the end of your post</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </button>
        </div>
        <Tabs defaultValue="write">
          <TabsList className="mb-2">
            <TabsTrigger value="write">Write</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          <TabsContent value="write">
            <Textarea 
              id="content" 
              value={content} 
              onChange={(e) => {
                onContentChange(e);
                // If content includes video placement, set the state to true
                if (e.target.value.includes("window.humixPlayers")) {
                  setVideoPlacement(true);
                } else {
                  setVideoPlacement(false);
                }
              }} 
              placeholder={`Write your blog post content here (HTML formatting supported)${getCategoryPlaceholder(category)}`}
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

function getCategoryPlaceholder(category: 'Top10' | 'Review' | 'Comparison' | 'How-To'): string {
  switch (category) {
    case 'Top10':
      return "\n\nTip: You'll be able to upload 11 images (1 header + 10 for each item).";
    case 'Review':
      return "\n\nTip: You'll be able to upload 4 images (1 header + 3 for the review).";
    case 'Comparison':
      return "\n\nTip: You'll be able to upload 4 images (2 for compared laptops + 2 in the article).";
    case 'How-To':
      return "\n\nTip: You'll be able to upload 4 images (1 header + 3 for the guide steps).";
    default:
      return "";
  }
}
