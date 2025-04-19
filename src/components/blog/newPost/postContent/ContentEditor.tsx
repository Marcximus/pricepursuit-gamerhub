
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

  const prepareContentForPreview = (content: string) => {
    if (content.trim().startsWith('{') && content.includes('"content":')) {
      try {
        const parsed = JSON.parse(content);
        return parsed.content || content;
      } catch (e) {
        console.error('Error parsing JSON content:', e);
      }
    }
    
    let processedContent = content
      .replace(/\*\*Excerpt:\*\*([\s\S]*?)(?=\n\n)/, '')
      .replace(/\*\*Tags:\*\*([\s\S]*?)$/, '');
      
    processedContent = processedContent.replace(
      /<div class="product-placeholder"[^>]*data-asin="([^"]*)"[^>]*data-index="([^"]*)"[^>]*><\/div>/g,
      '<div class="p-4 my-4 border-2 border-dashed border-amber-500 bg-amber-50 rounded-md text-center font-bold">Product Placeholder #$2 (ASIN: $1)</div>'
    );
    
    processedContent = processedContent.replace(
      /<div class="product-card"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g,
      '<div class="p-4 my-4 border-2 border-dashed border-blue-500 bg-blue-50 rounded-md text-center font-bold">Product Card HTML (Will be rendered as proper product card)</div>'
    );
    
    if (category === 'How-To') {
      // Mark h2 and h3 headings to show where images might be placed
      processedContent = processedContent.replace(
        /(<h2[^>]*>)(.*?)(<\/h2>)/g,
        '$1$2$3<div class="p-3 mt-2 mb-4 border border-dashed border-blue-300 bg-blue-50 rounded-md text-center"><span class="text-xs text-blue-600">📸 Images will appear near this section</span></div>'
      );
      
      // Convert image placeholders to more visible preview elements
      processedContent = processedContent.replace(
        /<div class="image-placeholder"[^>]*>/g,
        '<div class="p-4 my-6 border-2 border-dashed border-blue-500 bg-blue-50 rounded-md text-center">' +
        '<p class="text-blue-600 font-medium">📸 Image will be placed here</p>' +
        '<p class="text-sm text-blue-500 mt-2">Upload an image in the Additional Images section</p>'
      );
      
      // Add visual guide about image placement
      processedContent = '<div class="p-4 mb-6 bg-blue-50 border border-blue-200 rounded-md">' +
        '<p class="text-sm text-blue-800 font-medium">💡 <strong>Image Placement Guide:</strong> ' +
        'Images will be automatically distributed throughout your content, typically after sections ' +
        'and paragraphs. Add <code>&lt;h2&gt;</code> and <code>&lt;h3&gt;</code> headings to control ' +
        'where images will appear.</p>' +
        '</div>' + processedContent;
    }
    
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
          
          {category === 'How-To' && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800 font-medium">
                HTML formatting will be preserved in the published post. Images will be positioned throughout your content based on headings and paragraphs.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentEditor;
