
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface AuthorInputProps {
  author: string | undefined;
  onChange: (value: string) => void;
}

export const AuthorInput = ({ author, onChange }: AuthorInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="author">Author*</Label>
      <Input 
        id="author" 
        value={author} 
        onChange={(e) => onChange(e.target.value)} 
        placeholder="Author name" 
        required
      />
    </div>
  );
};
