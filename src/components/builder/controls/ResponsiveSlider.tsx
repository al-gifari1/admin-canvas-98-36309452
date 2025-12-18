import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DeviceToggle, DeviceType } from './DeviceToggle';

export interface ResponsiveValue {
  desktop: number;
  tablet?: number;
  mobile?: number;
}

export type SizeUnit = 'px' | 'rem' | 'vw' | 'em';

interface ResponsiveSliderProps {
  label: string;
  value: ResponsiveValue;
  onChange: (value: ResponsiveValue) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: SizeUnit;
  onUnitChange?: (unit: SizeUnit) => void;
  showUnit?: boolean;
  units?: SizeUnit[];
}

export function ResponsiveSlider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = 'px',
  onUnitChange,
  showUnit = true,
  units = ['px', 'rem', 'vw'],
}: ResponsiveSliderProps) {
  const [activeDevice, setActiveDevice] = useState<DeviceType>('desktop');

  const getCurrentValue = () => {
    return value[activeDevice] ?? value.desktop;
  };

  const handleChange = (newValue: number) => {
    onChange({
      ...value,
      [activeDevice]: newValue,
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium">{label}</Label>
        <DeviceToggle value={activeDevice} onChange={setActiveDevice} />
      </div>
      <div className="flex items-center gap-2">
        <Slider
          value={[getCurrentValue()]}
          onValueChange={([v]) => handleChange(v)}
          min={min}
          max={max}
          step={step}
          className="flex-1"
        />
        <Input
          type="number"
          value={getCurrentValue()}
          onChange={(e) => handleChange(Number(e.target.value))}
          className="w-16 h-8 text-xs"
          min={min}
          max={max}
        />
        {showUnit && onUnitChange && (
          <Select value={unit} onValueChange={(v) => onUnitChange(v as SizeUnit)}>
            <SelectTrigger className="w-16 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {units.map((u) => (
                <SelectItem key={u} value={u}>
                  {u}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      {(value.tablet !== undefined || value.mobile !== undefined) && (
        <div className="flex gap-2 text-xs text-muted-foreground">
          <span>D: {value.desktop}</span>
          {value.tablet !== undefined && <span>T: {value.tablet}</span>}
          {value.mobile !== undefined && <span>M: {value.mobile}</span>}
        </div>
      )}
    </div>
  );
}
