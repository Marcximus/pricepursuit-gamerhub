
import { BlogPost } from '@/contexts/BlogContext';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Image, ImagePlus, Info } from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { uploadBlogImage } from '@/services/blogService';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PostMetadataProps {
  post: Partial<BlogPost>;
  onChange: (field: string, value: any) => void;
  tagsInput: string;
  onTagsInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const PostMetadata = ({ post, onChange, tagsInput, onTagsInputChange }: PostMetadataProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [additionalImages, setAdditionalImages] = useState<string[]>(post.additional_images || []);

  const getMaxAdditionalImages = (category: string) => {
    switch (category) {
      case 'Top10': return 10;
      case 'Review': return 3;
      case 'Comparison': return category === 'Comparison' ? 3 : 3; // 2 for laptops + 1 additional
      case 'How-To': return 3;
      default: return 3;
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setIsUploading(true);
      const url = await uploadBlogImage(file);
      if (url) {
        onChange('image_url', url);
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

  const handleAdditionalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const maxImages = getMaxAdditionalImages(post.category || 'Review');
    if (additionalImages.length >= maxImages) {
      toast({
        title: "Maximum images reached",
        description: `You can only upload ${maxImages} additional images for this post type.`,
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsUploading(true);
      const url = await uploadBlogImage(file);
      if (url) {
        const updatedImages = [...additionalImages, url];
        setAdditionalImages(updatedImages);
        onChange('additional_images', updatedImages);
        toast({
          title: "Additional image uploaded",
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

  const removeAdditionalImage = (index: number) => {
    const updatedImages = [...additionalImages];
    updatedImages.splice(index, 1);
    setAdditionalImages(updatedImages);
    onChange('additional_images', updatedImages);
  };

  const getCategoryImageLabel = (category: string | undefined) => {
    switch (category) {
      case 'Top10': return 'Featured image (header) + 10 product images';
      case 'Review': return 'Featured image (header) + 3 images for article';
      case 'Comparison': return 'Header images for both laptops + 2 comparison images';
      case 'How-To': return 'Featured image (header) + 3 step images';
      default: return 'Featured image + additional images';
    }
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <div className="flex items-center justify-between">
          <Label htmlFor="published">Published</Label>
          <Switch 
            id="published" 
            checked={post.published} 
            onCheckedChange={(value) => onChange('published', value)} 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="category">Category*</Label>
          <Select 
            value={post.category} 
            onValueChange={(value: 'Top10' | 'Review' | 'Comparison' | 'How-To') => onChange('category', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Top10">Top 10 Lists</SelectItem>
              <SelectItem value="Review">Reviews</SelectItem>
              <SelectItem value="Comparison">Comparisons</SelectItem>
              <SelectItem value="How-To">How-To Guides</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="slug">Slug*</Label>
          <Input 
            id="slug" 
            value={post.slug} 
            onChange={(e) => onChange('slug', e.target.value.toLowerCase().replace(/[^\w-]/g, '-'))} 
            placeholder="post-url-slug" 
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="author">Author*</Label>
          <Input 
            id="author" 
            value={post.author} 
            onChange={(e) => onChange('author', e.target.value)} 
            placeholder="Author name" 
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="tags">Tags (comma separated)</Label>
          <Input 
            id="tags" 
            value={tagsInput} 
            onChange={onTagsInputChange}
            placeholder="tag1, tag2, tag3" 
          />
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {post.tags.map((tag, i) => (
                <span key={i} className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center">
            <Label>Images</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 ml-1 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{getCategoryImageLabel(post.category)}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <Tabs defaultValue="featured">
            <TabsList className="mb-2">
              <TabsTrigger value="featured">Featured Image</TabsTrigger>
              <TabsTrigger value="additional">
                Additional Images 
                <span className="ml-1 text-xs">
                  ({additionalImages.length}/{getMaxAdditionalImages(post.category || 'Review')})
                </span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="featured">
              <div className="flex flex-col space-y-2">
                <label 
                  htmlFor="featured-image-upload" 
                  className="cursor-pointer flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-4 hover:border-gray-400 transition-colors"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Image className="h-8 w-8 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      {isUploading ? 'Uploading...' : post.image_url ? 'Change featured image' : 'Upload featured image'}
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
                {post.image_url && (
                  <div className="mt-2">
                    <img 
                      src={post.image_url} 
                      alt="Featured image" 
                      className="rounded-md max-h-[200px] w-auto mx-auto"
                    />
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="additional">
              <div className="space-y-4">
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
                    disabled={isUploading || additionalImages.length >= getMaxAdditionalImages(post.category || 'Review')}
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
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};
