
import { BlogPost } from '@/contexts/BlogContext';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Image } from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { uploadBlogImage } from '@/services/blogService';

interface PostMetadataProps {
  post: Partial<BlogPost>;
  onChange: (field: string, value: any) => void;
  tagsInput: string;
  onTagsInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const PostMetadata = ({ post, onChange, tagsInput, onTagsInputChange }: PostMetadataProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setIsUploading(true);
      const url = await uploadBlogImage(file);
      if (url) {
        onChange('image_url', url);
        toast({
          title: "Image uploaded",
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
          <Label htmlFor="image">Featured Image</Label>
          <div className="flex flex-col space-y-2">
            <label 
              htmlFor="image-upload" 
              className="cursor-pointer flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-4 hover:border-gray-400 transition-colors"
            >
              <div className="flex flex-col items-center space-y-2">
                <Image className="h-8 w-8 text-gray-400" />
                <span className="text-sm text-gray-500">
                  {isUploading ? 'Uploading...' : 'Click to upload an image'}
                </span>
              </div>
            </label>
            <input 
              id="image-upload" 
              type="file" 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageUpload}
              disabled={isUploading}
            />
          </div>
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
      </CardContent>
    </Card>
  );
};
