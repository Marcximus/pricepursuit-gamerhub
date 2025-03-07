
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VideoPlacementButton } from './VideoPlacementButton';

interface ContentEditorProps {
  content: string;
  onContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  categoryPlaceholder: string;
  videoPlacement: boolean;
  setVideoPlacement: (value: boolean) => void;
}

export const ContentEditor = ({ 
  content, 
  onContentChange, 
  categoryPlaceholder, 
  videoPlacement, 
  setVideoPlacement 
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
  );
};
