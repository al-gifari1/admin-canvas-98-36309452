import { Block, GridContent, GridLayout, ContainerBackground, ContainerBorder, ContainerShadow, ContainerAdvanced, ResponsiveValue } from '@/types/builder';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ResponsiveSlider } from '../controls/ResponsiveSlider';
import { BoxModelControl } from '../controls/BoxModelControl';
import { CustomCSSFields } from '../controls/CustomCSSFields';
import { Button } from '@/components/ui/button';
import { 
  AlignHorizontalJustifyStart,
  AlignHorizontalJustifyCenter,
  AlignHorizontalJustifyEnd,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  StretchHorizontal,
} from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface GridPropertiesProps {
  content: Block['content'];
  onUpdate: (content: Block['content']) => void;
  tab: 'content' | 'style' | 'advanced';
}

const DEFAULT_GRID: GridContent = {
  layout: {
    columns: { desktop: 3, tablet: 2, mobile: 1 },
    columnGap: { desktop: 20, tablet: 16, mobile: 12 },
    rowGap: { desktop: 20, tablet: 16, mobile: 12 },
    autoFlow: 'row',
    justifyItems: 'stretch',
    alignItems: 'stretch',
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

// Helper to migrate old grid format
function migrateGrid(oldGrid: any): GridContent {
  if (oldGrid?.layout) {
    return oldGrid as GridContent;
  }
  // Old format: { columns: 2 | 3 | 4, gap: number }
  return {
    ...DEFAULT_GRID,
    layout: {
      ...DEFAULT_GRID.layout,
      columns: { desktop: oldGrid?.columns || 3, tablet: 2, mobile: 1 },
      columnGap: { desktop: oldGrid?.gap || 16, tablet: oldGrid?.gap || 16, mobile: 12 },
      rowGap: { desktop: oldGrid?.gap || 16, tablet: oldGrid?.gap || 16, mobile: 12 },
    },
  };
}

export function GridProperties({ content, onUpdate, tab }: GridPropertiesProps) {
  const grid = content.grid ? migrateGrid(content.grid) : DEFAULT_GRID;

  const updateGrid = (updates: Partial<GridContent>) => {
    onUpdate({
      ...content,
      grid: { ...grid, ...updates },
    });
  };

  const updateLayout = (updates: Partial<GridLayout>) => {
    updateGrid({
      layout: { ...grid.layout, ...updates },
    });
  };

  const updateBackground = (updates: Partial<ContainerBackground>) => {
    updateGrid({
      background: { ...grid.background, ...updates },
    });
  };

  const updateBorder = (updates: Partial<ContainerBorder>) => {
    updateGrid({
      border: { ...grid.border, ...updates },
    });
  };

  const updateShadow = (updates: Partial<ContainerShadow>) => {
    updateGrid({
      shadow: { ...grid.shadow, ...updates },
    });
  };

  const updateAdvanced = (updates: Partial<ContainerAdvanced>) => {
    updateGrid({
      advanced: { ...grid.advanced, ...updates },
    });
  };

  // Content/Layout Tab
  if (tab === 'content') {
    return (
      <div className="space-y-6">
        {/* Visual Grid Preview */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Grid Preview</Label>
          <div 
            className="rounded-lg border border-dashed border-border p-2 bg-muted/30"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${grid.layout.columns.desktop}, 1fr)`,
              gap: '4px',
            }}
          >
            {Array.from({ length: grid.layout.columns.desktop }).map((_, i) => (
              <div 
                key={i} 
                className="h-6 rounded bg-primary/20 border border-primary/30"
              />
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground text-center">
            {grid.layout.columns.desktop} columns on desktop
          </p>
        </div>

        {/* Columns */}
        <ResponsiveSlider
          label="Columns"
          value={grid.layout.columns}
          onChange={(columns) => updateLayout({ columns })}
          min={1}
          max={12}
          step={1}
          showUnit={false}
        />

        {/* Column Gap */}
        <ResponsiveSlider
          label="Column Gap"
          value={grid.layout.columnGap}
          onChange={(columnGap) => updateLayout({ columnGap })}
          min={0}
          max={64}
          step={4}
          unit="px"
        />

        {/* Row Gap */}
        <ResponsiveSlider
          label="Row Gap"
          value={grid.layout.rowGap}
          onChange={(rowGap) => updateLayout({ rowGap })}
          min={0}
          max={64}
          step={4}
          unit="px"
        />

        {/* Auto Flow */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Auto Flow</Label>
          <Select
            value={grid.layout.autoFlow}
            onValueChange={(v) => updateLayout({ autoFlow: v as GridLayout['autoFlow'] })}
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

        {/* Justify Items */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Justify Items (Horizontal)</Label>
          <TooltipProvider>
            <ToggleGroup
              type="single"
              value={grid.layout.justifyItems}
              onValueChange={(v) => v && updateLayout({ justifyItems: v as GridLayout['justifyItems'] })}
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
                  <ToggleGroupItem value="stretch" className="h-8 w-8 p-0">
                    <StretchHorizontal className="h-4 w-4" />
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent>Stretch</TooltipContent>
              </Tooltip>
            </ToggleGroup>
          </TooltipProvider>
        </div>

        {/* Align Items */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Align Items (Vertical)</Label>
          <TooltipProvider>
            <ToggleGroup
              type="single"
              value={grid.layout.alignItems}
              onValueChange={(v) => v && updateLayout({ alignItems: v as GridLayout['alignItems'] })}
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
            value={grid.background.type}
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

          {grid.background.type === 'solid' && (
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={grid.background.color === 'transparent' ? '#ffffff' : grid.background.color || '#ffffff'}
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
            value={grid.border.style}
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

          {grid.border.style !== 'none' && (
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={grid.border.color || '#e5e7eb'}
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
              checked={grid.shadow.enabled}
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
          value={grid.advanced.padding}
          onChange={(padding) => updateAdvanced({ padding })}
        />

        {/* Margin */}
        <BoxModelControl
          label="Margin"
          value={grid.advanced.margin}
          onChange={(margin) => updateAdvanced({ margin })}
        />

        {/* Max Width */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Max Width</Label>
          <Select
            value={grid.advanced.maxWidth}
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
                checked={grid.advanced.responsive.hideOnDesktop}
                onCheckedChange={(v) => updateAdvanced({
                  responsive: { ...grid.advanced.responsive, hideOnDesktop: v },
                })}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs">Hide on Tablet</span>
              <Switch
                checked={grid.advanced.responsive.hideOnTablet}
                onCheckedChange={(v) => updateAdvanced({
                  responsive: { ...grid.advanced.responsive, hideOnTablet: v },
                })}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs">Hide on Mobile</span>
              <Switch
                checked={grid.advanced.responsive.hideOnMobile}
                onCheckedChange={(v) => updateAdvanced({
                  responsive: { ...grid.advanced.responsive, hideOnMobile: v },
                })}
              />
            </div>
          </div>
        </div>

        {/* Custom CSS */}
        <CustomCSSFields
          cssId={grid.advanced.cssId}
          cssClasses={grid.advanced.cssClasses}
          customCSS={grid.advanced.customCSS}
          onCssIdChange={(cssId) => updateAdvanced({ cssId })}
          onCssClassesChange={(cssClasses) => updateAdvanced({ cssClasses })}
          onCustomCSSChange={(customCSS) => updateAdvanced({ customCSS })}
        />
      </div>
    );
  }

  return null;
}
