import { Block } from '@/types/builder';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Columns2, Columns3, LayoutGrid } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface GridPropertiesProps {
  content: Block['content'];
  onUpdate: (content: Block['content']) => void;
  tab: 'content' | 'style';
}

export function GridProperties({ content, onUpdate, tab }: GridPropertiesProps) {
  const grid = content.grid || { columns: 3 as const, gap: 16 };

  const updateGrid = (updates: Partial<typeof grid>) => {
    onUpdate({
      ...content,
      grid: { ...grid, ...updates },
    });
  };

  if (tab === 'content') {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Number of Columns</Label>
          <ToggleGroup
            type="single"
            value={String(grid.columns)}
            onValueChange={(value) => value && updateGrid({ columns: Number(value) as typeof grid.columns })}
            className="justify-start"
          >
            <ToggleGroupItem value="2" aria-label="2 columns" className="gap-2">
              <Columns2 className="h-4 w-4" />
              <span>2</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="3" aria-label="3 columns" className="gap-2">
              <Columns3 className="h-4 w-4" />
              <span>3</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="4" aria-label="4 columns" className="gap-2">
              <LayoutGrid className="h-4 w-4" />
              <span>4</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Preview */}
        <div className="space-y-2">
          <Label>Preview</Label>
          <div 
            className="grid border border-border rounded-lg p-2" 
            style={{ gridTemplateColumns: `repeat(${grid.columns}, 1fr)`, gap: grid.gap / 4 }}
          >
            {Array.from({ length: grid.columns }).map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                {i + 1}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Style tab
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Gap Between Columns</Label>
          <span className="text-xs text-muted-foreground">{grid.gap}px</span>
        </div>
        <Slider
          value={[grid.gap]}
          onValueChange={([value]) => updateGrid({ gap: value })}
          min={0}
          max={48}
          step={4}
        />
      </div>
    </div>
  );
}
