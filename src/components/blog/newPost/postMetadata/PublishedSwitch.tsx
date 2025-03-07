
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface PublishedSwitchProps {
  published: boolean | undefined;
  onChange: (value: boolean) => void;
}

export const PublishedSwitch = ({ published, onChange }: PublishedSwitchProps) => {
  return (
    <div className="flex items-center justify-between">
      <Label htmlFor="published">Published</Label>
      <Switch 
        id="published" 
        checked={published} 
        onCheckedChange={(value) => onChange(value)} 
      />
    </div>
  );
};
