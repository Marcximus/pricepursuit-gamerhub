
import { BlogPost } from '@/contexts/BlogContext';
import { Card, CardContent } from '@/components/ui/card';
import {
  PublishedSwitch,
  CategorySelect,
  SlugInput,
  AuthorInput,
  TagsInput,
  ImageUploadSection
} from './postMetadata';

interface PostMetadataProps {
  post: Partial<BlogPost>;
  onChange: (field: string, value: any) => void;
  tagsInput: string;
  onTagsInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const PostMetadata = ({ post, onChange, tagsInput, onTagsInputChange }: PostMetadataProps) => {
  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <PublishedSwitch 
          published={post.published} 
          onChange={(value) => onChange('published', value)} 
        />
        
        <CategorySelect 
          category={post.category} 
          onChange={(value) => onChange('category', value)} 
        />
        
        <SlugInput 
          slug={post.slug} 
          onChange={(value) => onChange('slug', value)} 
        />
        
        <AuthorInput 
          author={post.author} 
          onChange={(value) => onChange('author', value)} 
        />
        
        <TagsInput 
          tagsInput={tagsInput} 
          onChange={onTagsInputChange} 
          tags={post.tags} 
        />
        
        <ImageUploadSection 
          imageUrl={post.image_url} 
          additionalImages={post.additional_images || []}
          onImageUpload={(url) => onChange('image_url', url)}
          onAdditionalImagesUpdate={(images) => onChange('additional_images', images)}
          category={post.category}
        />
      </CardContent>
    </Card>
  );
};
