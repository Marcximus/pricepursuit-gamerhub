
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface TitleInputProps {
  title: string;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const TitleInput = ({ title, onTitleChange }: TitleInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="title">Title*</Label>
      <Input 
        id="title" 
        value={title} 
        onChange={onTitleChange} 
        placeholder="Enter post title" 
        required
      />
    </div>
  );
};
