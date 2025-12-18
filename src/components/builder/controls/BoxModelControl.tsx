import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link, Unlink } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

export interface BoxModelValue {
  top: number;
  right: number;
  bottom: number;
  left: number;
  linked: boolean;
}

interface BoxModelControlProps {
  label: string;
  value: BoxModelValue;
  onChange: (value: BoxModelValue) => void;
  unit?: string;
}

export function BoxModelControl({ label, value, onChange, unit = 'px' }: BoxModelControlProps) {
  const handleChange = (side: 'top' | 'right' | 'bottom' | 'left', newValue: number) => {
    if (value.linked) {
      onChange({
        ...value,
        top: newValue,
        right: newValue,
        bottom: newValue,
        left: newValue,
      });
    } else {
      onChange({
        ...value,
        [side]: newValue,
      });
    }
  };

  const toggleLinked = () => {
    const newLinked = !value.linked;
    if (newLinked) {
      // When linking, use the top value for all
      onChange({
        ...value,
        linked: true,
        right: value.top,
        bottom: value.top,
        left: value.top,
      });
    } else {
      onChange({ ...value, linked: false });
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium">{label}</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={value.linked ? 'secondary' : 'ghost'}
                size="icon"
                className="h-6 w-6"
                onClick={toggleLinked}
              >
                {value.linked ? (
                  <Link className="h-3 w-3" />
                ) : (
                  <Unlink className="h-3 w-3" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {value.linked ? 'Unlink values' : 'Link values'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground">Top</Label>
          <Input
            type="number"
            value={value.top}
            onChange={(e) => handleChange('top', Number(e.target.value))}
            className="h-8 text-xs"
            min={0}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground">Right</Label>
          <Input
            type="number"
            value={value.right}
            onChange={(e) => handleChange('right', Number(e.target.value))}
            className="h-8 text-xs"
            min={0}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground">Bottom</Label>
          <Input
            type="number"
            value={value.bottom}
            onChange={(e) => handleChange('bottom', Number(e.target.value))}
            className="h-8 text-xs"
            min={0}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground">Left</Label>
          <Input
            type="number"
            value={value.left}
            onChange={(e) => handleChange('left', Number(e.target.value))}
            className="h-8 text-xs"
            min={0}
          />
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground text-right">{unit}</p>
    </div>
  );
}
