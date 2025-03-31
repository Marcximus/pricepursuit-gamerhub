
import { ImagePlus, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { uploadBlogImage } from '@/services/blog/uploadBlogImage';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface AdditionalImagesUploadProps {
  additionalImages: string[];
  onImagesUpdate: (images: string[], alts?: string[]) => void;
  maxImages: number;
  category: string | undefined;
  postTitle?: string;
}

export const AdditionalImagesUpload = ({ 
  additionalImages, 
  onImagesUpdate, 
  maxImages,
  category,
  postTitle = ''
}: AdditionalImagesUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [imageAlt, setImageAlt] = useState('');
  const [additionalImageAlts, setAdditionalImageAlts] = useState<string[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Generate default alt text based on post title and image number
  useEffect(() => {
    if (postTitle && !imageAlt) {
      setImageAlt(`Image for ${postTitle} blog post`);
    }
  }, [postTitle]);

  const handleAdditionalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (additionalImages.length >= maxImages) {
      toast({
        title: "Maximum images reached",
        description: `You can only upload ${maxImages} additional images for this post type.`,
        variant: "destructive",
      });
      return;
    }
    
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
      const imageIndex = additionalImages.length + 1;
      const altText = imageAlt || `Image ${imageIndex} for ${postTitle || category || 'blog post'}`;
      const result = await uploadBlogImage(file, altText);
      
      if (result) {
        const updatedImages = [...additionalImages, result.url];
        const updatedAlts = [...additionalImageAlts, result.alt];
        onImagesUpdate(updatedImages, updatedAlts);
        setAdditionalImageAlts(updatedAlts);
        
        toast({
          title: "Additional image uploaded",
          description: "Your image has been uploaded successfully with alt text.",
        });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "There was an error uploading your image.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeAdditionalImage = (index: number) => {
    const updatedImages = [...additionalImages];
    updatedImages.splice(index, 1);
    
    const updatedAlts = [...additionalImageAlts];
    if (updatedAlts.length > index) {
      updatedAlts.splice(index, 1);
    }
    
    onImagesUpdate(updatedImages, updatedAlts);
    setAdditionalImageAlts(updatedAlts);
  };

  const handleLoginRedirect = () => {
    // Save current path to return after login
    sessionStorage.setItem('returnPath', window.location.pathname + window.location.search);
    navigate('/login');
  };

  return (
    <div className="space-y-4">
      {user ? (
        <div className="flex flex-col space-y-2">
          <div>
            <Label htmlFor="additional-image-alt">Image Alt Text (for SEO)</Label>
            <Input 
              id="additional-image-alt" 
              value={imageAlt} 
              onChange={(e) => setImageAlt(e.target.value)} 
              placeholder={`Image for ${postTitle || 'blog post'}`}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Descriptive alt text helps with SEO and accessibility
            </p>
          </div>
          
          <label 
            htmlFor="additional-image-upload" 
            className="cursor-pointer flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-4 hover:border-gray-400 transition-colors"
          >
            <div className="flex flex-col items-center space-y-2">
              <ImagePlus className="h-8 w-8 text-gray-400" />
              <span className="text-sm text-gray-500">
                {isUploading ? 'Uploading...' : 'Add additional image'}
              </span>
            </div>
          </label>
          <input 
            id="additional-image-upload" 
            type="file" 
            className="hidden" 
            accept="image/*" 
            onChange={handleAdditionalImageUpload}
            disabled={isUploading || additionalImages.length >= maxImages}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-4 border-2 border-dashed border-gray-300 rounded-md p-6">
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-900">Authentication Required</h3>
            <p className="mt-1 text-sm text-gray-500">You need to be logged in to upload images</p>
          </div>
          <Button onClick={handleLoginRedirect} className="flex items-center space-x-2">
            <LogIn className="h-4 w-4" />
            <span>Log in to upload</span>
          </Button>
        </div>
      )}
      
      {additionalImages.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {additionalImages.map((url, index) => (
            <div key={index} className="relative group">
              <img 
                src={url} 
                alt={additionalImageAlts[index] || `Additional image ${index + 1} for ${postTitle || 'blog post'}`} 
                className="rounded-md w-full h-24 object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeAdditionalImage(index)}
              >
                Remove
              </Button>
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1">
                Image {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
