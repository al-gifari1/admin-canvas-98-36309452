import { Monitor, Tablet, Smartphone } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

export type DeviceType = 'desktop' | 'tablet' | 'mobile';

interface DeviceToggleProps {
  value: DeviceType;
  onChange: (device: DeviceType) => void;
  className?: string;
}

export function DeviceToggle({ value, onChange, className }: DeviceToggleProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(v) => v && onChange(v as DeviceType)}
        className={`${className || ''} gap-0.5`}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <ToggleGroupItem 
              value="desktop" 
              aria-label="Desktop" 
              className="h-7 w-7 p-0 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              <Monitor className="h-3.5 w-3.5" />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-popover text-popover-foreground border border-border z-50">
            Desktop
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <ToggleGroupItem 
              value="tablet" 
              aria-label="Tablet" 
              className="h-7 w-7 p-0 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              <Tablet className="h-3.5 w-3.5" />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-popover text-popover-foreground border border-border z-50">
            Tablet
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <ToggleGroupItem 
              value="mobile" 
              aria-label="Mobile" 
              className="h-7 w-7 p-0 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              <Smartphone className="h-3.5 w-3.5" />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-popover text-popover-foreground border border-border z-50">
            Mobile
          </TooltipContent>
        </Tooltip>
      </ToggleGroup>
    </TooltipProvider>
  );
}
