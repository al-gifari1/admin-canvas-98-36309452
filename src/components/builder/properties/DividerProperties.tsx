import { Block } from '@/types/builder';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

interface DividerPropertiesProps {
  content: Block['content'];
  onUpdate: (content: Block['content']) => void;
  tab: 'content' | 'style';
}

export function DividerProperties({ content, onUpdate, tab }: DividerPropertiesProps) {
  const divider = content.divider || { style: 'solid' as const, width: 100, color: '#e5e7eb' };

  const updateDivider = (updates: Partial<typeof divider>) => {
    onUpdate({
      ...content,
      divider: { ...divider, ...updates },
    });
  };

  if (tab === 'content') {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-dashed border-border p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Dividers have no content settings. Use the Style tab to customize appearance.
          </p>
        </div>
      </div>
    );
  }

  // Style tab
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Line Style</Label>
        <Select
          value={divider.style}
          onValueChange={(value) => updateDivider({ style: value as typeof divider.style })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="solid">Solid</SelectItem>
            <SelectItem value="dashed">Dashed</SelectItem>
            <SelectItem value="dotted">Dotted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Width</Label>
          <span className="text-xs text-muted-foreground">{divider.width}%</span>
        </div>
        <Slider
          value={[divider.width]}
          onValueChange={([value]) => updateDivider({ width: value })}
          min={10}
          max={100}
          step={5}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="divider-color">Color</Label>
        <div className="flex gap-2">
          <Input
            id="divider-color"
            type="color"
            value={divider.color}
            onChange={(e) => updateDivider({ color: e.target.value })}
            className="w-12 h-10 p-1 cursor-pointer"
          />
          <Input
            value={divider.color}
            onChange={(e) => updateDivider({ color: e.target.value })}
            placeholder="#e5e7eb"
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
}
