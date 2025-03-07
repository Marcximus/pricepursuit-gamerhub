
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { uploadBlogImage } from '@/services/blogService';

interface ImagePlaceholderHandlerProps {
  content: string;
  onContentChange: (newContent: string) => void;
}

export const ImagePlaceholderHandler = ({ content, onContentChange }: ImagePlaceholderHandlerProps) => {
  const [isUploading, setIsUploading] = useState(false);
  
  // Count how many image placeholders are in the content
  const imagePlaceholders = content.match(/<div class="image-placeholder" id="image-\d+"[^>]*>/g) || [];
  
  if (imagePlaceholders.length === 0) {
    return null;
  }
  
  const handleImageUpload = async (imageId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      setIsUploading(true);
      const url = await uploadBlogImage(file);
      
      if (url) {
        // Replace the placeholder with an img tag
        const placeholderRegex = new RegExp(`<div class="image-placeholder" id="${imageId}"[^>]*>.*?<\/div>`, 's');
        const newContent = content.replace(placeholderRegex, `<img src="${url}" alt="${file.name}" class="blog-image" id="${imageId}" />`);
        
        onContentChange(newContent);
        
        toast({
          title: "Image uploaded successfully",
          description: `Image for placeholder ${imageId} has been uploaded and inserted into the content.`,
        });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your image.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="space-y-4 mt-6 p-4 border rounded-md bg-gray-50">
      <h3 className="text-lg font-medium">Image Placeholders ({imagePlaceholders.length})</h3>
      <p className="text-sm text-gray-500">Upload images for the placeholders in your How-To guide:</p>
      
      <div className="space-y-3">
        {Array.from({ length: Math.min(imagePlaceholders.length, 3) }, (_, i) => {
          const imageId = `image-${i+1}`;
          const isPlaceholderReplaced = !content.includes(`id="${imageId}"`);
          
          return (
            <div key={imageId} className="flex items-center justify-between p-2 border rounded bg-white">
              <span>Image {i+1}</span>
              <div>
                {isPlaceholderReplaced ? (
                  <span className="text-green-600 text-sm">✓ Uploaded</span>
                ) : (
                  <label className="cursor-pointer">
                    <Button 
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={isUploading}
                    >
                      {isUploading ? 'Uploading...' : 'Upload Image'}
                    </Button>
                    <input 
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(imageId, e)}
                      disabled={isUploading}
                    />
                  </label>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
