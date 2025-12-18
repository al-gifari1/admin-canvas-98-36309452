import { Block } from '@/types/builder';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface SpacerPropertiesProps {
  content: Block['content'];
  onUpdate: (content: Block['content']) => void;
  tab: 'content' | 'style';
}

export function SpacerProperties({ content, onUpdate, tab }: SpacerPropertiesProps) {
  const spacer = content.spacer || { height: 40 };

  const updateSpacer = (updates: Partial<typeof spacer>) => {
    onUpdate({
      ...content,
      spacer: { ...spacer, ...updates },
    });
  };

  if (tab === 'content') {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-dashed border-border p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Spacers have no content settings. Use the Style tab to adjust height.
          </p>
        </div>
      </div>
    );
  }

  // Style tab
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Height</Label>
          <span className="text-xs text-muted-foreground">{spacer.height}px</span>
        </div>
        <Slider
          value={[spacer.height]}
          onValueChange={([value]) => updateSpacer({ height: value })}
          min={8}
          max={200}
          step={4}
        />
      </div>

      {/* Visual preview */}
      <div className="space-y-2">
        <Label>Preview</Label>
        <div className="border border-dashed border-border rounded-lg overflow-hidden">
          <div 
            className="bg-primary/10 w-full transition-all" 
            style={{ height: spacer.height }}
          />
        </div>
      </div>
    </div>
  );
}
