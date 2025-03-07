
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ExcerptInputProps {
  excerpt: string;
  onExcerptChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const ExcerptInput = ({ excerpt, onExcerptChange }: ExcerptInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="excerpt">Excerpt*</Label>
      <Textarea 
        id="excerpt" 
        value={excerpt} 
        onChange={onExcerptChange} 
        placeholder="Brief summary of the post (2-3 sentences)" 
        rows={3} 
        required
      />
    </div>
  );
};
