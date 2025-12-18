import { Block } from '@/types/builder';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface ButtonPropertiesProps {
  content: Block['content'];
  onUpdate: (content: Block['content']) => void;
  tab: 'content' | 'style';
}

export function ButtonProperties({ content, onUpdate, tab }: ButtonPropertiesProps) {
  const button = content.button || { 
    text: 'Click Me', 
    url: '#', 
    variant: 'primary' as const, 
    size: 'md' as const,
    alignment: 'left' as const 
  };

  const updateButton = (updates: Partial<typeof button>) => {
    onUpdate({
      ...content,
      button: { ...button, ...updates },
    });
  };

  if (tab === 'content') {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="button-text">Button Text</Label>
          <Input
            id="button-text"
            value={button.text}
            onChange={(e) => updateButton({ text: e.target.value })}
            placeholder="Enter button text..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="button-url">Link URL</Label>
          <Input
            id="button-url"
            value={button.url}
            onChange={(e) => updateButton({ url: e.target.value })}
            placeholder="https://example.com or #section"
          />
        </div>
      </div>
    );
  }

  // Style tab
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Button Style</Label>
        <Select
          value={button.variant}
          onValueChange={(value) => updateButton({ variant: value as typeof button.variant })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="primary">Primary (Filled)</SelectItem>
            <SelectItem value="secondary">Secondary</SelectItem>
            <SelectItem value="outline">Outline</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Size</Label>
        <Select
          value={button.size}
          onValueChange={(value) => updateButton({ size: value as typeof button.size })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sm">Small</SelectItem>
            <SelectItem value="md">Medium</SelectItem>
            <SelectItem value="lg">Large</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Alignment</Label>
        <ToggleGroup
          type="single"
          value={button.alignment}
          onValueChange={(value) => value && updateButton({ alignment: value as typeof button.alignment })}
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
