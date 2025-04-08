
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface TitleInputProps {
  title: string;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const TitleInput = ({ title, onTitleChange }: TitleInputProps) => {
  // Enhanced title cleaning function
  const cleanTitle = (rawTitle: string): string => {
    if (!rawTitle) return '';
    
    // First, check if the entire title is a JSON object with a title property
    if (rawTitle.trim().startsWith('{') && rawTitle.trim().endsWith('}')) {
      try {
        // Try to parse as JSON
        const parsed = JSON.parse(rawTitle);
        if (parsed && parsed.title) {
          return parsed.title;
        }
      } catch (e) {
        // If parsing fails, proceed with regex cleaning
      }
    }
    
    // Apply regex cleaning in any case as a fallback
    return rawTitle
      // Handle JSON format: {"title": "Actual Title"} or variations
      .replace(/^{.*?"title"[\s]*:[\s]*"(.*?)".*}$/i, '$1')
      // Handle HTML line breaks
      .replace(/<br\/>/g, '')
      // Handle escaped newlines
      .replace(/\\n/g, ' ')
      // Handle escaped quotes
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'")
      // Remove any HTML tags
      .replace(/<[^>]*>/g, '')
      .trim();
  };

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
