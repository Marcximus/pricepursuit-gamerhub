
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface SlugInputProps {
  slug: string | undefined;
  onChange: (value: string) => void;
}

export const SlugInput = ({ slug, onChange }: SlugInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="slug">Slug*</Label>
      <Input 
        id="slug" 
        value={slug} 
        onChange={(e) => onChange(e.target.value.toLowerCase().replace(/[^\w-]/g, '-'))} 
        placeholder="post-url-slug" 
        required
      />
    </div>
  );
};
