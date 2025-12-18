import { Block } from '@/types/builder';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface ImagePropertiesProps {
  content: Block['content'];
  onUpdate: (content: Block['content']) => void;
  tab: 'content' | 'style';
}

export function ImageProperties({ content, onUpdate, tab }: ImagePropertiesProps) {
  const image = content.image || { url: '', alt: '', width: 'full' as const, alignment: 'center' as const };

  const updateImage = (updates: Partial<typeof image>) => {
    onUpdate({
      ...content,
      image: { ...image, ...updates },
    });
  };

  if (tab === 'content') {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="image-url">Image URL</Label>
          <Input
            id="image-url"
            value={image.url}
            onChange={(e) => updateImage({ url: e.target.value })}
            placeholder="https://example.com/image.jpg"
          />
          <p className="text-xs text-muted-foreground">
            Paste an image URL or upload coming soon
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="image-alt">Alt Text</Label>
          <Input
            id="image-alt"
            value={image.alt}
            onChange={(e) => updateImage({ alt: e.target.value })}
            placeholder="Describe the image..."
          />
          <p className="text-xs text-muted-foreground">
            Important for accessibility and SEO
          </p>
        </div>
      </div>
    );
  }

  // Style tab
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Width</Label>
        <Select
          value={image.width}
          onValueChange={(value) => updateImage({ width: value as typeof image.width })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select width" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="full">Full Width (100%)</SelectItem>
            <SelectItem value="auto">Auto (Original Size)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Alignment</Label>
        <ToggleGroup
          type="single"
          value={image.alignment}
          onValueChange={(value) => value && updateImage({ alignment: value as typeof image.alignment })}
          className="justify-start"
        >
          <ToggleGroupItem value="left" aria-label="Align left">
            <AlignLeft className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="center" aria-label="Align center">
            <AlignCenter className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="right" aria-label="Align right">
            <AlignRight className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}
