
import { ImagePlus, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { uploadBlogImage } from '@/services/blog/uploadBlogImage'; // Import directly from the file
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AdditionalImagesUploadProps {
  additionalImages: string[];
  onImagesUpdate: (images: string[]) => void;
  maxImages: number;
  category: string | undefined;
}

export const AdditionalImagesUpload = ({ 
  additionalImages, 
  onImagesUpdate, 
  maxImages,
  category
}: AdditionalImagesUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

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
      const url = await uploadBlogImage(file);
      if (url) {
        const updatedImages = [...additionalImages, url];
        onImagesUpdate(updatedImages);
        toast({
          title: "Additional image uploaded",
          description: "Your image has been uploaded successfully.",
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
    onImagesUpdate(updatedImages);
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
                alt={`Additional image ${index + 1}`} 
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
