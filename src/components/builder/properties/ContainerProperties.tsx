import { useState } from 'react';
import { Block, ContainerContent, ContainerLayout, ContainerBackground, ContainerBorder, ContainerShadow, ContainerAdvanced, ResponsiveValue } from '@/types/builder';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { ResponsiveSlider } from '../controls/ResponsiveSlider';
import { BoxModelControl } from '../controls/BoxModelControl';
import { Button } from '@/components/ui/button';
import { 
  Grid3X3, 
  AlignHorizontalJustifyStart, 
  AlignHorizontalJustifyCenter, 
  AlignHorizontalJustifyEnd, 
  AlignVerticalJustifyStart, 
  AlignVerticalJustifyCenter, 
  AlignVerticalJustifyEnd,
  Maximize2,
} from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface ContainerPropertiesProps {
  content: Block['content'];
  onUpdate: (content: Block['content']) => void;
  tab: 'content' | 'style' | 'advanced';
}

const DEFAULT_CONTAINER: ContainerContent = {
  layout: {
    displayType: 'grid',
    columns: { desktop: 4, tablet: 2, mobile: 1 },
    rows: 'auto',
    columnGap: { desktop: 20, tablet: 16, mobile: 12 },
    rowGap: { desktop: 20, tablet: 16, mobile: 12 },
    justifyItems: 'stretch',
    alignItems: 'stretch',
    justifyContent: 'start',
    alignContent: 'start',
    autoFlow: 'row',
    columnWidth: { type: 'fr', value: 1 },
    rowHeight: { type: 'auto' },
    gapPreset: 'medium',
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
    width: { type: 'auto' },
    height: { type: 'auto' },
    overflow: 'visible',
    position: 'default',
  },
};

// Helper to check if content is legacy format
function isLegacyContainer(container: any): boolean {
  return container && 'backgroundColor' in container && !('layout' in container);
}

// Migrate legacy format to new format
function migrateContainer(container: any): ContainerContent {
  if (isLegacyContainer(container)) {
    return {
      ...DEFAULT_CONTAINER,
      background: {
        ...DEFAULT_CONTAINER.background,
        color: container.backgroundColor || 'transparent',
      },
      advanced: {
        ...DEFAULT_CONTAINER.advanced,
        padding: { 
          top: container.padding || 16, 
          right: container.padding || 16, 
          bottom: container.padding || 16, 
          left: container.padding || 16, 
          linked: true 
        },
        maxWidth: container.maxWidth || 'lg',
      },
    };
  }
  return { ...DEFAULT_CONTAINER, ...container };
}

// Gap preset values
const GAP_PRESETS = {
  none: 0,
  small: 8,
  medium: 16,
  large: 32,
};

export function ContainerProperties({ content, onUpdate, tab }: ContainerPropertiesProps) {
  const rawContainer = content.container;
  const container = rawContainer ? migrateContainer(rawContainer) : DEFAULT_CONTAINER;

  const updateContainer = (updates: Partial<ContainerContent>) => {
    onUpdate({
      ...content,
      container: { ...container, ...updates },
    });
  };

  const updateLayout = (updates: Partial<ContainerLayout>) => {
    updateContainer({
      layout: { ...container.layout, ...updates },
    });
  };

  const updateBackground = (updates: Partial<ContainerBackground>) => {
    updateContainer({
      background: { ...container.background, ...updates },
    });
  };

  const updateBorder = (updates: Partial<ContainerBorder>) => {
    updateContainer({
      border: { ...container.border, ...updates },
    });
  };

  const updateShadow = (updates: Partial<ContainerShadow>) => {
    updateContainer({
      shadow: { ...container.shadow, ...updates },
    });
  };

  const updateAdvanced = (updates: Partial<ContainerAdvanced>) => {
    updateContainer({
      advanced: { ...container.advanced, ...updates },
    });
  };

  // Apply gap preset
  const applyGapPreset = (preset: 'none' | 'small' | 'medium' | 'large') => {
    const gapValue = GAP_PRESETS[preset];
    updateLayout({
      gapPreset: preset,
      columnGap: { desktop: gapValue, tablet: gapValue, mobile: gapValue },
      rowGap: { desktop: gapValue, tablet: gapValue, mobile: gapValue },
    });
  };

  // Content/Layout Tab
  if (tab === 'content') {
    return (
      <div className="space-y-6">
        {/* Display Type */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Display Type</Label>
          <ToggleGroup
            type="single"
            value={container.layout.displayType}
            onValueChange={(v) => v && updateLayout({ displayType: v as 'flex' | 'grid' })}
            className="justify-start"
          >
            <ToggleGroupItem value="grid" className="gap-1.5 text-xs">
              <Grid3X3 className="h-3.5 w-3.5" />
              Grid
            </ToggleGroupItem>
            <ToggleGroupItem value="flex" className="gap-1.5 text-xs">
              <Maximize2 className="h-3.5 w-3.5" />
              Flex
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Grid-specific controls */}
        {container.layout.displayType === 'grid' && (
          <>
            {/* Columns */}
            <ResponsiveSlider
              label="Columns"
              value={container.layout.columns}
              onChange={(columns) => updateLayout({ columns })}
              min={1}
              max={12}
              step={1}
              showUnit={false}
            />

            {/* Column Width Type */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Column Width</Label>
              <div className="flex gap-2">
                <Select
                  value={container.layout.columnWidth?.type || 'fr'}
                  onValueChange={(v) => updateLayout({ 
                    columnWidth: { 
                      type: v as 'auto' | 'fr' | 'px' | '%', 
                      value: v === 'auto' ? undefined : (container.layout.columnWidth?.value || 1)
                    } 
                  })}
                >
                  <SelectTrigger className="h-8 text-xs flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto</SelectItem>
                    <SelectItem value="fr">Fraction (fr)</SelectItem>
                    <SelectItem value="px">Pixels (px)</SelectItem>
                    <SelectItem value="%">Percentage (%)</SelectItem>
                  </SelectContent>
                </Select>
                {container.layout.columnWidth?.type && container.layout.columnWidth.type !== 'auto' && (
                  <Input
                    type="number"
                    value={container.layout.columnWidth.value || 1}
                    onChange={(e) => updateLayout({ 
                      columnWidth: { 
                        ...container.layout.columnWidth!, 
                        value: Number(e.target.value) 
                      } 
                    })}
                    className="w-20 h-8 text-xs"
                    min={container.layout.columnWidth.type === 'fr' ? 1 : 0}
                  />
                )}
              </div>
            </div>

            {/* Rows */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Rows</Label>
              <Select
                value={container.layout.rows === 'auto' ? 'auto' : 'custom'}
                onValueChange={(v) => updateLayout({ rows: v === 'auto' ? 'auto' : 2 })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              {container.layout.rows !== 'auto' && (
                <Input
                  type="number"
                  value={container.layout.rows}
                  onChange={(e) => updateLayout({ rows: Number(e.target.value) })}
                  min={1}
                  max={12}
                  className="h-8 text-xs"
                />
              )}
            </div>

            {/* Row Height */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Row Height</Label>
              <Select
                value={container.layout.rowHeight?.type || 'auto'}
                onValueChange={(v) => updateLayout({ 
                  rowHeight: { 
                    type: v as 'auto' | 'minmax' | 'custom', 
                    value: v === 'auto' ? undefined : (container.layout.rowHeight?.value || 100),
                    minValue: v === 'minmax' ? 50 : undefined
                  } 
                })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto</SelectItem>
                  <SelectItem value="minmax">MinMax</SelectItem>
                  <SelectItem value="custom">Custom (px)</SelectItem>
                </SelectContent>
              </Select>
              {container.layout.rowHeight?.type === 'custom' && (
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    value={container.layout.rowHeight.value || 100}
                    onChange={(e) => updateLayout({ 
                      rowHeight: { ...container.layout.rowHeight!, value: Number(e.target.value) } 
                    })}
                    className="h-8 text-xs"
                    min={0}
                  />
                  <span className="text-xs text-muted-foreground">px</span>
                </div>
              )}
              {container.layout.rowHeight?.type === 'minmax' && (
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    value={container.layout.rowHeight.minValue || 50}
                    onChange={(e) => updateLayout({ 
                      rowHeight: { ...container.layout.rowHeight!, minValue: Number(e.target.value) } 
                    })}
                    className="h-8 text-xs w-20"
                    placeholder="Min"
                    min={0}
                  />
                  <span className="text-xs text-muted-foreground">-</span>
                  <Input
                    type="number"
                    value={container.layout.rowHeight.value || 200}
                    onChange={(e) => updateLayout({ 
                      rowHeight: { ...container.layout.rowHeight!, value: Number(e.target.value) } 
                    })}
                    className="h-8 text-xs w-20"
                    placeholder="Max"
                    min={0}
                  />
                  <span className="text-xs text-muted-foreground">px</span>
                </div>
              )}
            </div>

            {/* Auto Flow */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Auto Flow</Label>
              <Select
                value={container.layout.autoFlow || 'row'}
                onValueChange={(v) => updateLayout({ autoFlow: v as ContainerLayout['autoFlow'] })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="row">Row</SelectItem>
                  <SelectItem value="column">Column</SelectItem>
                  <SelectItem value="dense">Dense</SelectItem>
                  <SelectItem value="row-dense">Row Dense</SelectItem>
                  <SelectItem value="column-dense">Column Dense</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {/* Gap Presets */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Gap Preset</Label>
          <div className="flex gap-1">
            {(['none', 'small', 'medium', 'large'] as const).map((preset) => (
              <Button
                key={preset}
                variant={container.layout.gapPreset === preset ? 'default' : 'outline'}
                size="sm"
                className="flex-1 h-7 text-xs capitalize"
                onClick={() => applyGapPreset(preset)}
              >
                {preset}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Gaps */}
        <div className="space-y-4">
          <ResponsiveSlider
            label="Column Gap"
            value={container.layout.columnGap}
            onChange={(columnGap) => updateLayout({ columnGap, gapPreset: undefined })}
            min={0}
            max={100}
            step={1}
            unit="px"
            showUnit={false}
          />
          <ResponsiveSlider
            label="Row Gap"
            value={container.layout.rowGap}
            onChange={(rowGap) => updateLayout({ rowGap, gapPreset: undefined })}
            min={0}
            max={100}
            step={1}
            unit="px"
            showUnit={false}
          />
        </div>

        {/* Alignment */}
        <div className="space-y-4 pt-2 border-t border-border">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Alignment</Label>
          
          <div className="space-y-2">
            <Label className="text-xs">Justify Items</Label>
            <ToggleGroup
              type="single"
              value={container.layout.justifyItems}
              onValueChange={(v) => v && updateLayout({ justifyItems: v as ContainerLayout['justifyItems'] })}
              className="justify-start"
            >
              <ToggleGroupItem value="start" className="h-7 w-7 p-0">
                <AlignHorizontalJustifyStart className="h-3.5 w-3.5" />
              </ToggleGroupItem>
              <ToggleGroupItem value="center" className="h-7 w-7 p-0">
                <AlignHorizontalJustifyCenter className="h-3.5 w-3.5" />
              </ToggleGroupItem>
              <ToggleGroupItem value="end" className="h-7 w-7 p-0">
                <AlignHorizontalJustifyEnd className="h-3.5 w-3.5" />
              </ToggleGroupItem>
              <ToggleGroupItem value="stretch" className="text-xs px-2">
                Stretch
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Align Items</Label>
            <ToggleGroup
              type="single"
              value={container.layout.alignItems}
              onValueChange={(v) => v && updateLayout({ alignItems: v as ContainerLayout['alignItems'] })}
              className="justify-start"
            >
              <ToggleGroupItem value="start" className="h-7 w-7 p-0">
                <AlignVerticalJustifyStart className="h-3.5 w-3.5" />
              </ToggleGroupItem>
              <ToggleGroupItem value="center" className="h-7 w-7 p-0">
                <AlignVerticalJustifyCenter className="h-3.5 w-3.5" />
              </ToggleGroupItem>
              <ToggleGroupItem value="end" className="h-7 w-7 p-0">
                <AlignVerticalJustifyEnd className="h-3.5 w-3.5" />
              </ToggleGroupItem>
              <ToggleGroupItem value="stretch" className="text-xs px-2">
                Stretch
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Justify Content</Label>
            <Select
              value={container.layout.justifyContent}
              onValueChange={(v) => updateLayout({ justifyContent: v as ContainerLayout['justifyContent'] })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="start">Start</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="end">End</SelectItem>
                <SelectItem value="between">Space Between</SelectItem>
                <SelectItem value="around">Space Around</SelectItem>
                <SelectItem value="evenly">Space Evenly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Align Content</Label>
            <Select
              value={container.layout.alignContent}
              onValueChange={(v) => updateLayout({ alignContent: v as ContainerLayout['alignContent'] })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="start">Start</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="end">End</SelectItem>
                <SelectItem value="stretch">Stretch</SelectItem>
                <SelectItem value="between">Space Between</SelectItem>
                <SelectItem value="around">Space Around</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    );
  }

  // Style Tab
  if (tab === 'style') {
    return (
      <div className="space-y-6">
        {/* Background */}
        <div className="space-y-4">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Background</Label>
          
          <div className="space-y-2">
            <Label className="text-xs">Type</Label>
            <Select
              value={container.background.type}
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
          </div>

          {container.background.type === 'solid' && (
            <div className="space-y-2">
              <Label className="text-xs">Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={container.background.color === 'transparent' ? '#ffffff' : container.background.color || '#ffffff'}
                  onChange={(e) => updateBackground({ color: e.target.value })}
                  className="w-12 h-8 p-1 cursor-pointer"
                />
                <Input
                  value={container.background.color || 'transparent'}
                  onChange={(e) => updateBackground({ color: e.target.value })}
                  placeholder="transparent"
                  className="flex-1 h-8 text-xs"
                />
              </div>
            </div>
          )}

          {container.background.type === 'gradient' && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs">Gradient Angle</Label>
                <Slider
                  value={[container.background.gradient?.angle || 90]}
                  onValueChange={([v]) => updateBackground({
                    gradient: {
                      ...container.background.gradient,
                      type: 'linear',
                      angle: v,
                      stops: container.background.gradient?.stops || [
                        { color: '#3b82f6', position: 0 },
                        { color: '#8b5cf6', position: 100 }
                      ]
                    }
                  })}
                  min={0}
                  max={360}
                  step={1}
                />
                <span className="text-xs text-muted-foreground">{container.background.gradient?.angle || 90}°</span>
              </div>
            </div>
          )}

          {container.background.type === 'image' && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs">Image URL</Label>
                <Input
                  value={container.background.image?.url || ''}
                  onChange={(e) => updateBackground({
                    image: {
                      ...container.background.image,
                      url: e.target.value,
                      size: container.background.image?.size || 'cover',
                      position: container.background.image?.position || 'center'
                    }
                  })}
                  placeholder="https://..."
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Size</Label>
                <Select
                  value={container.background.image?.size || 'cover'}
                  onValueChange={(v) => updateBackground({
                    image: {
                      ...container.background.image!,
                      size: v as 'cover' | 'contain' | 'repeat'
                    }
                  })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cover">Cover</SelectItem>
                    <SelectItem value="contain">Contain</SelectItem>
                    <SelectItem value="repeat">Repeat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        {/* Border */}
        <div className="space-y-4 pt-4 border-t border-border">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Border</Label>
          
          <div className="space-y-2">
            <Label className="text-xs">Style</Label>
            <Select
              value={container.border.style}
              onValueChange={(v) => updateBorder({ style: v as ContainerBorder['style'] })}
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
          </div>

          {container.border.style !== 'none' && (
            <>
              <BoxModelControl
                label="Border Width"
                value={container.border.width}
                onChange={(width) => updateBorder({ width })}
              />
              <div className="space-y-2">
                <Label className="text-xs">Border Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={container.border.color}
                    onChange={(e) => updateBorder({ color: e.target.value })}
                    className="w-12 h-8 p-1 cursor-pointer"
                  />
                  <Input
                    value={container.border.color}
                    onChange={(e) => updateBorder({ color: e.target.value })}
                    className="flex-1 h-8 text-xs"
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label className="text-xs">Border Radius</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Top Left</Label>
                <Input
                  type="number"
                  value={container.border.radius.topLeft}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    updateBorder({
                      radius: container.border.radius.linked
                        ? { ...container.border.radius, topLeft: val, topRight: val, bottomRight: val, bottomLeft: val }
                        : { ...container.border.radius, topLeft: val }
                    });
                  }}
                  className="h-7 text-xs"
                  min={0}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Top Right</Label>
                <Input
                  type="number"
                  value={container.border.radius.topRight}
                  onChange={(e) => updateBorder({ radius: { ...container.border.radius, topRight: Number(e.target.value) } })}
                  className="h-7 text-xs"
                  min={0}
                  disabled={container.border.radius.linked}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Bottom Left</Label>
                <Input
                  type="number"
                  value={container.border.radius.bottomLeft}
                  onChange={(e) => updateBorder({ radius: { ...container.border.radius, bottomLeft: Number(e.target.value) } })}
                  className="h-7 text-xs"
                  min={0}
                  disabled={container.border.radius.linked}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Bottom Right</Label>
                <Input
                  type="number"
                  value={container.border.radius.bottomRight}
                  onChange={(e) => updateBorder({ radius: { ...container.border.radius, bottomRight: Number(e.target.value) } })}
                  className="h-7 text-xs"
                  min={0}
                  disabled={container.border.radius.linked}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Switch
                checked={container.border.radius.linked}
                onCheckedChange={(linked) => updateBorder({
                  radius: linked
                    ? { ...container.border.radius, linked, topRight: container.border.radius.topLeft, bottomRight: container.border.radius.topLeft, bottomLeft: container.border.radius.topLeft }
                    : { ...container.border.radius, linked }
                })}
              />
              <Label className="text-xs text-muted-foreground">Link values</Label>
            </div>
          </div>
        </div>

        {/* Shadow */}
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Box Shadow</Label>
            <Switch
              checked={container.shadow.enabled}
              onCheckedChange={(enabled) => updateShadow({ enabled })}
            />
          </div>

          {container.shadow.enabled && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Horizontal</Label>
                  <Input
                    type="number"
                    value={container.shadow.horizontal}
                    onChange={(e) => updateShadow({ horizontal: Number(e.target.value) })}
                    className="h-7 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Vertical</Label>
                  <Input
                    type="number"
                    value={container.shadow.vertical}
                    onChange={(e) => updateShadow({ vertical: Number(e.target.value) })}
                    className="h-7 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Blur</Label>
                  <Input
                    type="number"
                    value={container.shadow.blur}
                    onChange={(e) => updateShadow({ blur: Number(e.target.value) })}
                    className="h-7 text-xs"
                    min={0}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Spread</Label>
                  <Input
                    type="number"
                    value={container.shadow.spread}
                    onChange={(e) => updateShadow({ spread: Number(e.target.value) })}
                    className="h-7 text-xs"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Color</Label>
                <Input
                  value={container.shadow.color}
                  onChange={(e) => updateShadow({ color: e.target.value })}
                  placeholder="rgba(0,0,0,0.1)"
                  className="h-7 text-xs"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Advanced Tab
  if (tab === 'advanced') {
    return (
      <div className="space-y-6">
        {/* Spacing */}
        <div className="space-y-4">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Spacing</Label>
          <BoxModelControl
            label="Margin"
            value={container.advanced.margin}
            onChange={(margin) => updateAdvanced({ margin })}
          />
          <BoxModelControl
            label="Padding"
            value={container.advanced.padding}
            onChange={(padding) => updateAdvanced({ padding })}
          />
        </div>

        {/* Size */}
        <div className="space-y-4 pt-4 border-t border-border">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Size</Label>
          
          {/* Width */}
          <div className="space-y-2">
            <Label className="text-xs">Width</Label>
            <div className="flex gap-2">
              <Select
                value={container.advanced.width?.type || 'auto'}
                onValueChange={(v) => updateAdvanced({ 
                  width: { 
                    type: v as 'auto' | 'full' | 'custom', 
                    value: v === 'custom' ? (container.advanced.width?.value || 100) : undefined,
                    unit: container.advanced.width?.unit || '%'
                  } 
                })}
              >
                <SelectTrigger className="h-8 text-xs flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto</SelectItem>
                  <SelectItem value="full">Full (100%)</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              {container.advanced.width?.type === 'custom' && (
                <>
                  <Input
                    type="number"
                    value={container.advanced.width.value || 100}
                    onChange={(e) => updateAdvanced({ 
                      width: { ...container.advanced.width!, value: Number(e.target.value) } 
                    })}
                    className="w-20 h-8 text-xs"
                    min={0}
                  />
                  <Select
                    value={container.advanced.width.unit || '%'}
                    onValueChange={(v) => updateAdvanced({ 
                      width: { ...container.advanced.width!, unit: v as 'px' | '%' | 'vw' } 
                    })}
                  >
                    <SelectTrigger className="w-16 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="px">px</SelectItem>
                      <SelectItem value="%">%</SelectItem>
                      <SelectItem value="vw">vw</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>
          </div>

          {/* Height */}
          <div className="space-y-2">
            <Label className="text-xs">Height</Label>
            <div className="flex gap-2">
              <Select
                value={container.advanced.height?.type || 'auto'}
                onValueChange={(v) => updateAdvanced({ 
                  height: { 
                    type: v as 'auto' | 'custom', 
                    value: v === 'custom' ? (container.advanced.height?.value || 300) : undefined,
                    unit: container.advanced.height?.unit || 'px'
                  } 
                })}
              >
                <SelectTrigger className="h-8 text-xs flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              {container.advanced.height?.type === 'custom' && (
                <>
                  <Input
                    type="number"
                    value={container.advanced.height.value || 300}
                    onChange={(e) => updateAdvanced({ 
                      height: { ...container.advanced.height!, value: Number(e.target.value) } 
                    })}
                    className="w-20 h-8 text-xs"
                    min={0}
                  />
                  <Select
                    value={container.advanced.height.unit || 'px'}
                    onValueChange={(v) => updateAdvanced({ 
                      height: { ...container.advanced.height!, unit: v as 'px' | 'vh' } 
                    })}
                  >
                    <SelectTrigger className="w-16 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="px">px</SelectItem>
                      <SelectItem value="vh">vh</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>
          </div>

          {/* Min Height */}
          <ResponsiveSlider
            label="Min Height"
            value={container.advanced.minHeight || { desktop: 0 }}
            onChange={(minHeight) => updateAdvanced({ minHeight })}
            min={0}
            max={800}
            step={10}
            unit="px"
            showUnit={false}
          />

          {/* Max Width */}
          <div className="space-y-2">
            <Label className="text-xs">Max Width</Label>
            <Select
              value={container.advanced.maxWidth}
              onValueChange={(v) => updateAdvanced({ maxWidth: v as ContainerAdvanced['maxWidth'] })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full Width</SelectItem>
                <SelectItem value="lg">Large (1152px)</SelectItem>
                <SelectItem value="md">Medium (896px)</SelectItem>
                <SelectItem value="sm">Small (672px)</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            {container.advanced.maxWidth === 'custom' && (
              <Input
                type="number"
                value={container.advanced.customMaxWidth || 1200}
                onChange={(e) => updateAdvanced({ customMaxWidth: Number(e.target.value) })}
                className="h-8 text-xs"
                min={0}
              />
            )}
          </div>

          {/* Overflow */}
          <div className="space-y-2">
            <Label className="text-xs">Overflow</Label>
            <Select
              value={container.advanced.overflow || 'visible'}
              onValueChange={(v) => updateAdvanced({ overflow: v as ContainerAdvanced['overflow'] })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="visible">Visible</SelectItem>
                <SelectItem value="hidden">Hidden</SelectItem>
                <SelectItem value="scroll">Scroll</SelectItem>
                <SelectItem value="auto">Auto</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Position */}
        <div className="space-y-4 pt-4 border-t border-border">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Position</Label>
          
          <div className="space-y-2">
            <Label className="text-xs">Position Type</Label>
            <Select
              value={container.advanced.position || 'default'}
              onValueChange={(v) => updateAdvanced({ position: v as ContainerAdvanced['position'] })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default (Static)</SelectItem>
                <SelectItem value="relative">Relative</SelectItem>
                <SelectItem value="absolute">Absolute</SelectItem>
                <SelectItem value="fixed">Fixed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {container.advanced.position && container.advanced.position !== 'default' && (
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Top</Label>
                <Input
                  type="number"
                  value={container.advanced.positionOffsets?.top || ''}
                  onChange={(e) => updateAdvanced({ 
                    positionOffsets: { 
                      ...container.advanced.positionOffsets, 
                      top: e.target.value ? Number(e.target.value) : undefined 
                    } 
                  })}
                  placeholder="auto"
                  className="h-7 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Right</Label>
                <Input
                  type="number"
                  value={container.advanced.positionOffsets?.right || ''}
                  onChange={(e) => updateAdvanced({ 
                    positionOffsets: { 
                      ...container.advanced.positionOffsets, 
                      right: e.target.value ? Number(e.target.value) : undefined 
                    } 
                  })}
                  placeholder="auto"
                  className="h-7 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Bottom</Label>
                <Input
                  type="number"
                  value={container.advanced.positionOffsets?.bottom || ''}
                  onChange={(e) => updateAdvanced({ 
                    positionOffsets: { 
                      ...container.advanced.positionOffsets, 
                      bottom: e.target.value ? Number(e.target.value) : undefined 
                    } 
                  })}
                  placeholder="auto"
                  className="h-7 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Left</Label>
                <Input
                  type="number"
                  value={container.advanced.positionOffsets?.left || ''}
                  onChange={(e) => updateAdvanced({ 
                    positionOffsets: { 
                      ...container.advanced.positionOffsets, 
                      left: e.target.value ? Number(e.target.value) : undefined 
                    } 
                  })}
                  placeholder="auto"
                  className="h-7 text-xs"
                />
              </div>
            </div>
          )}

          {/* Z-Index */}
          <div className="space-y-2">
            <Label className="text-xs">Z-Index</Label>
            <Input
              type="number"
              value={container.advanced.zIndex || ''}
              onChange={(e) => updateAdvanced({ zIndex: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="auto"
              className="h-8 text-xs"
            />
          </div>
        </div>

        {/* Custom CSS */}
        <div className="space-y-4 pt-4 border-t border-border">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Custom CSS</Label>
          
          <div className="space-y-2">
            <Label className="text-xs">CSS ID</Label>
            <Input
              value={container.advanced.cssId || ''}
              onChange={(e) => updateAdvanced({ cssId: e.target.value })}
              placeholder="my-container"
              className="h-8 text-xs"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">CSS Classes</Label>
            <Input
              value={container.advanced.cssClasses || ''}
              onChange={(e) => updateAdvanced({ cssClasses: e.target.value })}
              placeholder="class1 class2"
              className="h-8 text-xs"
            />
          </div>
        </div>

        {/* Responsive Visibility */}
        <div className="space-y-4 pt-4 border-t border-border">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Responsive Visibility</Label>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Hide on Desktop</Label>
              <Switch
                checked={container.advanced.responsive.hideOnDesktop}
                onCheckedChange={(hideOnDesktop) => updateAdvanced({
                  responsive: { ...container.advanced.responsive, hideOnDesktop }
                })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">Hide on Tablet</Label>
              <Switch
                checked={container.advanced.responsive.hideOnTablet}
                onCheckedChange={(hideOnTablet) => updateAdvanced({
                  responsive: { ...container.advanced.responsive, hideOnTablet }
                })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">Hide on Mobile</Label>
              <Switch
                checked={container.advanced.responsive.hideOnMobile}
                onCheckedChange={(hideOnMobile) => updateAdvanced({
                  responsive: { ...container.advanced.responsive, hideOnMobile }
                })}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
