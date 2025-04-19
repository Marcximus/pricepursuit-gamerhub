import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cleanTitle } from '@/services/blog/generate/parser/titleCleaner';

interface TitleInputProps {
  title: string;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const TitleInput = ({ title, onTitleChange }: TitleInputProps) => {
  // Modify to keep spaces but still use other cleaning methods
  const processedTitle = title ? title.trim() : '';

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
