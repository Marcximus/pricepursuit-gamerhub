
import { ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { uploadBlogImage } from '@/services/blog';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  const [authChecking, setAuthChecking] = useState(false);

  const checkAuth = async () => {
    setAuthChecking(true);
    const { data: { session } } = await supabase.auth.getSession();
    setAuthChecking(false);
    return !!session;
  };

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
      // Check authentication before attempting upload
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <label 
          htmlFor="additional-image-upload" 
          className="cursor-pointer flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-4 hover:border-gray-400 transition-colors"
        >
          <div className="flex flex-col items-center space-y-2">
            <ImagePlus className="h-8 w-8 text-gray-400" />
            <span className="text-sm text-gray-500">
              {isUploading ? 'Uploading...' : 
               authChecking ? 'Checking login...' : 
               'Add additional image'}
            </span>
          </div>
        </label>
        <input 
          id="additional-image-upload" 
          type="file" 
          className="hidden" 
          accept="image/*" 
          onChange={handleAdditionalImageUpload}
          disabled={isUploading || authChecking || additionalImages.length >= maxImages}
        />
      </div>
      
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
