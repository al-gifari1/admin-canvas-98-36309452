import { Block, FlexContainerContent, FlexContainerLayout, ContainerBackground, ContainerBorder, ContainerShadow, ContainerAdvanced, ResponsiveValue } from '@/types/builder';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ResponsiveSlider } from '../controls/ResponsiveSlider';
import { BoxModelControl } from '../controls/BoxModelControl';
import { CustomCSSFields } from '../controls/CustomCSSFields';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  ArrowDown,
  AlignHorizontalJustifyStart,
  AlignHorizontalJustifyCenter,
  AlignHorizontalJustifyEnd,
  AlignHorizontalDistributeCenter,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  StretchHorizontal,
} from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FlexContainerPropertiesProps {
  content: Block['content'];
  onUpdate: (content: Block['content']) => void;
  tab: 'content' | 'style' | 'advanced';
}

const DEFAULT_FLEX_CONTAINER: FlexContainerContent = {
  layout: {
    direction: 'row',
    wrap: 'wrap',
    justifyContent: 'start',
    alignItems: 'stretch',
    alignContent: 'start',
    gap: { desktop: 16, tablet: 12, mobile: 8 },
  },
  background: {
    type: 'solid',
    color: 'transparent',
  },
  border: {
    style: 'none',
    width: { top: 0, right: 0, bottom: 0, left: 0, linked: true },
    color: '#e5e7eb',
    radius: { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0, linked: true },
  },
  shadow: {
    enabled: false,
    horizontal: 0,
    vertical: 4,
    blur: 6,
    spread: 0,
    color: 'rgba(0,0,0,0.1)',
  },
  advanced: {
    margin: { top: 0, right: 0, bottom: 0, left: 0, linked: true },
    padding: { top: 16, right: 16, bottom: 16, left: 16, linked: true },
    maxWidth: 'lg',
    responsive: { hideOnDesktop: false, hideOnTablet: false, hideOnMobile: false },
  },
};

export function FlexContainerProperties({ content, onUpdate, tab }: FlexContainerPropertiesProps) {
  const flexContainer = content.flexContainer || DEFAULT_FLEX_CONTAINER;

  const updateFlexContainer = (updates: Partial<FlexContainerContent>) => {
    onUpdate({
      ...content,
      flexContainer: { ...flexContainer, ...updates },
    });
  };

  const updateLayout = (updates: Partial<FlexContainerLayout>) => {
    updateFlexContainer({
      layout: { ...flexContainer.layout, ...updates },
    });
  };

  const updateBackground = (updates: Partial<ContainerBackground>) => {
    updateFlexContainer({
      background: { ...flexContainer.background, ...updates },
    });
  };

  const updateBorder = (updates: Partial<ContainerBorder>) => {
    updateFlexContainer({
      border: { ...flexContainer.border, ...updates },
    });
  };

  const updateShadow = (updates: Partial<ContainerShadow>) => {
    updateFlexContainer({
      shadow: { ...flexContainer.shadow, ...updates },
    });
  };

  const updateAdvanced = (updates: Partial<ContainerAdvanced>) => {
    updateFlexContainer({
      advanced: { ...flexContainer.advanced, ...updates },
    });
  };

  // Content/Layout Tab
  if (tab === 'content') {
    return (
      <div className="space-y-6">
        {/* Direction */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Direction</Label>
          <TooltipProvider>
            <ToggleGroup
              type="single"
              value={flexContainer.layout.direction}
              onValueChange={(v) => v && updateLayout({ direction: v as 'row' | 'column' })}
              className="justify-start"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem value="row" className="gap-1.5 text-xs">
                    <ArrowRight className="h-3.5 w-3.5" />
                    Row
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent>Items flow horizontally</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem value="column" className="gap-1.5 text-xs">
                    <ArrowDown className="h-3.5 w-3.5" />
                    Column
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent>Items flow vertically</TooltipContent>
              </Tooltip>
            </ToggleGroup>
          </TooltipProvider>
        </div>

        {/* Wrap */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Wrap</Label>
          <Select
            value={flexContainer.layout.wrap}
            onValueChange={(v) => updateLayout({ wrap: v as 'nowrap' | 'wrap' | 'wrap-reverse' })}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nowrap">No Wrap</SelectItem>
              <SelectItem value="wrap">Wrap</SelectItem>
              <SelectItem value="wrap-reverse">Wrap Reverse</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Justify Content */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Justify Content</Label>
          <TooltipProvider>
            <ToggleGroup
              type="single"
              value={flexContainer.layout.justifyContent}
              onValueChange={(v) => v && updateLayout({ justifyContent: v as FlexContainerLayout['justifyContent'] })}
              className="flex flex-wrap gap-1"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem value="start" className="h-8 w-8 p-0">
                    <AlignHorizontalJustifyStart className="h-4 w-4" />
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent>Start</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem value="center" className="h-8 w-8 p-0">
                    <AlignHorizontalJustifyCenter className="h-4 w-4" />
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent>Center</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem value="end" className="h-8 w-8 p-0">
                    <AlignHorizontalJustifyEnd className="h-4 w-4" />
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent>End</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem value="between" className="h-8 w-8 p-0">
                    <AlignHorizontalDistributeCenter className="h-4 w-4" />
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent>Space Between</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem value="around" className="h-8 px-2 text-xs">
                    Around
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent>Space Around</TooltipContent>
              </Tooltip>
            </ToggleGroup>
          </TooltipProvider>
        </div>

        {/* Align Items */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Align Items</Label>
          <TooltipProvider>
            <ToggleGroup
              type="single"
              value={flexContainer.layout.alignItems}
              onValueChange={(v) => v && updateLayout({ alignItems: v as FlexContainerLayout['alignItems'] })}
              className="flex flex-wrap gap-1"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem value="start" className="h-8 w-8 p-0">
                    <AlignVerticalJustifyStart className="h-4 w-4" />
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent>Start</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem value="center" className="h-8 w-8 p-0">
                    <AlignVerticalJustifyCenter className="h-4 w-4" />
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent>Center</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem value="end" className="h-8 w-8 p-0">
                    <AlignVerticalJustifyEnd className="h-4 w-4" />
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent>End</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem value="stretch" className="h-8 w-8 p-0">
                    <StretchHorizontal className="h-4 w-4" />
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent>Stretch</TooltipContent>
              </Tooltip>
            </ToggleGroup>
          </TooltipProvider>
        </div>

        {/* Gap */}
        <ResponsiveSlider
          label="Gap"
          value={flexContainer.layout.gap}
          onChange={(gap) => updateLayout({ gap })}
          min={0}
          max={64}
          step={4}
          unit="px"
        />

        {/* Info about canvas interactions */}
        <div className="rounded-lg border border-dashed border-border p-3 bg-muted/50">
          <p className="text-xs text-muted-foreground">
            💡 <strong>Tip:</strong> Drag items into this container - they will snap into the flex flow.
          </p>
        </div>
      </div>
    );
  }

  // Style Tab
  if (tab === 'style') {
    return (
      <div className="space-y-6">
        {/* Background */}
        <div className="space-y-3">
          <Label className="text-xs font-medium">Background</Label>
          <Select
            value={flexContainer.background.type}
            onValueChange={(v) => updateBackground({ type: v as 'solid' | 'gradient' | 'image' })}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solid">Solid Color</SelectItem>
              <SelectItem value="gradient">Gradient</SelectItem>
              <SelectItem value="image">Image</SelectItem>
            </SelectContent>
          </Select>

          {flexContainer.background.type === 'solid' && (
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={flexContainer.background.color === 'transparent' ? '#ffffff' : flexContainer.background.color || '#ffffff'}
                onChange={(e) => updateBackground({ color: e.target.value })}
                className="h-8 w-8 rounded border border-border cursor-pointer"
              />
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => updateBackground({ color: 'transparent' })}
              >
                Transparent
              </Button>
            </div>
          )}
        </div>

        {/* Border */}
        <div className="space-y-3">
          <Label className="text-xs font-medium">Border</Label>
          <Select
            value={flexContainer.border.style}
            onValueChange={(v) => updateBorder({ style: v as 'none' | 'solid' | 'dashed' | 'dotted' })}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="solid">Solid</SelectItem>
              <SelectItem value="dashed">Dashed</SelectItem>
              <SelectItem value="dotted">Dotted</SelectItem>
            </SelectContent>
          </Select>

          {flexContainer.border.style !== 'none' && (
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={flexContainer.border.color || '#e5e7eb'}
                onChange={(e) => updateBorder({ color: e.target.value })}
                className="h-8 w-8 rounded border border-border cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Shadow */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium">Shadow</Label>
            <Switch
              checked={flexContainer.shadow.enabled}
              onCheckedChange={(enabled) => updateShadow({ enabled })}
            />
          </div>
        </div>
      </div>
    );
  }

  // Advanced Tab
  if (tab === 'advanced') {
    return (
      <div className="space-y-6">
        {/* Padding */}
        <BoxModelControl
          label="Padding"
          value={flexContainer.advanced.padding}
          onChange={(padding) => updateAdvanced({ padding })}
        />

        {/* Margin */}
        <BoxModelControl
          label="Margin"
          value={flexContainer.advanced.margin}
          onChange={(margin) => updateAdvanced({ margin })}
        />

        {/* Max Width */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Max Width</Label>
          <Select
            value={flexContainer.advanced.maxWidth}
            onValueChange={(v) => updateAdvanced({ maxWidth: v as ContainerAdvanced['maxWidth'] })}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full">Full Width</SelectItem>
              <SelectItem value="lg">Large (1024px)</SelectItem>
              <SelectItem value="md">Medium (768px)</SelectItem>
              <SelectItem value="sm">Small (640px)</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Responsive */}
        <div className="space-y-3">
          <Label className="text-xs font-medium">Responsive Visibility</Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs">Hide on Desktop</span>
              <Switch
                checked={flexContainer.advanced.responsive.hideOnDesktop}
                onCheckedChange={(v) => updateAdvanced({
                  responsive: { ...flexContainer.advanced.responsive, hideOnDesktop: v },
                })}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs">Hide on Tablet</span>
              <Switch
                checked={flexContainer.advanced.responsive.hideOnTablet}
                onCheckedChange={(v) => updateAdvanced({
                  responsive: { ...flexContainer.advanced.responsive, hideOnTablet: v },
                })}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs">Hide on Mobile</span>
              <Switch
                checked={flexContainer.advanced.responsive.hideOnMobile}
                onCheckedChange={(v) => updateAdvanced({
                  responsive: { ...flexContainer.advanced.responsive, hideOnMobile: v },
                })}
              />
            </div>
          </div>
        </div>

        {/* Custom CSS */}
        <CustomCSSFields
          cssId={flexContainer.advanced.cssId}
          cssClasses={flexContainer.advanced.cssClasses}
          customCSS={flexContainer.advanced.customCSS}
          onCssIdChange={(cssId) => updateAdvanced({ cssId })}
          onCssClassesChange={(cssClasses) => updateAdvanced({ cssClasses })}
          onCustomCSSChange={(customCSS) => updateAdvanced({ customCSS })}
        />
      </div>
    );
  }

  return null;
}
