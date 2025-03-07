
import { Image } from 'lucide-react';
import { useState } from 'react';
import { uploadBlogImage } from '@/services/blogService';
import { toast } from '@/components/ui/use-toast';

interface FeaturedImageUploadProps {
  imageUrl: string | undefined;
  onImageUpload: (url: string) => void;
}

export const FeaturedImageUpload = ({ imageUrl, onImageUpload }: FeaturedImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setIsUploading(true);
      const url = await uploadBlogImage(file);
      if (url) {
        onImageUpload(url);
        toast({
          title: "Featured image uploaded",
          description: "Your image has been uploaded successfully.",
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
    <div className="flex flex-col space-y-2">
      <label 
        htmlFor="featured-image-upload" 
        className="cursor-pointer flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-4 hover:border-gray-400 transition-colors"
      >
        <div className="flex flex-col items-center space-y-2">
          <Image className="h-8 w-8 text-gray-400" />
          <span className="text-sm text-gray-500">
            {isUploading ? 'Uploading...' : imageUrl ? 'Change featured image' : 'Upload featured image'}
          </span>
        </div>
      </label>
      <input 
        id="featured-image-upload" 
        type="file" 
        className="hidden" 
        accept="image/*" 
        onChange={handleImageUpload}
        disabled={isUploading}
      />
      {imageUrl && (
        <div className="mt-2">
          <img 
            src={imageUrl} 
            alt="Featured image" 
            className="rounded-md max-h-[200px] w-auto mx-auto"
          />
        </div>
      )}
    </div>
  );
};
