
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface TitleInputProps {
  title: string;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const TitleInput = ({ title, onTitleChange }: TitleInputProps) => {
  // Clean the title from any JSON formatting or HTML tags
  const cleanTitle = title
    ?.replace(/^{.*?title['"]\s*:\s*['"](.*?)['"].*}$/i, '$1') // Extract from JSON if needed
    .replace(/<br\/>/g, '')
    .replace(/\\n/g, ' ')
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/<[^>]*>/g, '')
    .trim();

  return (
    <div className="space-y-2">
      <Label htmlFor="title">Title*</Label>
      <Input 
        id="title" 
        value={cleanTitle || title} 
        onChange={onTitleChange} 
        placeholder="Enter post title" 
        required
      />
    </div>
  );
};
