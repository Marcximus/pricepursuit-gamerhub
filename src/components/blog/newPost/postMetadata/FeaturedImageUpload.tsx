
import { Image, LogIn } from 'lucide-react';
import { useState, useEffect } from 'react';
import { uploadBlogImage } from '@/services/blog/uploadBlogImage';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface FeaturedImageUploadProps {
  imageUrl: string | undefined;
  onImageUpload: (url: string, alt?: string) => void;
  postTitle?: string;
}

export const FeaturedImageUpload = ({ imageUrl, onImageUpload, postTitle = '' }: FeaturedImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [authChecking, setAuthChecking] = useState(false);
  const [imageAlt, setImageAlt] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  // Generate a default alt text based on post title
  useEffect(() => {
    if (postTitle && !imageAlt) {
      setImageAlt(`Featured image for ${postTitle}`);
    }
  }, [postTitle]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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
      const altText = imageAlt || `Blog image for ${postTitle || 'post'}`;
      const result = await uploadBlogImage(file, altText);
      
      if (result) {
        onImageUpload(result.url, result.alt);
        toast({
          title: "Featured image uploaded",
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

  const handleLoginRedirect = () => {
    // Save current path to return after login
    sessionStorage.setItem('returnPath', window.location.pathname + window.location.search);
    navigate('/login');
  };

  return (
    <div className="flex flex-col space-y-2">
      {user ? (
        <>
          <div className="space-y-4">
            <div>
              <Label htmlFor="image-alt-text">Image Alt Text (for SEO)</Label>
              <Input 
                id="image-alt-text" 
                value={imageAlt} 
                onChange={(e) => setImageAlt(e.target.value)} 
                placeholder={`Featured image for ${postTitle || 'blog post'}`}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Descriptive alt text helps with SEO and accessibility
              </p>
            </div>
            
            <label 
              htmlFor="featured-image-upload" 
              className="cursor-pointer flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-4 hover:border-gray-400 transition-colors"
            >
              <div className="flex flex-col items-center space-y-2">
                <Image className="h-8 w-8 text-gray-400" />
                <span className="text-sm text-gray-500">
                  {isUploading ? 'Uploading...' : 
                   imageUrl ? 'Change featured image' : 'Upload featured image'}
                </span>
              </div>
            </label>
          </div>
          <input 
            id="featured-image-upload" 
            type="file" 
            className="hidden" 
            accept="image/*" 
            onChange={handleImageUpload}
            disabled={isUploading}
          />
        </>
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
      
      {imageUrl && (
        <div className="mt-2">
          <img 
            src={imageUrl} 
            alt={imageAlt || `Featured image for ${postTitle || 'blog post'}`} 
            className="rounded-md max-h-[200px] w-auto mx-auto"
          />
        </div>
      )}
    </div>
  );
};
