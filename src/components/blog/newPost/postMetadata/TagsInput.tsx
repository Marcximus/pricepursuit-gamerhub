
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface TagsInputProps {
  tagsInput: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  tags: string[] | undefined;
}

export const TagsInput = ({ tagsInput, onChange, tags }: TagsInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="tags">Tags (comma separated)</Label>
      <Input 
        id="tags" 
        value={tagsInput} 
        onChange={onChange}
        placeholder="tag1, tag2, tag3" 
      />
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag, i) => (
            <span key={i} className="bg-gray-100 px-2 py-1 rounded-full text-xs">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
