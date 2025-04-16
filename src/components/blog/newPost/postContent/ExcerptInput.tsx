
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cleanExcerpt } from '@/services/blog/generate/parser/excerptCleaner'; 

interface ExcerptInputProps {
  excerpt: string;
  onExcerptChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const ExcerptInput = ({ excerpt, onExcerptChange }: ExcerptInputProps) => {
  // Use the imported cleanExcerpt function for consistent cleaning
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
