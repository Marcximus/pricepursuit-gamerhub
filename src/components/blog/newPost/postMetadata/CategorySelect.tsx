
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BlogPost } from '@/contexts/BlogContext';

interface CategorySelectProps {
  category: string | undefined;
  onChange: (value: 'Top10' | 'Review' | 'Comparison' | 'How-To') => void;
}

export const CategorySelect = ({ category, onChange }: CategorySelectProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="category">Category*</Label>
      <Select 
        value={category} 
        onValueChange={(value: 'Top10' | 'Review' | 'Comparison' | 'How-To') => onChange(value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Top10">Top 10 Lists</SelectItem>
          <SelectItem value="Review">Reviews</SelectItem>
          <SelectItem value="Comparison">Comparisons</SelectItem>
          <SelectItem value="How-To">How-To Guides</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
