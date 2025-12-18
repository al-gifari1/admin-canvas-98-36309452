import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';

export interface TextShadowValue {
  horizontal: number;
  vertical: number;
  blur: number;
  color: string;
}

interface ShadowControlProps {
  label: string;
  value: TextShadowValue;
  onChange: (value: TextShadowValue) => void;
}

export function ShadowControl({ label, value, onChange }: ShadowControlProps) {
  const update = (updates: Partial<TextShadowValue>) => {
    onChange({ ...value, ...updates });
  };

  const previewShadow = `${value.horizontal}px ${value.vertical}px ${value.blur}px ${value.color}`;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium">{label}</Label>
        <div
          className="w-8 h-8 rounded bg-muted flex items-center justify-center text-xs font-bold"
          style={{ textShadow: previewShadow }}
        >
          Aa
        </div>
      </div>

      {/* Horizontal */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-[10px] text-muted-foreground">Horizontal</Label>
          <span className="text-[10px] text-muted-foreground">{value.horizontal}px</span>
        </div>
        <Slider
          value={[value.horizontal]}
          onValueChange={([v]) => update({ horizontal: v })}
          min={-50}
          max={50}
        />
      </div>

      {/* Vertical */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-[10px] text-muted-foreground">Vertical</Label>
          <span className="text-[10px] text-muted-foreground">{value.vertical}px</span>
        </div>
        <Slider
          value={[value.vertical]}
          onValueChange={([v]) => update({ vertical: v })}
          min={-50}
          max={50}
        />
      </div>

      {/* Blur */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-[10px] text-muted-foreground">Blur</Label>
          <span className="text-[10px] text-muted-foreground">{value.blur}px</span>
        </div>
        <Slider
          value={[value.blur]}
          onValueChange={([v]) => update({ blur: v })}
          min={0}
          max={50}
        />
      </div>

      {/* Color */}
      <div className="space-y-1.5">
        <Label className="text-[10px] text-muted-foreground">Color</Label>
        <div className="flex items-center gap-2">
          <Input
            type="color"
            value={value.color}
            onChange={(e) => update({ color: e.target.value })}
            className="w-10 h-8 p-0 border-0"
          />
          <Input
            value={value.color}
            onChange={(e) => update({ color: e.target.value })}
            className="flex-1 h-8 text-xs"
            placeholder="#000000"
          />
        </div>
      </div>
    </div>
  );
}
