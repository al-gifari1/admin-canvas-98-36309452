import { Block } from '@/types/builder';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

interface ContainerPropertiesProps {
  content: Block['content'];
  onUpdate: (content: Block['content']) => void;
  tab: 'content' | 'style';
}

export function ContainerProperties({ content, onUpdate, tab }: ContainerPropertiesProps) {
  const container = content.container || { backgroundColor: 'transparent', padding: 16, maxWidth: 'lg' as const };

  const updateContainer = (updates: Partial<typeof container>) => {
    onUpdate({
      ...content,
      container: { ...container, ...updates },
    });
  };

  if (tab === 'content') {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-dashed border-border p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Containers wrap other widgets. Drag widgets inside this container to group them. Use the Style tab to customize appearance.
          </p>
        </div>
      </div>
    );
  }

  // Style tab
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Max Width</Label>
        <Select
          value={container.maxWidth}
          onValueChange={(value) => updateContainer({ maxWidth: value as typeof container.maxWidth })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select width" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="full">Full Width</SelectItem>
            <SelectItem value="lg">Large (1152px)</SelectItem>
            <SelectItem value="md">Medium (896px)</SelectItem>
            <SelectItem value="sm">Small (672px)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Padding</Label>
          <span className="text-xs text-muted-foreground">{container.padding}px</span>
        </div>
        <Slider
          value={[container.padding]}
          onValueChange={([value]) => updateContainer({ padding: value })}
          min={0}
          max={64}
          step={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="container-bg">Background Color</Label>
        <div className="flex gap-2">
          <Input
            id="container-bg"
            type="color"
            value={container.backgroundColor === 'transparent' ? '#ffffff' : container.backgroundColor}
            onChange={(e) => updateContainer({ backgroundColor: e.target.value })}
            className="w-12 h-10 p-1 cursor-pointer"
          />
          <Input
            value={container.backgroundColor}
            onChange={(e) => updateContainer({ backgroundColor: e.target.value })}
            placeholder="transparent"
            className="flex-1"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Use "transparent" for no background
        </p>
      </div>
    </div>
  );
}
