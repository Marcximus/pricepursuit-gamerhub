
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cleanTitle } from '@/services/blog/generate/parser/titleCleaner';

interface TitleInputProps {
  title: string;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const TitleInput = ({ title, onTitleChange }: TitleInputProps) => {
  // Use the imported cleanTitle function for consistent cleaning
  // but only if we have a title to clean
  const processedTitle = title ? cleanTitle(title) : '';

  return (
    <div className="space-y-2">
      <Label htmlFor="title">Title*</Label>
      <Input 
        id="title" 
        value={processedTitle} 
        onChange={onTitleChange} 
        placeholder="Enter post title" 
        required
      />
    </div>
  );
};
