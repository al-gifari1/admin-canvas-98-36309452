import { useState, useRef } from 'react';
import { Block, GridContent, GridLayout, ContainerBackground, ContainerBorder, ContainerShadow, ContainerAdvanced, ResponsiveValue } from '@/types/builder';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
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
  Upload,
  Loader2,
} from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

// Image Background Control with Upload
interface ImageBackgroundControlProps {
  image?: { url?: string; size?: 'cover' | 'contain' | 'repeat'; position?: string };
  onUpdate: (image: { url?: string; size?: 'cover' | 'contain' | 'repeat'; position?: string }) => void;
}

function ImageBackgroundControl({ image, onUpdate }: ImageBackgroundControlProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please login to upload images');
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('builder-assets')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('builder-assets')
        .getPublicUrl(fileName);

      onUpdate({
        ...image,
        url: publicUrl,
        size: image?.size || 'cover',
        position: image?.position || 'center',
      });

      toast.success('Image uploaded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-3">
      {image?.url && (
        <div className="relative rounded-md overflow-hidden border border-border">
          <img 
            src={image.url} 
            alt="Background preview" 
            className="w-full h-24 object-cover"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-xs">Image URL</Label>
        <div className="flex gap-2">
          <Input
            value={image?.url || ''}
            onChange={(e) => onUpdate({
              ...image,
              url: e.target.value,
              size: image?.size || 'cover',
              position: image?.position || 'center',
            })}
            placeholder="https://..."
            className="h-8 text-xs flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 px-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Size</Label>
        <Select
          value={image?.size || 'cover'}
          onValueChange={(v) => onUpdate({
            ...image,
            url: image?.url,
            size: v as 'cover' | 'contain' | 'repeat',
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

      <div className="space-y-2">
        <Label className="text-xs">Position</Label>
        <Select
          value={image?.position || 'center'}
          onValueChange={(v) => onUpdate({
            ...image,
            url: image?.url,
            size: image?.size || 'cover',
            position: v,
          })}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="top">Top</SelectItem>
            <SelectItem value="bottom">Bottom</SelectItem>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="right">Right</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// Grid Style Tab Component
interface GridStyleTabProps {
  grid: GridContent;
  updateBackground: (updates: Partial<ContainerBackground>) => void;
  updateBorder: (updates: Partial<ContainerBorder>) => void;
  updateShadow: (updates: Partial<ContainerShadow>) => void;
}

function GridStyleTab({ grid, updateBackground, updateBorder, updateShadow }: GridStyleTabProps) {
  return (
    <div className="space-y-6">
      {/* Background */}
      <div className="space-y-4">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Background</Label>
        
        <div className="space-y-2">
          <Label className="text-xs">Type</Label>
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
        </div>

        {grid.background.type === 'solid' && (
          <div className="space-y-2">
            <Label className="text-xs">Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={grid.background.color === 'transparent' ? '#ffffff' : grid.background.color || '#ffffff'}
                onChange={(e) => updateBackground({ color: e.target.value })}
                className="w-12 h-8 p-1 cursor-pointer"
              />
              <Input
                value={grid.background.color || 'transparent'}
                onChange={(e) => updateBackground({ color: e.target.value })}
                placeholder="transparent"
                className="flex-1 h-8 text-xs"
              />
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => updateBackground({ color: 'transparent' })}
              >
                Clear
              </Button>
            </div>
          </div>
        )}

        {grid.background.type === 'gradient' && (
          <div className="space-y-3">
            {/* Start Color */}
            <div className="space-y-2">
              <Label className="text-xs">Start Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={grid.background.gradient?.stops?.[0]?.color || '#3b82f6'}
                  onChange={(e) => {
                    const stops = grid.background.gradient?.stops || [
                      { color: '#3b82f6', position: 0 },
                      { color: '#8b5cf6', position: 100 }
                    ];
                    updateBackground({
                      gradient: {
                        ...grid.background.gradient,
                        type: 'linear',
                        angle: grid.background.gradient?.angle || 90,
                        stops: [{ ...stops[0], color: e.target.value }, stops[1]]
                      }
                    });
                  }}
                  className="w-12 h-8 p-1 cursor-pointer"
                />
                <Input
                  value={grid.background.gradient?.stops?.[0]?.color || '#3b82f6'}
                  onChange={(e) => {
                    const stops = grid.background.gradient?.stops || [
                      { color: '#3b82f6', position: 0 },
                      { color: '#8b5cf6', position: 100 }
                    ];
                    updateBackground({
                      gradient: {
                        ...grid.background.gradient,
                        type: 'linear',
                        angle: grid.background.gradient?.angle || 90,
                        stops: [{ ...stops[0], color: e.target.value }, stops[1]]
                      }
                    });
                  }}
                  className="flex-1 h-8 text-xs"
                />
              </div>
            </div>

            {/* End Color */}
            <div className="space-y-2">
              <Label className="text-xs">End Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={grid.background.gradient?.stops?.[1]?.color || '#8b5cf6'}
                  onChange={(e) => {
                    const stops = grid.background.gradient?.stops || [
                      { color: '#3b82f6', position: 0 },
                      { color: '#8b5cf6', position: 100 }
                    ];
                    updateBackground({
                      gradient: {
                        ...grid.background.gradient,
                        type: 'linear',
                        angle: grid.background.gradient?.angle || 90,
                        stops: [stops[0], { ...stops[1], color: e.target.value }]
                      }
                    });
                  }}
                  className="w-12 h-8 p-1 cursor-pointer"
                />
                <Input
                  value={grid.background.gradient?.stops?.[1]?.color || '#8b5cf6'}
                  onChange={(e) => {
                    const stops = grid.background.gradient?.stops || [
                      { color: '#3b82f6', position: 0 },
                      { color: '#8b5cf6', position: 100 }
                    ];
                    updateBackground({
                      gradient: {
                        ...grid.background.gradient,
                        type: 'linear',
                        angle: grid.background.gradient?.angle || 90,
                        stops: [stops[0], { ...stops[1], color: e.target.value }]
                      }
                    });
                  }}
                  className="flex-1 h-8 text-xs"
                />
              </div>
            </div>

            {/* Gradient Angle */}
            <div className="space-y-2">
              <Label className="text-xs">Gradient Angle</Label>
              <div className="flex gap-2 items-center">
                <Slider
                  value={[grid.background.gradient?.angle || 90]}
                  onValueChange={([v]) => updateBackground({
                    gradient: {
                      ...grid.background.gradient,
                      type: 'linear',
                      angle: v,
                      stops: grid.background.gradient?.stops || [
                        { color: '#3b82f6', position: 0 },
                        { color: '#8b5cf6', position: 100 }
                      ]
                    }
                  })}
                  min={0}
                  max={360}
                  step={1}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-8">{grid.background.gradient?.angle || 90}°</span>
              </div>
            </div>
          </div>
        )}

        {grid.background.type === 'image' && (
          <ImageBackgroundControl 
            image={grid.background.image}
            onUpdate={(image) => updateBackground({ 
              image: {
                url: image.url || '',
                size: image.size || 'cover',
                position: image.position || 'center',
              }
            })}
          />
        )}
      </div>

      {/* Border */}
      <div className="space-y-4 pt-4 border-t border-border">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Border</Label>
        
        <div className="space-y-2">
          <Label className="text-xs">Style</Label>
          <Select
            value={grid.border.style}
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

        {grid.border.style !== 'none' && (
          <>
            <BoxModelControl
              label="Border Width"
              value={grid.border.width}
              onChange={(width) => updateBorder({ width })}
            />
            <div className="space-y-2">
              <Label className="text-xs">Border Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={grid.border.color}
                  onChange={(e) => updateBorder({ color: e.target.value })}
                  className="w-12 h-8 p-1 cursor-pointer"
                />
                <Input
                  value={grid.border.color}
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
                value={grid.border.radius.topLeft}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  updateBorder({
                    radius: grid.border.radius.linked
                      ? { ...grid.border.radius, topLeft: val, topRight: val, bottomRight: val, bottomLeft: val }
                      : { ...grid.border.radius, topLeft: val }
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
                value={grid.border.radius.topRight}
                onChange={(e) => updateBorder({ radius: { ...grid.border.radius, topRight: Number(e.target.value) } })}
                className="h-7 text-xs"
                min={0}
                disabled={grid.border.radius.linked}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Bottom Left</Label>
              <Input
                type="number"
                value={grid.border.radius.bottomLeft}
                onChange={(e) => updateBorder({ radius: { ...grid.border.radius, bottomLeft: Number(e.target.value) } })}
                className="h-7 text-xs"
                min={0}
                disabled={grid.border.radius.linked}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Bottom Right</Label>
              <Input
                type="number"
                value={grid.border.radius.bottomRight}
                onChange={(e) => updateBorder({ radius: { ...grid.border.radius, bottomRight: Number(e.target.value) } })}
                className="h-7 text-xs"
                min={0}
                disabled={grid.border.radius.linked}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Switch
              checked={grid.border.radius.linked}
              onCheckedChange={(linked) => updateBorder({
                radius: linked
                  ? { ...grid.border.radius, linked, topRight: grid.border.radius.topLeft, bottomRight: grid.border.radius.topLeft, bottomLeft: grid.border.radius.topLeft }
                  : { ...grid.border.radius, linked }
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
            checked={grid.shadow.enabled}
            onCheckedChange={(enabled) => updateShadow({ enabled })}
          />
        </div>

        {grid.shadow.enabled && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Horizontal</Label>
                <Input
                  type="number"
                  value={grid.shadow.horizontal}
                  onChange={(e) => updateShadow({ horizontal: Number(e.target.value) })}
                  className="h-7 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Vertical</Label>
                <Input
                  type="number"
                  value={grid.shadow.vertical}
                  onChange={(e) => updateShadow({ vertical: Number(e.target.value) })}
                  className="h-7 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Blur</Label>
                <Input
                  type="number"
                  value={grid.shadow.blur}
                  onChange={(e) => updateShadow({ blur: Number(e.target.value) })}
                  className="h-7 text-xs"
                  min={0}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Spread</Label>
                <Input
                  type="number"
                  value={grid.shadow.spread}
                  onChange={(e) => updateShadow({ spread: Number(e.target.value) })}
                  className="h-7 text-xs"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Color</Label>
              <Input
                value={grid.shadow.color}
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
      <GridStyleTab 
        grid={grid}
        updateBackground={updateBackground}
        updateBorder={updateBorder}
        updateShadow={updateShadow}
      />
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
