
import { Label } from '@/components/ui/label';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FeaturedImageUpload } from './FeaturedImageUpload';
import { AdditionalImagesUpload } from './AdditionalImagesUpload';

interface ImageUploadSectionProps {
  imageUrl: string | undefined;
  additionalImages: string[];
  onImageUpload: (url: string, alt?: string) => void;
  onAdditionalImagesUpdate: (images: string[], alts?: string[]) => void;
  category: string | undefined;
  postTitle?: string;
}

export const getMaxAdditionalImages = (category: string | undefined) => {
  switch (category) {
    case 'Top10': return 10;
    case 'Review': return 3;
    case 'Comparison': return 3;
    case 'How-To': return 3;
    default: return 3;
  }
};

export const getCategoryImageLabel = (category: string | undefined) => {
  switch (category) {
    case 'Top10': return 'Featured image (header) + 10 product images';
    case 'Review': return 'Featured image (header) + 3 images for article';
    case 'Comparison': return 'Header images for both laptops + 2 comparison images';
    case 'How-To': return 'Featured image (header) + 3 step images';
    default: return 'Featured image + additional images';
  }
};

export const ImageUploadSection = ({
  imageUrl,
  additionalImages,
  onImageUpload,
  onAdditionalImagesUpdate,
  category,
  postTitle
}: ImageUploadSectionProps) => {
  const maxImages = getMaxAdditionalImages(category);

  return (
    <div className="space-y-2">
      <div className="flex items-center">
        <Label>Images</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 ml-1 text-gray-400" />
            </TooltipTrigger>
            <TooltipContent>
              <p>{getCategoryImageLabel(category)}</p>
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
              ({additionalImages.length}/{maxImages})
            </span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="featured">
          <FeaturedImageUpload 
            imageUrl={imageUrl} 
            onImageUpload={onImageUpload}
            postTitle={postTitle}
          />
        </TabsContent>
        
        <TabsContent value="additional">
          <AdditionalImagesUpload 
            additionalImages={additionalImages}
            onImagesUpdate={onAdditionalImagesUpdate}
            maxImages={maxImages}
            category={category}
            postTitle={postTitle}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
