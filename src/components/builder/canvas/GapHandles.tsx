import { useDragValue } from '@/hooks/useDragValue';
import { cn } from '@/lib/utils';

interface GapHandlesProps {
  columnGap: number;
  rowGap: number;
  columns: number;
  onColumnGapChange: (gap: number) => void;
  onRowGapChange: (gap: number) => void;
  isSelected: boolean;
  minValue?: number;
  maxValue?: number;
}

export function GapHandles({
  columnGap,
  rowGap,
  columns,
  onColumnGapChange,
  onRowGapChange,
  isSelected,
  minValue = 0,
  maxValue = 60,
}: GapHandlesProps) {
  const columnGapHandle = useDragValue({
    value: columnGap,
    min: minValue,
    max: maxValue,
    step: 2,
    onChange: onColumnGapChange,
    direction: 'horizontal',
  });

  const rowGapHandle = useDragValue({
    value: rowGap,
    min: minValue,
    max: maxValue,
    step: 2,
    onChange: onRowGapChange,
    direction: 'vertical',
  });

  if (!isSelected || columns < 2) return null;

  const handleBaseClass = cn(
    'absolute bg-secondary hover:bg-secondary/80 transition-colors',
    'flex items-center justify-center text-[10px] font-medium text-secondary-foreground',
    'select-none cursor-grab active:cursor-grabbing z-30 rounded-sm'
  );

  // Generate column gap handles between columns
  const columnGapHandles = [];
  for (let i = 1; i < columns; i++) {
    const leftPercent = (i / columns) * 100;
    columnGapHandles.push(
      <div
        key={`col-gap-${i}`}
        className={cn(
          handleBaseClass,
          'flex-col',
          columnGapHandle.isDragging && 'bg-primary text-primary-foreground'
        )}
        style={{
          left: `calc(${leftPercent}% - ${columnGap / 2}px)`,
          top: '50%',
          transform: 'translateY(-50%)',
          width: Math.max(columnGap, 8),
          minWidth: 8,
          height: 32,
        }}
        onMouseDown={columnGapHandle.handleMouseDown}
        onTouchStart={columnGapHandle.handleTouchStart}
        title={`Column gap: ${columnGap}px`}
      >
        <div className="w-0.5 h-2 bg-current opacity-60" />
        {columnGap > 16 && <span className="mt-0.5">{columnGap}</span>}
        <div className="w-0.5 h-2 bg-current opacity-60" />
      </div>
    );
  }

  return (
    <>
      {/* Column Gap Handles */}
      {columnGapHandles}

      {/* Row Gap Handle (single, at bottom center) */}
      <div
        className={cn(
          handleBaseClass,
          'flex-row gap-1',
          rowGapHandle.isDragging && 'bg-primary text-primary-foreground'
        )}
        style={{
          left: '50%',
          bottom: -8,
          transform: 'translateX(-50%)',
          width: 60,
          height: Math.max(rowGap, 8),
          minHeight: 8,
        }}
        onMouseDown={rowGapHandle.handleMouseDown}
        onTouchStart={rowGapHandle.handleTouchStart}
        title={`Row gap: ${rowGap}px`}
      >
        <div className="h-0.5 w-2 bg-current opacity-60" />
        {rowGap > 16 && <span className="mx-1">{rowGap}</span>}
        <div className="h-0.5 w-2 bg-current opacity-60" />
      </div>

      {/* Visual feedback when dragging */}
      {(columnGapHandle.isDragging || rowGapHandle.isDragging) && (
        <div className="absolute inset-0 bg-primary/5 pointer-events-none z-20" />
      )}
    </>
  );
}
