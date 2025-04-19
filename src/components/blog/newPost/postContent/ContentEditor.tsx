
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VideoPlacementButton } from './VideoPlacementButton';
import { ImagePlaceholderHandler } from './ImagePlaceholderHandler';

interface ContentEditorProps {
  content: string;
  onContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  categoryPlaceholder: string;
  videoPlacement: boolean;
  setVideoPlacement: (value: boolean) => void;
  category: string;
  postTitle?: string;
}

export const ContentEditor = ({ 
  content, 
  onContentChange, 
  categoryPlaceholder, 
  videoPlacement, 
  setVideoPlacement,
  category,
  postTitle
}: ContentEditorProps) => {
  
  const handleAddVideoPlacement = () => {
    const videoScript = `\n\n<script data-ezscrex="false" data-cfasync="false">(window.humixPlayers = window.humixPlayers || []).push({target: document.currentScript});</script><script async data-ezscrex="false" data-cfasync="false" src="https://www.humix.com/video.js"></script>\n\n`;
    
    onContentChange({
      target: { value: content + videoScript }
    } as React.ChangeEvent<HTMLTextAreaElement>);
    
    setVideoPlacement(true);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onContentChange(e);
    // If content includes video placement, set the state to true
    if (e.target.value.includes("window.humixPlayers")) {
      setVideoPlacement(true);
    } else {
      setVideoPlacement(false);
    }
  };

  const handleImagePlaceholderContentChange = (newContent: string) => {
    onContentChange({
      target: { value: newContent }
    } as React.ChangeEvent<HTMLTextAreaElement>);
  };

  // Improved function to sanitize and format content for preview
  const prepareContentForPreview = (content: string) => {
    // Handle JSON-formatted content by extracting only the content value
    if (content.trim().startsWith('{') && content.includes('"content":')) {
      try {
        const parsed = JSON.parse(content);
        return parsed.content || content;
      } catch (e) {
        // If parsing fails, continue with original content
        console.error('Error parsing JSON content:', e);
      }
    }
    
    // Remove excerpt and tags sections for preview if they exist
    let processedContent = content
      .replace(/\*\*Excerpt:\*\*([\s\S]*?)(?=\n\n)/, '')
      .replace(/\*\*Tags:\*\*([\s\S]*?)$/, '');
      
    // Highlight product placeholders to make them more visible in the preview
    processedContent = processedContent.replace(
      /<div class="product-placeholder"[^>]*data-asin="([^"]*)"[^>]*data-index="([^"]*)"[^>]*><\/div>/g,
      '<div class="p-4 my-4 border-2 border-dashed border-amber-500 bg-amber-50 rounded-md text-center font-bold">Product Placeholder #$2 (ASIN: $1)</div>'
    );
    
    // Style raw product card HTML for better preview visualization
    processedContent = processedContent.replace(
      /<div class="product-card"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g,
      '<div class="p-4 my-4 border-2 border-dashed border-blue-500 bg-blue-50 rounded-md text-center font-bold">Product Card HTML (Will be rendered as proper product card)</div>'
    );
    
    return processedContent;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="content">Content*</Label>
        <VideoPlacementButton 
          onAddVideoPlacement={handleAddVideoPlacement} 
          videoPlacement={videoPlacement} 
        />
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
            onChange={handleContentChange} 
            placeholder={`Write your blog post content here (HTML formatting supported)${categoryPlaceholder}`}
            className="min-h-[400px]" 
            required
          />
          
          {category === 'How-To' && (
            <ImagePlaceholderHandler 
              content={content} 
              onContentChange={handleImagePlaceholderContentChange}
              postTitle={postTitle}
            />
          )}
        </TabsContent>
        <TabsContent value="preview">
          <div className="border rounded-md p-4 min-h-[400px] prose max-w-none overflow-auto">
            {content ? (
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: prepareContentForPreview(content) 
                }} 
                className="blog-content-preview"
              />
            ) : (
              <p className="text-gray-400">No content to preview</p>
            )}
          </div>
          
          {category === 'Top10' && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-sm text-amber-800 font-medium">
                Note: When publishing, product placeholders will be replaced with actual Amazon product data.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
