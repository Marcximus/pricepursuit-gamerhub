
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ExcerptInputProps {
  excerpt: string;
  onExcerptChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const ExcerptInput = ({ excerpt, onExcerptChange }: ExcerptInputProps) => {
  // Enhanced excerpt cleaning function
  const cleanExcerpt = (rawExcerpt: string): string => {
    if (!rawExcerpt) return '';
    
    // First, check if the entire excerpt is in JSON format
    if (rawExcerpt.trim().startsWith('{') && rawExcerpt.trim().endsWith('}')) {
      try {
        // Try to parse as JSON
        const parsed = JSON.parse(rawExcerpt);
        if (parsed && parsed.excerpt) {
          return parsed.excerpt;
        }
      } catch (e) {
        // If parsing fails, proceed with regex cleaning
      }
    }
    
    // Apply regex cleaning in any case as a fallback
    return rawExcerpt
      // Extract from JSON if needed
      .replace(/^{.*?"excerpt"[\s]*:[\s]*"(.*?)".*}$/i, '$1')
      // Clean up formatting
      .replace(/\\n/g, ' ')
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'")
      .replace(/<[^>]*>/g, '')
      .trim();
  };

  const processedExcerpt = excerpt ? cleanExcerpt(excerpt) : '';

  return (
    <div className="space-y-2">
      <Label htmlFor="excerpt">Excerpt*</Label>
      <Textarea 
        id="excerpt" 
        value={processedExcerpt} 
        onChange={onExcerptChange} 
        placeholder="Brief summary of the post (2-3 sentences)" 
        rows={3} 
        required
      />
    </div>
  );
};
