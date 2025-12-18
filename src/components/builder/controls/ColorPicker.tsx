import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Paintbrush } from 'lucide-react';

export interface GradientStop {
  color: string;
  position: number;
}

export interface GradientValue {
  type: 'linear' | 'radial';
  angle?: number;
  stops: GradientStop[];
}

export interface ColorValue {
  type: 'solid' | 'gradient';
  solid?: string;
  gradient?: GradientValue;
}

interface ColorPickerProps {
  label: string;
  value: ColorValue;
  onChange: (value: ColorValue) => void;
  showGradient?: boolean;
}

const presetColors = [
  '#000000', '#ffffff', '#ef4444', '#f97316', '#eab308',
  '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899',
];

export function ColorPicker({ label, value, onChange, showGradient = true }: ColorPickerProps) {
  const [activeTab, setActiveTab] = useState<'solid' | 'gradient'>(value.type);

  const displayColor = value.type === 'solid' 
    ? value.solid || '#000000'
    : value.gradient 
      ? `linear-gradient(${value.gradient.angle || 90}deg, ${value.gradient.stops.map(s => `${s.color} ${s.position}%`).join(', ')})`
      : '#000000';

  const handleSolidChange = (color: string) => {
    onChange({ ...value, type: 'solid', solid: color });
  };

  const handleGradientAngleChange = (angle: number) => {
    onChange({
      ...value,
      type: 'gradient',
      gradient: {
        type: 'linear',
        angle,
        stops: value.gradient?.stops || [
          { color: '#3b82f6', position: 0 },
          { color: '#8b5cf6', position: 100 },
        ],
      },
    });
  };

  const handleGradientStopChange = (index: number, updates: Partial<GradientStop>) => {
    const stops = [...(value.gradient?.stops || [{ color: '#3b82f6', position: 0 }, { color: '#8b5cf6', position: 100 }])];
    stops[index] = { ...stops[index], ...updates };
    onChange({
      ...value,
      type: 'gradient',
      gradient: {
        type: value.gradient?.type || 'linear',
        angle: value.gradient?.angle || 90,
        stops,
      },
    });
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium">{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start gap-2 h-9">
            <div
              className="w-5 h-5 rounded border border-border"
              style={{ background: displayColor }}
            />
            <span className="text-xs truncate flex-1 text-left">
              {value.type === 'solid' ? value.solid : 'Gradient'}
            </span>
            <Paintbrush className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="start">
          {showGradient ? (
            <Tabs value={activeTab} onValueChange={(v) => {
              setActiveTab(v as 'solid' | 'gradient');
              onChange({ ...value, type: v as 'solid' | 'gradient' });
            }}>
              <TabsList className="grid w-full grid-cols-2 mb-3">
                <TabsTrigger value="solid" className="text-xs">Solid</TabsTrigger>
                <TabsTrigger value="gradient" className="text-xs">Gradient</TabsTrigger>
              </TabsList>
              <TabsContent value="solid" className="space-y-3 mt-0">
                <Input
                  type="color"
                  value={value.solid || '#000000'}
                  onChange={(e) => handleSolidChange(e.target.value)}
                  className="w-full h-8 p-0 border-0"
                />
                <Input
                  value={value.solid || '#000000'}
                  onChange={(e) => handleSolidChange(e.target.value)}
                  placeholder="#000000"
                  className="h-8 text-xs"
                />
                <div className="grid grid-cols-5 gap-1.5">
                  {presetColors.map((color) => (
                    <button
                      key={color}
                      className="w-full aspect-square rounded border border-border hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={() => handleSolidChange(color)}
                    />
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="gradient" className="space-y-3 mt-0">
                <div className="space-y-2">
                  <Label className="text-xs">Angle</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[value.gradient?.angle || 90]}
                      onValueChange={([v]) => handleGradientAngleChange(v)}
                      min={0}
                      max={360}
                      className="flex-1"
                    />
                    <span className="text-xs w-8">{value.gradient?.angle || 90}°</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Color Stops</Label>
                  {(value.gradient?.stops || [{ color: '#3b82f6', position: 0 }, { color: '#8b5cf6', position: 100 }]).map((stop, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={stop.color}
                        onChange={(e) => handleGradientStopChange(i, { color: e.target.value })}
                        className="w-8 h-8 p-0 border-0"
                      />
                      <Input
                        type="number"
                        value={stop.position}
                        onChange={(e) => handleGradientStopChange(i, { position: Number(e.target.value) })}
                        className="flex-1 h-8 text-xs"
                        min={0}
                        max={100}
                      />
                      <span className="text-xs">%</span>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="space-y-3">
              <Input
                type="color"
                value={value.solid || '#000000'}
                onChange={(e) => handleSolidChange(e.target.value)}
                className="w-full h-8 p-0 border-0"
              />
              <Input
                value={value.solid || '#000000'}
                onChange={(e) => handleSolidChange(e.target.value)}
                placeholder="#000000"
                className="h-8 text-xs"
              />
              <div className="grid grid-cols-5 gap-1.5">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    className="w-full aspect-square rounded border border-border hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => handleSolidChange(color)}
                  />
                ))}
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
