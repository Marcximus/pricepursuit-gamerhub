
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { uploadBlogImage } from '@/services/blog/uploadBlogImage';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';

interface ImagePlaceholderHandlerProps {
  content: string;
  onContentChange: (newContent: string) => void;
  postTitle?: string;
}

export const ImagePlaceholderHandler = ({ content, onContentChange, postTitle = '' }: ImagePlaceholderHandlerProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [imageAlts, setImageAlts] = useState<Record<string, string>>({});
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Count how many image placeholders are in the content
  const imagePlaceholders = content.match(/<div class="image-placeholder" id="image-\d+"[^>]*>/g) || [];
  
  if (imagePlaceholders.length === 0) {
    return null;
  }

  const handleAltTextChange = (imageId: string, value: string) => {
    setImageAlts(prev => ({
      ...prev,
      [imageId]: value
    }));
  };
  
  const handleImageUpload = async (imageId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to upload images",
          variant: "destructive",
        });
        return;
      }
      
      setIsUploading(true);
      const imageNumber = imageId.split('-')[1];
      const altText = imageAlts[imageId] || `${postTitle} - Image ${imageNumber}`;
      const result = await uploadBlogImage(file, altText);
      
      if (result) {
        // Replace the placeholder with an img tag including alt text
        const placeholderRegex = new RegExp(`<div class="image-placeholder" id="${imageId}"[^>]*>.*?<\/div>`, 's');
        const newContent = content.replace(placeholderRegex, `<img src="${result.url}" alt="${result.alt}" class="blog-image" id="${imageId}" />`);
        
        onContentChange(newContent);
        
        toast({
          title: "Image uploaded successfully",
          description: `Image for placeholder ${imageId} has been uploaded and inserted with SEO-friendly alt text.`,
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
  
  const handleLoginRedirect = () => {
    // Save current path to return after login
    sessionStorage.setItem('returnPath', window.location.pathname + window.location.search);
    navigate('/login');
  };
  
  return (
    <div className="space-y-4 mt-6 p-4 border rounded-md bg-gray-50">
      <h3 className="text-lg font-medium">Image Placeholders ({imagePlaceholders.length})</h3>
      <p className="text-sm text-gray-500">Upload images with SEO-friendly alt text for your How-To guide:</p>
      
      {!user ? (
        <div className="flex flex-col items-center space-y-4 border-2 border-dashed border-gray-300 rounded-md p-4 bg-white">
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-900">Authentication Required</h3>
            <p className="mt-1 text-sm text-gray-500">You need to be logged in to upload images</p>
          </div>
          <Button onClick={handleLoginRedirect} className="flex items-center space-x-2">
            <LogIn className="h-4 w-4" />
            <span>Log in to upload</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {Array.from({ length: Math.min(imagePlaceholders.length, 3) }, (_, i) => {
            const imageId = `image-${i+1}`;
            const isPlaceholderReplaced = !content.includes(`id="${imageId}"`);
            
            return (
              <div key={imageId} className="flex flex-col space-y-2 p-2 border rounded bg-white">
                <div className="flex items-center justify-between">
                  <span>Image {i+1}</span>
                  <div>
                    {isPlaceholderReplaced ? (
                      <span className="text-green-600 text-sm">✓ Uploaded</span>
                    ) : (
                      <>
                        <div className="mb-2">
                          <Label htmlFor={`alt-text-${imageId}`}>Alt Text (for SEO)</Label>
                          <Input
                            id={`alt-text-${imageId}`}
                            value={imageAlts[imageId] || ''}
                            onChange={(e) => handleAltTextChange(imageId, e.target.value)}
                            placeholder={`${postTitle || 'How-To guide'} - Image ${i+1}`}
                            className="mb-2"
                          />
                        </div>
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
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
