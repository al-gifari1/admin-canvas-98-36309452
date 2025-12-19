import { useDragValue } from '@/hooks/useDragValue';
import { cn } from '@/lib/utils';
import { GripHorizontal, GripVertical } from 'lucide-react';

interface SpanResizeHandlesProps {
  columnSpan: number;
  rowSpan: number;
  maxColumns: number;
  maxRows: number;
  onColumnSpanChange: (span: number) => void;
  onRowSpanChange: (span: number) => void;
  isSelected: boolean;
}

export function SpanResizeHandles({
  columnSpan,
  rowSpan,
  maxColumns,
  maxRows,
  onColumnSpanChange,
  onRowSpanChange,
  isSelected,
}: SpanResizeHandlesProps) {
  const columnSpanHandle = useDragValue({
    value: columnSpan,
    min: 1,
    max: maxColumns,
    step: 1,
    onChange: onColumnSpanChange,
    direction: 'horizontal',
  });

  const rowSpanHandle = useDragValue({
    value: rowSpan,
    min: 1,
    max: maxRows,
    step: 1,
    onChange: onRowSpanChange,
    direction: 'vertical',
  });

  if (!isSelected) return null;

  const handleBaseClass = cn(
    'absolute bg-accent hover:bg-accent/80 transition-colors',
    'flex items-center justify-center text-[10px] font-medium text-accent-foreground',
    'select-none cursor-grab active:cursor-grabbing z-40 rounded shadow-sm'
  );

  return (
    <>
      {/* Column Span Handle - Right edge */}
      <div
        className={cn(
          handleBaseClass,
          'flex-col gap-0.5',
          columnSpanHandle.isDragging && 'bg-primary text-primary-foreground scale-110'
        )}
        style={{
          right: -6,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 12,
          height: 48,
        }}
        onMouseDown={columnSpanHandle.handleMouseDown}
        onTouchStart={columnSpanHandle.handleTouchStart}
        title={`Column span: ${columnSpan}`}
      >
        <GripVertical className="h-3 w-3" />
        <span>{columnSpan}</span>
      </div>

      {/* Row Span Handle - Bottom edge */}
      <div
        className={cn(
          handleBaseClass,
          'flex-row gap-0.5',
          rowSpanHandle.isDragging && 'bg-primary text-primary-foreground scale-110'
        )}
        style={{
          bottom: -6,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 48,
          height: 12,
        }}
        onMouseDown={rowSpanHandle.handleMouseDown}
        onTouchStart={rowSpanHandle.handleTouchStart}
        title={`Row span: ${rowSpan}`}
      >
        <GripHorizontal className="h-3 w-3" />
        <span>{rowSpan}</span>
      </div>

      {/* Corner Span Handle - Bottom-right corner (both directions) */}
      <div
        className={cn(
          'absolute bg-primary hover:bg-primary/90 transition-colors',
          'flex items-center justify-center',
          'select-none cursor-se-resize z-50 rounded-sm shadow-md'
        )}
        style={{
          right: -8,
          bottom: -8,
          width: 16,
          height: 16,
        }}
        title={`Span: ${columnSpan}×${rowSpan}`}
      >
        <div className="w-2 h-2 border-r-2 border-b-2 border-primary-foreground" />
      </div>

      {/* Visual feedback showing span area */}
      {(columnSpanHandle.isDragging || rowSpanHandle.isDragging) && (
        <div className="absolute inset-0 border-2 border-primary bg-primary/10 pointer-events-none z-30">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
            {columnSpan} × {rowSpan}
          </div>
        </div>
      )}
    </>
  );
}
