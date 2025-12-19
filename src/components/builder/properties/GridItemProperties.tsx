import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResponsiveSlider } from '../controls/ResponsiveSlider';
import { GridItemSettings, ResponsiveValue } from '@/types/builder';
import { Grid3X3 } from 'lucide-react';

interface GridItemPropertiesProps {
  value: GridItemSettings | undefined;
  onChange: (value: GridItemSettings) => void;
}

const DEFAULT_GRID_ITEM: GridItemSettings = {
  columnSpan: { desktop: 1, tablet: 1, mobile: 1 },
  rowSpan: { desktop: 1, tablet: 1, mobile: 1 },
  alignSelf: 'auto',
  justifySelf: 'auto',
};

export function GridItemProperties({ value, onChange }: GridItemPropertiesProps) {
  const gridItem = value || DEFAULT_GRID_ITEM;

  const updateGridItem = (updates: Partial<GridItemSettings>) => {
    onChange({ ...gridItem, ...updates });
  };

  return (
    <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Grid3X3 className="h-4 w-4" />
        Grid Item Settings
      </div>

      {/* Column Span */}
      <ResponsiveSlider
        label="Column Span"
        value={gridItem.columnSpan}
        onChange={(columnSpan) => updateGridItem({ columnSpan })}
        min={1}
        max={12}
        step={1}
        showUnit={false}
      />

      {/* Row Span */}
      <ResponsiveSlider
        label="Row Span"
        value={gridItem.rowSpan}
        onChange={(rowSpan) => updateGridItem({ rowSpan })}
        min={1}
        max={6}
        step={1}
        showUnit={false}
      />

      {/* Align Self */}
      <div className="space-y-2">
        <Label className="text-xs">Align Self</Label>
        <Select
          value={gridItem.alignSelf}
          onValueChange={(v) => updateGridItem({ alignSelf: v as GridItemSettings['alignSelf'] })}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">Auto</SelectItem>
            <SelectItem value="start">Start</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="end">End</SelectItem>
            <SelectItem value="stretch">Stretch</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Justify Self */}
      <div className="space-y-2">
        <Label className="text-xs">Justify Self</Label>
        <Select
          value={gridItem.justifySelf}
          onValueChange={(v) => updateGridItem({ justifySelf: v as GridItemSettings['justifySelf'] })}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">Auto</SelectItem>
            <SelectItem value="start">Start</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="end">End</SelectItem>
            <SelectItem value="stretch">Stretch</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-[10px] text-muted-foreground">
        These settings control how this widget behaves inside a Grid Container parent.
      </p>
    </div>
  );
}
